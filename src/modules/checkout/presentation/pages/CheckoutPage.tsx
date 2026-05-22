import { Input, Label, Skeleton } from "@devhop/ui";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  MapPinIcon,
  PackageIcon,
  QrCodeIcon,
  TagIcon,
  TruckIcon,
  WalletIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { useCart } from "@/modules/cart/presentation/api/queries";
import { CustomerAuthGuard } from "@/modules/customer-auth/presentation/ui/CustomerAuthGuard";
import { ShopNavbar } from "@/modules/shop/presentation/ui/ShopNavbar";
import type {
  PaymentMethod,
  PlaceOrderDTO,
  ShippingType,
  ValidateCouponResponse,
} from "../../domain/contracts/checkout.contract";
import { usePlaceOrder, useValidateCoupon } from "../api/queries";

// ─── Constants ────────────────────────────────────────────────────────────────

const LAO_PROVINCES = [
  "ນະຄອນຫຼວງວຽງຈັນ",
  "ແຂວງວຽງຈັນ",
  "ແຂວງຜົ້ງສາລີ",
  "ແຂວງລວງນ້ຳທາ",
  "ແຂວງອຸດົມໄຊ",
  "ແຂວງບໍ່ແກ້ວ",
  "ແຂວງຫຼວງພະບາງ",
  "ແຂວງຫົວພັນ",
  "ແຂວງໄຊຍະບູລີ",
  "ແຂວງຊຽງຂວາງ",
  "ແຂວງບໍລິຄໍາໄຊ",
  "ແຂວງຄໍາມ່ວນ",
  "ແຂວງສາວັນນະເຂດ",
  "ແຂວງສາລະວັນ",
  "ແຂວງເຊກອງ",
  "ແຂວງຈໍາປາສັກ",
  "ແຂວງອັດຕະປື",
  "ແຂວງໄຊສົມບູນ",
];

const SHIPPING_PROVIDERS: {
  value: ShippingType;
  label: string;
  eta: string;
}[] = [
  { value: "RAIDER", label: "Raider", eta: "1-2 ວັນ" },
  { value: "ANOUSITH_EXPRESS", label: "Anousith Express", eta: "1-3 ວັນ" },
  { value: "HOUNGALOUN_EXPRESS", label: "Houngaloun Express", eta: "2-3 ວັນ" },
  { value: "MIXAY_EXPRESS", label: "Mixay Express", eta: "2-4 ວັນ" },
  { value: "UNITEL_EXPRESS", label: "Unitel Express", eta: "1-2 ວັນ" },
];

const SHIPPING_COST = 25000;

// ─── Format helper ────────────────────────────────────────────────────────────

function fmt(v: string | number) {
  return `${Number(v).toLocaleString("lo-LA")} ກີບ`;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h2 className="font-semibold">{title}</h2>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

// ─── Main checkout content ────────────────────────────────────────────────────

function CheckoutContent() {
  const nav = useNavigate();
  const { data: cart, isLoading: cartLoading } = useCart();
  const placeOrder = usePlaceOrder();
  const validateCoupon = useValidateCoupon();

  // Form state
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [address, setAddress] = useState("");
  const [shippingName, setShippingName] = useState<ShippingType>("RAIDER");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [note, setNote] = useState("");

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ValidateCouponResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Derived amounts
  const subtotal = Number(cart?.totalAmount ?? 0);
  const discount = appliedCoupon?.discount ?? 0;
  const total = subtotal + SHIPPING_COST - discount;

  // Empty cart redirect
  if (!cartLoading && (!cart || cart.items.length === 0)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <PackageIcon className="h-16 w-16 text-muted-foreground" />
        <p className="font-semibold text-lg">ກະຕ່າຍັງວ່າງ</p>
        <button
          type="button"
          onClick={() => nav({ to: "/shop" })}
          className="rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground text-sm hover:opacity-90"
        >
          ໄປເລືອກສິນຄ້າ
        </button>
      </div>
    );
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponError(null);
    setAppliedCoupon(null);
    try {
      const result = await validateCoupon.mutateAsync({
        code: couponInput.trim(),
        subtotal,
      });
      setAppliedCoupon(result);
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Coupon ບໍ່ຖືກຕ້ອງ");
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null);
    setCouponError(null);
    setCouponInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!recipientName || !recipientPhone || !province || !district || !address) {
      return;
    }

    const dto: PlaceOrderDTO = {
      recipientName,
      recipientPhone,
      province,
      district,
      village: village || undefined,
      address,
      shippingName,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      note: note || undefined,
    };

    const result = await placeOrder.mutateAsync(dto);

    if (result.paymentMethod === "QR" && result.qrString) {
      // QR payment → go to QR scan page (polls for PubNub confirmation)
      const params = new URLSearchParams({
        orderId: result.orderId,
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        qrString: result.qrString,
      });
      window.location.href = `/payment/qr?${params.toString()}`;
    } else {
      // COD → go straight to success page
      const params = new URLSearchParams({
        orderNumber: result.orderNumber,
        totalAmount: result.totalAmount,
        paymentMethod: result.paymentMethod,
      });
      window.location.href = `/checkout/success?${params.toString()}`;
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <ShopNavbar cartCount={0} />

      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => nav({ to: "/cart" })}
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            ກັບໄປກະຕ່າ
          </button>
          <h1 className="font-bold text-xl">ສຳເລັດການສັ່ງຊື້</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-5">
            {/* ── Left: Form ───────────────────────────────────────────────── */}
            <div className="space-y-5 lg:col-span-3">
              {/* Shipping Address */}
              <div className="rounded-2xl border bg-card p-5">
                <SectionHeader
                  icon={<MapPinIcon className="h-4 w-4" />}
                  title="ທີ່ຢູ່ຈັດສົ່ງ"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="ຊື່ຜູ້ຮັບ" required>
                    <Input
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="ຊື່ ແລະ ນາມສະກຸນ"
                      required
                    />
                  </Field>
                  <Field label="ເບີໂທ" required>
                    <Input
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="020 XXXX XXXX"
                      type="tel"
                      required
                    />
                  </Field>
                  <Field label="ແຂວງ" required>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">ເລືອກແຂວງ...</option>
                      {LAO_PROVINCES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="ເມືອງ" required>
                    <Input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="ຊື່ເມືອງ"
                      required
                    />
                  </Field>
                  <Field label="ບ້ານ">
                    <Input
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="ຊື່ບ້ານ (ຖ້າມີ)"
                    />
                  </Field>
                  <Field label="ທີ່ຢູ່ລະອຽດ" required>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="ເລກທີ່, ຖະໜົນ..."
                      required
                    />
                  </Field>
                </div>
              </div>

              {/* Shipping Provider */}
              <div className="rounded-2xl border bg-card p-5">
                <SectionHeader
                  icon={<TruckIcon className="h-4 w-4" />}
                  title="ຂົນສົ່ງ"
                />
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {SHIPPING_PROVIDERS.map((sp) => (
                    <button
                      key={sp.value}
                      type="button"
                      onClick={() => setShippingName(sp.value)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                        shippingName === sp.value
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-primary/40 hover:bg-muted/50"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          shippingName === sp.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <TruckIcon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sm">
                          {sp.label}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {sp.eta}
                        </p>
                      </div>
                      {shippingName === sp.value && (
                        <CheckCircleIcon className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border bg-card p-5">
                <SectionHeader
                  icon={<WalletIcon className="h-4 w-4" />}
                  title="ວິທີຊຳລະ"
                />
                <div className="grid grid-cols-2 gap-3">
                  {/* COD */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("COD")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      paymentMethod === "COD"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <WalletIcon
                      className={`h-7 w-7 ${paymentMethod === "COD" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="text-center">
                      <p className="font-semibold text-sm">ເກັບເງິນປາຍທາງ</p>
                      <p className="text-muted-foreground text-xs">COD</p>
                    </div>
                  </button>

                  {/* QR */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("QR")}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      paymentMethod === "QR"
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:border-primary/40 hover:bg-muted/50"
                    }`}
                  >
                    <QrCodeIcon
                      className={`h-7 w-7 ${paymentMethod === "QR" ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <div className="text-center">
                      <p className="font-semibold text-sm">ໂອນຜ່ານ QR</p>
                      <p className="text-muted-foreground text-xs">
                        BCEL / JDB / LDB
                      </p>
                    </div>
                  </button>
                </div>

                {/* QR info banner */}
                {paymentMethod === "QR" && (
                  <div className="mt-3 rounded-xl bg-blue-50 p-3 text-blue-700 text-xs dark:bg-blue-950/30 dark:text-blue-300">
                    📌 ຫຼັງຈາກສັ່ງຊື້, ສະແກນ QR Code ດ້ວຍ BCEL One / JDB / LDB — ລະບົບຈະຢືນຢັນອັດຕະໂນມັດທັນທີ
                  </div>
                )}
              </div>

              {/* Note */}
              <div className="rounded-2xl border bg-card p-5">
                <Field label="ໝາຍເຫດ (ບໍ່ບັງຄັບ)">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="ຂໍ້ຄວາມເພີ່ມເຕີມສຳລັບຜູ້ຂາຍ..."
                    rows={3}
                    className="flex min-h-[72px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </Field>
              </div>
            </div>

            {/* ── Right: Order Summary ──────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="sticky top-20 space-y-4">
                <div className="rounded-2xl border bg-card p-5">
                  <SectionHeader
                    icon={<PackageIcon className="h-4 w-4" />}
                    title="ສຳຫຼວດລາຍການ"
                  />

                  {/* Items */}
                  {cartLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cart?.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          {/* Image */}
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {item.productImage ? (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <PackageIcon className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-sm">
                              {item.productName}
                            </p>
                            {(item.colorName || item.size) && (
                              <p className="text-muted-foreground text-xs">
                                {[item.colorName, item.size]
                                  .filter(Boolean)
                                  .join(" / ")}
                              </p>
                            )}
                            <p className="text-muted-foreground text-xs">
                              ×{item.quantity}
                            </p>
                          </div>
                          {/* Price */}
                          <p className="shrink-0 font-semibold text-sm">
                            {fmt(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-4 border-t" />

                  {/* Coupon input */}
                  {appliedCoupon ? (
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-green-50 px-3 py-2.5 dark:bg-green-900/20">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <TagIcon className="h-4 w-4 shrink-0" />
                        <div>
                          <p className="font-semibold text-sm">{appliedCoupon.code}</p>
                          <p className="text-xs">ລົດ {fmt(appliedCoupon.discount)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="ml-2 rounded-md p-1 text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/40"
                        aria-label="ລຶບ coupon"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 space-y-1.5">
                      <div className="flex gap-2">
                        <Input
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); }
                          }}
                          placeholder="COUPON CODE"
                          className="font-mono text-sm uppercase"
                          disabled={validateCoupon.isPending}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponInput.trim() || validateCoupon.isPending}
                          className="shrink-0 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {validateCoupon.isPending ? "..." : "ໃຊ້"}
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-destructive text-xs">{couponError}</p>
                      )}
                    </div>
                  )}

                  {/* Amounts */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ລາຄາສິນຄ້າ</span>
                      <span>{fmt(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ຄ່າຂົນສົ່ງ</span>
                      <span>{fmt(SHIPPING_COST)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>ສ່ວນລົດ ({appliedCoupon?.code})</span>
                        <span>-{fmt(discount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="font-bold">ລວມທັງໝົດ</span>
                      <span className="font-bold text-primary text-xl">
                        {fmt(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={placeOrder.isPending || cartLoading}
                  className="w-full rounded-xl bg-primary py-4 font-bold text-base text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placeOrder.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      ກຳລັງດຳເນີນການ...
                    </span>
                  ) : (
                    "✓ ຢືນຢັນການສັ່ງຊື້"
                  )}
                </button>

                <p className="text-center text-muted-foreground text-xs">
                  ກົດຢືນຢັນ = ທ່ານຕົກລົງກັບເງື່ອນໄຂການສັ່ງຊື້
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export function CheckoutPage() {
  return (
    <CustomerAuthGuard redirectTo="/checkout">
      <CheckoutContent />
    </CustomerAuthGuard>
  );
}
