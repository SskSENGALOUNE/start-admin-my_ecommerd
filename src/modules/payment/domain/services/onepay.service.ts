/**
 * OnePay Service
 * - Generate txnRef (unique reference stored in EMV QR + PubNub uuid)
 * - Build EMV QR string via emv-qr.builder
 * - Derive PubNub channel ID from txnRef
 *
 * Ref: PAYMENT.md — Section 2, 3, 4
 */

import { nanoid } from "nanoid";
import { env } from "@/server/platform/config";
import { buildOnepayQr } from "./emv-qr.builder";

// ─── txnRef format ────────────────────────────────────────────────────────────

/**
 * Generate a unique transaction reference.
 * Format: ORD-{8-char nanoid}
 * This value is stored in:
 *   - EMV QR field 62.05
 *   - PubNub message "uuid" field (how we identify which order got paid)
 *   - transactions.transactionId in DB
 */
export function generateTxnRef(): string {
  return `ORD-${nanoid(8)}`;
}

// ─── PubNub channel ID ────────────────────────────────────────────────────────

/**
 * Derive PubNub channel name from txnRef.
 * Production: uuid-{MCID}-{txnRef}
 * Dev mode:   dev-{txnRef}
 *
 * Ref: PAYMENT.md — Section 2 "QR Channel Name Convention"
 */
export function getChannelId(txnRef: string): string {
  if (env.ONEPAY_ENABLED) {
    return `uuid-${env.ONEPAY_MCID}-${txnRef}`;
  }
  return `dev-${txnRef}`;
}

// ─── QR generation ────────────────────────────────────────────────────────────

export interface GenerateQrResult {
  txnRef: string;
  channelId: string;
  qrString: string; // EMV QR string → display as QR image on frontend
}

/**
 * Generate EMV QR code for an order.
 *
 * @param amount   Amount in LAK (integer)
 * @param orderId  Our order ID (stored in EMV field 62.01 as invoice ref)
 */
export function generateQr(amount: number, orderId: string): GenerateQrResult {
  const txnRef = generateTxnRef();
  const channelId = getChannelId(txnRef);

  // If PAYMENT_TEST_AMOUNT is set, override amount (for testing with 1 KIP)
  const effectiveAmount =
    env.PAYMENT_TEST_AMOUNT !== "" ? Number(env.PAYMENT_TEST_AMOUNT) : amount;

  const qrString = buildOnepayQr({
    mcid: env.ONEPAY_MCID,
    shopCode: env.ONEPAY_SHOPCODE,
    mcc: env.ONEPAY_MCC,
    terminalId: env.ONEPAY_TERMINAL_ID,
    amount: effectiveAmount,
    txnRef,
    orderId,
  });

  return { txnRef, channelId, qrString };
}
