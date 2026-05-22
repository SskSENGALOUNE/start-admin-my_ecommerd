import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircleIcon,
  CopyIcon,
  QrCodeIcon,
  ShoppingBagIcon,
  WalletIcon,
} from "lucide-react";
import { useState } from "react";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="ml-2 flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs hover:bg-muted"
    >
      <CopyIcon className="h-3 w-3" />
      {copied ? "ຄັດລອກແລ້ວ!" : "ຄັດລອກ"}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CheckoutSuccessPage() {
  const nav = useNavigate();

  // Read search params from URL directly (avoids TanStack Router type issues)
  const params = new URLSearchParams(window.location.search);
  const orderNumber = params.get("orderNumber") ?? undefined;
  const totalAmount = params.get("totalAmount") ?? undefined;
  const paymentMethod = params.get("paymentMethod") ?? undefined;
  const isQR = paymentMethod === "QR";

  return (
    <div className="min-h-screen bg-muted/30">
      <ShopNavbar cartCount={0} />

      <main className="mx-auto max-w-lg px-4 py-12">
        {/* Success card */}
        <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircleIcon className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="mb-1 font-bold text-2xl">ສັ່ງຊື້ສຳເລັດ! 🎉</h1>
          <p className="text-muted-foreground text-sm">ຂອບໃຈທີ່ໃຊ້ບໍລິການ LaoShop</p>

          {/* Order details */}
          <div className="my-6 rounded-xl bg-muted/50 p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">ລະຫັດຄຳສັ່ງຊື້</span>
              <div className="flex items-center">
                <span className="font-bold font-mono">
                  {orderNumber ?? "—"}
                </span>
                {orderNumber && <CopyButton text={orderNumber} />}
              </div>
            </div>
            {totalAmount && (
              <div className="mt-2 flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">ຍອດຊຳລະ</span>
                <span className="font-bold text-primary">
                  {fmt(totalAmount)}
                </span>
              </div>
            )}
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="text-muted-foreground">ວິທີຊຳລະ</span>
              <span className="flex items-center gap-1.5 font-medium">
                {isQR ? (
                  <>
                    <QrCodeIcon className="h-4 w-4" /> ໂອນ QR
                  </>
                ) : (
                  <>
                    <WalletIcon className="h-4 w-4" /> ເກັບປາຍທາງ (COD)
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Payment instructions */}
          {isQR ? (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-left dark:border-green-800 dark:bg-green-950/30">
              <p className="mb-2 flex items-center gap-2 font-semibold text-green-700 text-sm dark:text-green-300">
                <QrCodeIcon className="h-4 w-4" />
                ລະບົບຢືນຢັນການຊຳລະສຳເລັດ
              </p>
              <p className="text-green-700 text-xs dark:text-green-300">
                ການຊຳລະຜ່ານ <strong>BCEL One</strong> ຂອງທ່ານໄດ້ຮັບການຢືນຢັນໂດຍອັດຕະໂນມັດ — ຄຳສັ່ງຊື້ຈະຖືກດຳເນີນການໃນໄວໆນີ້
              </p>
            </div>
          ) : (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-left dark:border-green-800 dark:bg-green-950/30">
              <p className="mb-2 flex items-center gap-2 font-semibold text-green-700 text-sm dark:text-green-300">
                <WalletIcon className="h-4 w-4" />
                ເກັບເງິນປາຍທາງ (COD)
              </p>
              <p className="text-green-700 text-xs dark:text-green-300">
                ທ່ານຈ່າຍເງິນໃຫ້ຄົນສົ່ງໂດຍກົງ{" "}
                <strong>{totalAmount ? fmt(totalAmount) : ""}</strong> ເມື່ອຮັບສິນຄ້າ
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => nav({ to: "/shop" })}
              className="flex items-center justify-center gap-2 rounded-xl border py-3 font-medium text-sm hover:bg-muted"
            >
              <ShoppingBagIcon className="h-4 w-4" />
              ໄປຊື້ຕໍ່
            </button>
            <button
              type="button"
              onClick={() => nav({ to: "/shop" })}
              className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground text-sm hover:opacity-90"
            >
              ຕິດຕາມຄຳສັ່ງຊື້
            </button>
          </div>

          <p className="mt-4 text-muted-foreground text-xs">
            ຖ້າມີຄຳຖາມ ຕິດຕໍ່ WhatsApp: <strong>020 XXXX XXXX</strong>
          </p>
        </div>
      </main>
    </div>
  );
}
