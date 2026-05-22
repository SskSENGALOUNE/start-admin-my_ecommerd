export const Permissions = {
  users: {
    create: "users:create",
    read: "users:read",
    update: "users:update",
    delete: "users:delete",
    ban: "users:ban",
  },
  audit: {
    read: "audit:read",
  },
  categories: {
    create: "categories:create",
    read: "categories:read",
    update: "categories:update",
    delete: "categories:delete",
  },
  banners: {
    create: "banners:create",
    read: "banners:read",
    update: "banners:update",
    delete: "banners:delete",
  },
  products: {
    create: "products:create",
    read: "products:read",
    update: "products:update",
    delete: "products:delete",
  },
  coupons: {
    create: "coupons:create",
    read: "coupons:read",
    update: "coupons:update",
    delete: "coupons:delete",
  },
  customers: {
    read: "customers:read",
    update: "customers:update",
  },
  orders: {
    read: "orders:read",
    update: "orders:update",
  },
  shipments: {
    read: "shipments:read",
    update: "shipments:update",
  },
  transactions: {
    read: "transactions:read",
    update: "transactions:update",
  },
} as const;

export const ALL_PERMISSIONS = Object.entries(Permissions).flatMap(
  ([resource, actions]) =>
    Object.entries(actions).map(([action, id]) => ({ id, resource, action })),
);

export type PermissionId = (typeof ALL_PERMISSIONS)[number]["id"];

// Human-friendly labels for rendering in UI
export const RESOURCE_LABELS: Record<string, string> = {
  users: "ຜູ້ໃຊ້",
  audit: "ບັນທຶກການກວດກາ",
  categories: "ໝວດໝູ່ສິນຄ້າ",
  banners: "ແບນເນີ",
  products: "ສິນຄ້າ",
  coupons: "ໂຄໂປ",
  customers: "ລູກຄ້າ",
  orders: "ຄຳສັ່ງຊື້",
  shipments: "ການຈັດສົ່ງ",
  transactions: "ການຊຳລະເງິນ",
};

export const ACTION_LABELS: Record<string, string> = {
  create: "ສ້າງ",
  read: "ເບິ່ງ",
  update: "ແກ້ໄຂ",
  delete: "ລຶບ",
  ban: "ລະງັບ",
  all: "ທັງໝົດ",
};

export function getResourceLabel(resource: string): string {
  return RESOURCE_LABELS[resource] ?? resource;
}

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

export function getPermissionLabel(id: PermissionId): string {
  const [resource, action] = (id as string).split(":");
  return `${getActionLabel(action ?? "")} ${getResourceLabel(resource ?? "")}`;
}

export function getPermissionLabels(ids: PermissionId[]): string[] {
  return ids.map((id) => getPermissionLabel(id));
}
