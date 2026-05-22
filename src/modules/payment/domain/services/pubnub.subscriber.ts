/**
 * PubNub Payment Subscriber
 *
 * - Subscribes to OnePay payment channels
 * - Handles incoming payment confirmation messages
 * - Updates transaction & order status in DB
 * - Re-subscribes PENDING transactions on startup (crash-safe)
 *
 * Ref: PAYMENT.md — Section 3, 5
 */

import { and, eq } from "drizzle-orm";
import PubNub from "pubnub";
import { env } from "@/server/platform/config";
import { db, schema } from "@/server/platform/db/client";
import { getChannelId } from "./onepay.service";

// ─── PubNub message shape from OnePay ────────────────────────────────────────

interface OnepayMessage {
  uuid: string; // our txnRef (stored in transactions.transactionId)
  ticket: string; // bank's transaction ID
  amount: number; // amount paid in KIP
  name: string; // sender name
  phone: string; // sender phone
}

// ─── Singleton PubNub client ──────────────────────────────────────────────────

let pubnubClient: PubNub | null = null;

function getPubNub(): PubNub | null {
  if (!env.ONEPAY_PUBNUB_SUBSCRIBE_KEY) return null;

  if (!pubnubClient) {
    pubnubClient = new PubNub({
      subscribeKey: env.ONEPAY_PUBNUB_SUBSCRIBE_KEY,
      uuid: `laoshop-backend-${Date.now()}`,
    });
  }
  return pubnubClient;
}

// ─── Payment confirmation handler ─────────────────────────────────────────────

/**
 * Called when OnePay publishes payment success to PubNub.
 * Updates transaction → COMPLETED, order → CONFIRMED
 */
export async function handlePaymentConfirmed(msg: OnepayMessage): Promise<void> {
  const txnRef = msg.uuid;
  console.info(
    `[PubNub] Payment received — txnRef: ${txnRef}, ticket: ${msg.ticket}`,
  );

  try {
    // 1. Find transaction by txnRef
    const [txn] = await db
      .select({
        id: schema.transactions.id,
        orderRef: schema.transactions.orderRef,
      })
      .from(schema.transactions)
      .where(eq(schema.transactions.transactionId, txnRef))
      .limit(1);

    if (!txn) {
      console.warn(`[PubNub] No transaction found for txnRef: ${txnRef}`);
      return;
    }

    // Idempotency: skip if already COMPLETED
    const [existing] = await db
      .select({ status: schema.transactions.status })
      .from(schema.transactions)
      .where(eq(schema.transactions.id, txn.id))
      .limit(1);

    if (existing?.status === "COMPLETED") {
      console.info(`[PubNub] Already COMPLETED — skipping: ${txnRef}`);
      return;
    }

    // 2. Atomic DB update inside transaction
    await db.transaction(async (tx) => {
      // Update transaction: COMPLETED + store bank data
      await tx
        .update(schema.transactions)
        .set({
          status: "COMPLETED",
          bankType: "BCEL", // OnePay always goes through BCEL
          bankRequest: msg.ticket,
          bankResponse: JSON.stringify(msg),
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(schema.transactions.id, txn.id));

      // Update order: PENDING → CONFIRMED
      await tx
        .update(schema.orders)
        .set({ status: "CONFIRMED", updatedAt: new Date() })
        .where(eq(schema.orders.id, txn.orderRef));
    });

    console.info(
      `[PubNub] ✅ Payment confirmed — order ${txn.orderRef} → CONFIRMED`,
    );
  } catch (err) {
    console.error("[PubNub] Error processing payment:", err);
  }
}

// ─── Subscribe ────────────────────────────────────────────────────────────────

/** Subscribe to a specific PubNub channel for a txnRef */
export function subscribeChannel(txnRef: string): void {
  const pn = getPubNub();
  if (!pn) {
    console.info("[PubNub] Not configured — skip subscribe (dev mode)");
    return;
  }

  const channelId = getChannelId(txnRef);
  console.info(`[PubNub] Subscribing channel: ${channelId}`);

  pn.subscribe({ channels: [channelId] });
}

// ─── Message listener ─────────────────────────────────────────────────────────

/** Start the global PubNub message listener (call once at server startup) */
export function startPubNubListener(): void {
  const pn = getPubNub();
  if (!pn) {
    console.info(
      "[PubNub] ONEPAY_PUBNUB_SUBSCRIBE_KEY not set — listener not started",
    );
    return;
  }

  pn.addListener({
    message: (event) => {
      try {
        const msg = event.message as unknown as OnepayMessage;
        if (msg?.uuid && msg?.ticket) {
          handlePaymentConfirmed(msg).catch((e) =>
            console.error("[PubNub] Unhandled error:", e),
          );
        }
      } catch (e) {
        console.error("[PubNub] Failed to parse message:", e);
      }
    },
    status: (status) => {
      console.info(`[PubNub] Status: ${status.category}`);
    },
  });

  console.info("[PubNub] Listener started");
}

// ─── Re-subscribe on startup ──────────────────────────────────────────────────

/**
 * Re-subscribe all PENDING QR transactions on server startup.
 * Prevents missing payments if server restarted while transaction was in flight.
 *
 * Ref: PAYMENT.md — "Re-subscribe หลัง Server Restart"
 */
export async function resubscribePendingTransactions(): Promise<void> {
  const pn = getPubNub();
  if (!pn) return;

  try {
    const pending = await db
      .select({
        transactionId: schema.transactions.transactionId,
      })
      .from(schema.transactions)
      // Only QR transactions need PubNub — COD txnRef starts with "COD-"
      .where(
        and(
          eq(schema.transactions.status, "PENDING"),
          eq(schema.transactions.paymentMethod, "QR"),
        ),
      );

    if (pending.length === 0) return;

    const channels = pending.map((t) => getChannelId(t.transactionId));
    pn.subscribe({ channels });

    console.info(
      `[PubNub] Re-subscribed ${channels.length} pending transaction(s)`,
    );
  } catch (err) {
    console.error("[PubNub] Re-subscribe failed:", err);
  }
}
