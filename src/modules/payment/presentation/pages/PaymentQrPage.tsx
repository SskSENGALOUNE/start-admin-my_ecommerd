import { useNavigate } from "@tanstack/react-router";
import { CheckCircleIcon, ClockIcon, RefreshCwIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
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
  };
}

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

// ─── Poll interval ────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000; // poll every 3 seconds

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PaymentQrPage() {
  const nav = useNavigate();
  const { orderId, orderNumber, totalAmount, qrString } = useQrParams();

  const [isPaid, setIsPaid] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll payment status ───────────────────────────────────────────────────

  async function checkStatus() {
    if (!orderId) return;
    try {
      const s = await paymentApi.getStatus(orderId);
      if (s.isPaid) {
        setIsPaid(true);
        setIsPolling(false);
        if (intervalRef.current) clearInterval(intervalRef.current);

        // Navigate to success page after short delay
        setTimeout(() => {
          const params = new URLSearchParams({
            orderNumber,
            totalAmount,
            paymentMethod: "QR",
          });
          window.location.href = `/checkout/success?${params.toString()}`;
        }, 2000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "ບໍ່ສາມາດກວດສອບໄດ້");
    }
  }

  useEffect(() => {
    if (!orderId) return;

    // Check immediately on mount
    checkStatus();

    // Then poll every 3 seconds
    intervalRef.current = setInterval(checkStatus, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [orderId]);

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
          ) : (
            <>
              {/* Header */}
              <div className="mb-5">
                <h1 className="font-bold text-lg">ສະແກນ QR ເພື່ອຊຳລະ</h1>
                <p className="mt-1 text-muted-foreground text-sm">
                  ໃຊ້ BCEL One / JDB / LDB app ສະແກນ
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
                  <span className="font-bold text-primary">
                    {fmt(totalAmount)}
                  </span>
                </div>
              </div>

              {/* QR Code */}
              {qrString ? (
                <div className="mb-5 flex justify-center">
                  <div className="rounded-2xl bg-white p-4 shadow-md">
                    <QRCode
                      value={qrString}
                      size={220}
                      level="M"
                      fgColor="#000000"
                      bgColor="#ffffff"
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-5 flex h-[252px] items-center justify-center rounded-2xl bg-muted">
                  <p className="text-muted-foreground text-sm">ໂຫຼດ QR ບໍ່ໄດ້</p>
                </div>
              )}

              {/* BCEL OnePay logo hint */}
              <div className="mb-5 rounded-xl bg-blue-50 px-3 py-2.5 text-blue-700 text-xs dark:bg-blue-950/30 dark:text-blue-300">
                🏦 ຮອງຮັບ: <strong>BCEL One</strong> · <strong>JDB</strong> ·{" "}
                <strong>LDB</strong>
              </div>

              {/* Polling status */}
              {error ? (
                <div className="flex items-center justify-center gap-2 text-destructive text-sm">
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      checkStatus();
                    }}
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

          {/* Cancel link */}
          {!isPaid && (
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
