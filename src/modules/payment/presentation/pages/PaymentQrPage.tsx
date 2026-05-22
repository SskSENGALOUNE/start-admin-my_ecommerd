import { useNavigate } from "@tanstack/react-router";
import { CheckCircleIcon, ClockIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { QRCode } from "react-qr-code";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";
import { paymentApi } from "../api/client";

// ─── Read params from URL ─────────────────────────────────────────────────────

function useQrParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    orderId: p.get("orderId") ?? "",
    orderNumber: p.get("orderNumber") ?? "",
    totalAmount: p.get("totalAmount") ?? "0",
    qrString: p.get("qrString") ?? "",
    channelId: p.get("channelId") ?? "",
  };
}

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000;
const QR_EXPIRE_SECS = 120; // 2 minutes

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PaymentQrPage() {
  const nav = useNavigate();
  const { orderId, orderNumber, totalAmount, qrString: initialQrString, channelId } = useQrParams();

  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [isExpired, setIsExpired] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QR_EXPIRE_SECS);
  const [error, setError] = useState<string | null>(null);
  const [qrString, setQrString] = useState(initialQrString);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // biome-ignore lint/suspicious/noExplicitAny: PubNub loaded dynamically
  const pubnubRef = useRef<any>(null);

  // ── Refresh QR (expired state) ───────────────────────────────────────────

  async function handleRefreshQr() {
    if (!orderId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const result = await paymentApi.refreshQr(orderId);
      setQrString(result.qrString);
      setIsExpired(false);
      setIsPolling(true);
      setTimeLeft(QR_EXPIRE_SECS);
    } catch {
      setError("ສ້າງ QR ໃໝ່ບໍ່ໄດ້ — ກະລຸນາລອງໃໝ່");
    } finally {
      setIsRefreshing(false);
    }
  }

  // ── Handle payment confirmed ─────────────────────────────────────────────

  function onPaymentConfirmed() {
    setIsPaid(true);
    setIsPolling(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    pubnubRef.current?.unsubscribeAll();

    setTimeout(() => {
      const params = new URLSearchParams({
        orderNumber,
        totalAmount,
        paymentMethod: "QR",
      });
      window.location.href = `/checkout/success?${params.toString()}`;
    }, 2000);
  }

  // ── Poll payment status ───────────────────────────────────────────────────

  async function checkStatus() {
    if (!orderId) return;
    try {
      const s = await paymentApi.getStatus(orderId);
      if (s.isPaid) onPaymentConfirmed();
    } catch (e) {
      setError(e instanceof Error ? e.message : "ບໍ່ສາມາດກວດສອບໄດ້");
    }
  }

  // ── PubNub subscription ───────────────────────────────────────────────────

  useEffect(() => {
    if (!channelId || isPaid) return;

    paymentApi.getPubKey().then(({ subscribeKey }) => {
      if (!subscribeKey || !channelId) return;

      return import("pubnub").then(({ default: PubNub }) => {
        const pn = new PubNub({ subscribeKey, uuid: `customer-${orderId}` });
        pubnubRef.current = pn;
        pn.addListener({ message: () => checkStatus() });
        pn.subscribe({ channels: [channelId] });
      });
    }).catch(() => {
      // PubNub not configured — polling will handle it
    });

    return () => {
      pubnubRef.current?.unsubscribeAll();
    };
  }, [channelId, orderId]);

  // ── Poll fallback ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!orderId) return;
    checkStatus();
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

  // ── Countdown timer ───────────────────────────────────────────────────────

  useEffect(() => {
    if (isPaid) return;
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current!);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsPolling(false);
          setIsExpired(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [isPaid]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-muted/30">
      <ShopNavbar cartCount={0} />

      <main className="mx-auto max-w-sm px-4 py-10">
        <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">

          {/* ── PAID state ── */}
          {isPaid ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircleIcon className="h-9 w-9 text-green-600" />
              </div>
              <h2 className="font-bold text-green-700 text-xl dark:text-green-400">
                ຊຳລະເງິນສຳເລັດ!
              </h2>
              <p className="text-muted-foreground text-sm">
                ກຳລັງໂອນໄປໜ້າຢືນຢັນ...
              </p>
            </div>

          ) : isExpired ? (
            /* ── EXPIRED state ── */
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ClockIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="font-bold text-lg">QR ໝົດອາຍຸແລ້ວ</h2>
              <p className="text-muted-foreground text-sm">
                ກົດ "ສ້າງ QR ໃໝ່" ເພື່ອຊຳລະໂດຍບໍ່ຕ້ອງສັ່ງຊື້ໃໝ່
              </p>
              <button
                type="button"
                onClick={handleRefreshQr}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground text-sm hover:opacity-90 disabled:opacity-50"
              >
                <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "ກຳລັງສ້າງ..." : "ສ້າງ QR ໃໝ່"}
              </button>
              <button
                type="button"
                onClick={() => nav({ to: "/checkout" })}
                className="text-muted-foreground text-xs underline-offset-2 hover:underline"
              >
                ຫຼື ສັ່ງຊື້ໃໝ່ທັງໝົດ
              </button>
            </div>

          ) : (
            <>
              {/* Header */}
              <div className="mb-5">
                <h1 className="font-bold text-lg">ສະແກນ QR ເພື່ອຊຳລະ</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  ໃຊ້ <strong>BCEL One</strong> ສະແກນ
                </p>
              </div>

              {/* Order info */}
              <div className="mb-5 rounded-xl bg-muted/50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ລະຫັດຄຳສັ່ງຊື້</span>
                  <span className="font-bold font-mono">{orderNumber}</span>
                </div>
                <div className="mt-1.5 flex justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">ຍອດຊຳລະ</span>
                  <span className="font-bold text-primary">{fmt(totalAmount)}</span>
                </div>
              </div>

              {/* QR Code */}
              {qrString ? (
                <div className="mb-4 flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-white p-4 shadow-md">
                    <QRCode value={qrString} size={220} level="M" fgColor="#000000" bgColor="#ffffff" />
                  </div>

                  {/* Countdown bar */}
                  <div className="w-full space-y-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          timeLeft <= 30 ? "bg-destructive" : timeLeft <= 60 ? "bg-yellow-500" : "bg-primary"
                        }`}
                        style={{ width: `${(timeLeft / QR_EXPIRE_SECS) * 100}%` }}
                      />
                    </div>
                    <p className={`text-xs font-medium ${timeLeft <= 30 ? "text-destructive" : "text-muted-foreground"}`}>
                      QR ໝົດອາຍຸໃນ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")} ນາທີ
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-5 flex h-[252px] items-center justify-center rounded-2xl bg-muted">
                  <p className="text-muted-foreground text-sm">ໂຫຼດ QR ບໍ່ໄດ້</p>
                </div>
              )}

              {/* Bank hint */}
              <div className="mb-4 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-700 text-xs dark:bg-blue-950/30 dark:text-blue-300">
                🏦 ຮອງຮັບ: <strong>BCEL One</strong>
              </div>

              {/* DEV ONLY — simulate payment button */}
              {import.meta.env.DEV && orderId && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await paymentApi.devSimulate(orderId);
                      await checkStatus();
                    } catch {
                      setError("simulate ລົ້ມເຫຼວ");
                    }
                  }}
                  className="mb-3 w-full rounded-xl border border-dashed border-yellow-400 bg-yellow-50 py-2 text-xs font-medium text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400"
                >
                  🧪 [DEV] ຈຳລອງການຊຳລະ
                </button>
              )}

              {/* Polling status */}
              {error ? (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => { setError(null); checkStatus(); }}
                    className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-muted"
                  >
                    <RefreshCwIcon className="h-3 w-3" /> ລອງໃໝ່
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                  {isPolling && <ClockIcon className="h-4 w-4 animate-pulse" />}
                  <span>{isPolling ? "ກຳລັງລໍຖ້າການຊຳລະ..." : "ຢຸດກວດສອບ"}</span>
                </div>
              )}
            </>
          )}

          {/* Cancel */}
          {!isPaid && !isExpired && (
            <button
              type="button"
              onClick={() => nav({ to: "/shop" })}
              className="mt-5 text-muted-foreground text-xs underline-offset-2 hover:underline"
            >
              ຍົກເລີກ / ກັບໜ້າຮ້ານ
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
