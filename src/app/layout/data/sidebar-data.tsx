import {
  AudioWaveform,
  Command,
  CreditCard,
  GalleryVerticalEnd,
  ImagePlay,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingCart,
  Tag,
  UserCog,
  Users,
  UsersRound,
} from "lucide-react";
import type { SidebarData } from "../types";

export const sidebarData: SidebarData = {
  teams: [
    {
      name: "Shadcn Admin",
      logo: Command,
      plan: "Vite + ShadcnUI",
    },
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
  ],
  navGroups: [
    {
      title: "ທົ່ວໄປ",
      items: [
        {
          title: "ແຜງຄວບຄຸມ",
          url: "/app/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "ການຄວບຄຸມການເຂົ້າເຖິງ",
      items: [
        {
          title: "ບົດບາດ",
          url: "/app/roles",
          icon: UserCog,
          requiredPermissions: ["users:read"],
        },
        {
          title: "ຜູ້ໃຊ້",
          url: "/app/users",
          icon: Users,
          requiredPermissions: ["users:read"],
        },
        {
          title: "ບັນທຶກການກວດກາ",
          url: "/app/audit",
          icon: ShieldCheck,
          requiredPermissions: ["audit:read"],
        },
      ],
    },
    {
      title: "eCommerce",
      items: [
        {
          title: "ໝວດໝູ່ສິນຄ້າ",
          url: "/app/categories",
          icon: Tag,
          requiredPermissions: ["categories:read"],
        },
        {
          title: "ສິນຄ້າ",
          url: "/app/products",
          icon: Package,
          requiredPermissions: ["products:read"],
        },
        {
          title: "ລູກຄ້າ",
          url: "/app/customers",
          icon: UsersRound,
          requiredPermissions: ["customers:read"],
        },
        {
          title: "ຄຳສັ່ງຊື້",
          url: "/app/orders",
          icon: ShoppingCart,
          requiredPermissions: ["orders:read"],
        },
        {
          title: "ລາຍການໂອນ",
          url: "/app/transactions",
          icon: CreditCard,
          requiredPermissions: ["transactions:read"],
        },
        {
          title: "Banner",
          url: "/app/banners",
          icon: ImagePlay,
          requiredPermissions: ["banners:read"],
        },
      ],
    },
  ],
};
