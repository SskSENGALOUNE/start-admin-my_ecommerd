import { useNavigate } from "@tanstack/react-router";
import {
  HeadphonesIcon,
  PackageIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  TruckIcon,
  ZapIcon,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: TruckIcon,
    title: "ຈັດສົ່ງທົ່ວລາວ",
    desc: "ຮ່ວມມືກັບຂົນສົ່ງຊັ້ນນຳ RAIDER, Anousith, Houngaloun ແລະ ອື່ນໆ",
  },
  {
    icon: ShieldCheckIcon,
    title: "ຊຳລະເງິນປອດໄພ",
    desc: "ຮອງຮັບ QR Code ຜ່ານ BCEL, JDB, LDB ແລະ ເກັບເງິນປາຍທາງ (COD)",
  },
  {
    icon: PackageIcon,
    title: "ສິນຄ້າຄຸນນະພາບ",
    desc: "ສິນຄ້າຄັດສັນມາຢ່າງດີ ຫຼາກຫຼາຍປະເພດ ທຸກໝວດໝູ່",
  },
  {
    icon: HeadphonesIcon,
    title: "ບໍລິການ 24/7",
    desc: "ທີມງານພ້ອມໃຫ້ຄຳປຶກສາ ແລະ ແກ້ໄຂບັນຫາຕະຫຼອດ",
  },
  {
    icon: ZapIcon,
    title: "ສັ່ງງ່າຍ ໄວທັນໃຈ",
    desc: "ລະບົບສັ່ງຊື້ງ່າຍດາຍ ຮູ້ຜົນທັນທີ ບໍ່ຕ້ອງລໍຖ້ານາ",
  },
  {
    icon: ShoppingBagIcon,
    title: "Coupon & ໂປຣໂມຊັ່ນ",
    desc: "ຫຼຸດລາຄາທຸກເດືອນ ຊື້ຫຼາຍປະຫຍັດຫຼາຍ",
  },
];

const STATS = [
  { value: "1,000+", label: "ລາຍການສິນຄ້າ" },
  { value: "500+", label: "ລູກຄ້າທັງໝົດ" },
  { value: "50+", label: "ໝວດໝູ່ສິນຄ້າ" },
  { value: "99%", label: "ຄວາມພໍໃຈ" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function HomePage() {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <ShoppingBagIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">LaoShop</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium sm:flex">
            <button type="button" onClick={() => nav({ to: "/shop" })} className="text-muted-foreground hover:text-foreground transition-colors">ສິນຄ້າ</button>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">ກ່ຽວກັບ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => nav({ to: "/customer/login" })}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
            >
              ເຂົ້າສູ່ລະບົບ
            </button>
            <button
              type="button"
              onClick={() => nav({ to: "/customer/register" })}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              ສະໝັກຟຣີ
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
        {/* decorative circles */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-primary/5" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/8" />

        <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:py-32">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            ເປີດໃຫ້ບໍລິການແລ້ວ
          </div>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            ຮ້ານຄ້າອອນລາຍ
            <br />
            <span className="text-primary">ສຳຫຼັບຄົນລາວ</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            ສັ່ງຊື້ສິນຄ້າຄຸນນະພາບ ຊຳລະຜ່ານ QR Bank ຫຼື COD
            ຈັດສົ່ງທົ່ວທຸກແຂວງໃນລາວ ໄວ ສະດວກ ໝັ້ນໃຈ
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => nav({ to: "/shop" })}
              className="w-full rounded-xl bg-primary px-8 py-3 text-base font-semibold text-primary-foreground shadow-lg transition-opacity hover:opacity-90 sm:w-auto"
            >
              ເລີ່ມຊື້ເລີຍ →
            </button>
            <button
              type="button"
              onClick={() => nav({ to: "/customer/register" })}
              className="w-full rounded-xl border px-8 py-3 text-base font-semibold transition-colors hover:bg-muted sm:w-auto"
            >
              ສະໝັກສະມາຊິກ ຟຣີ
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section id="stats" className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">ເປັນຫຍັງຕ້ອງເລືອກພວກເຮົາ?</h2>
          <p className="mt-3 text-muted-foreground">ບໍລິການຄົບຄ້ວນ ສ້າງປະສົບການຊື້ຂາຍທີ່ດີ</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="mx-4 mb-20 overflow-hidden rounded-3xl bg-primary">
        <div className="relative px-8 py-14 text-center">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute bottom-0 left-8 h-28 w-28 rounded-full bg-white/5" />
          <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            ພ້ອມຊື້ແລ້ວ?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            ສ້າງບັນຊີ ຫຼື ເຂົ້າສູ່ລະບົບ ເພື່ອເລີ່ມຊື້ສິນຄ້າ
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => nav({ to: "/customer/register" })}
              className="rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary shadow-lg transition-opacity hover:opacity-90"
            >
              ສະໝັກສະມາຊິກ ຟຣີ
            </button>
            <button
              type="button"
              onClick={() => nav({ to: "/customer/login" })}
              className="rounded-xl border border-white/40 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              ເຂົ້າສູ່ລະບົບ
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
          <div className="mb-2 flex items-center justify-center gap-2 font-semibold text-foreground">
            <ShoppingBagIcon className="h-4 w-4 text-primary" />
            LaoShop
          </div>
          <p>© {new Date().getFullYear()} LaoShop. ສະຫງວນລິຂະສິດ.</p>
          <p className="mt-2">
            <button
              type="button"
              onClick={() => nav({ to: "/auth/login" })}
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              Admin Panel
            </button>
          </p>
        </div>
      </footer>

    </div>
  );
}
