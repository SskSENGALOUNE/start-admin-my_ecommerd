import { nanoid } from "nanoid";
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const colorTypeEnum = pgEnum("color_type", [
  "RED",
  "GREEN",
  "BLUE",
  "YELLOW",
  "BLACK",
  "WHITE",
  "GRAY",
  "PURPLE",
  "ORANGE",
  "PINK",
  "BROWN",
  "GOLD",
  "SILVER",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const bankTypeEnum = pgEnum("bank_type", ["BCEL", "JDB", "LDB"]);

export const shippingTypeEnum = pgEnum("shipping_type", [
  "RAIDER",
  "ANOUSITH_EXPRESS",
  "HOUNGALOUN_EXPRESS",
  "MIXAY_EXPRESS",
  "UNITEL_EXPRESS",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["QR", "COD"]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
]);

export const couponTypeEnum = pgEnum("coupon_type", [
  "PERCENTAGE",
  "FIXED_AMOUNT",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

// ── customers ─────────────────────────────────────────────────────────────────
export const customers = pgTable(
  "customers",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    email: text("email").notNull().unique(),
    password: text("password"),
    name: text("name").notNull(),
    phone: text("phone"),
    supabaseId: text("supabase_id").unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [index("customers_email_idx").on(t.email)],
);

// ── banners ───────────────────────────────────────────────────────────────────
export const banners = pgTable(
  "banners",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    linkUrl: text("link_url"),
    isActive: boolean("is_active").notNull().default(true),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("banners_active_order_idx").on(t.isActive, t.order),
  ],
);

// ── categories ────────────────────────────────────────────────────────────────
export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
});

// ── colors ────────────────────────────────────────────────────────────────────
export const colors = pgTable("colors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  color: colorTypeEnum("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// ── products ──────────────────────────────────────────────────────────────────
export const products = pgTable(
  "products",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text("name").notNull(),
    description: text("description"),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    categoryId: text("category_id").references(() => categories.id),
    isActive: boolean("is_active").notNull().default(true),
    quantity: integer("quantity").notNull().default(0),
    reservedQty: integer("reserved_qty").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

// ── product_images ────────────────────────────────────────────────────────────
export const productImages = pgTable(
  "product_images",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    order: integer("order").notNull().default(0),
    isMain: boolean("is_main").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

// ── product_variants ──────────────────────────────────────────────────────────
export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").unique(),
    colorId: text("color_id").references(() => colors.id),
    size: text("size"),
    price: numeric("price", { precision: 10, scale: 2 }),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("variants_product_idx").on(t.productId),
    index("variants_color_idx").on(t.colorId),
    uniqueIndex("uq_variant_product_color_size").on(
      t.productId,
      t.colorId,
      t.size,
    ),
  ],
);

// ── addresses ─────────────────────────────────────────────────────────────────
export const addresses = pgTable(
  "addresses",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    label: text("label"),
    recipientName: text("recipient_name").notNull(),
    recipientPhone: text("recipient_phone").notNull(),
    province: text("province").notNull(),
    district: text("district").notNull(),
    village: text("village"),
    address: text("address").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [index("addresses_customer_idx").on(t.customerId)],
);

// ── coupons ───────────────────────────────────────────────────────────────────
export const coupons = pgTable(
  "coupons",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    code: text("code").notNull().unique(),
    type: couponTypeEnum("type").notNull(),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmt: numeric("min_order_amt", { precision: 10, scale: 2 }),
    maxDiscount: numeric("max_discount", { precision: 10, scale: 2 }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    startDate: timestamp("start_date", { withTimezone: true, mode: "date" }),
    endDate: timestamp("end_date", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  },
  (t) => [
    index("coupons_code_idx").on(t.code),
    index("coupons_active_end_idx").on(t.isActive, t.endDate),
  ],
);

// ── carts ─────────────────────────────────────────────────────────────────────
export const carts = pgTable("carts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  customerId: text("customer_id")
    .notNull()
    .unique()
    .references(() => customers.id),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .notNull()
    .defaultNow(),
});

// ── cart_items ────────────────────────────────────────────────────────────────
export const cartItems = pgTable(
  "cart_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    cartId: text("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id),
    productVariantId: text("product_variant_id").references(
      () => productVariants.id,
    ),
    quantity: integer("quantity").notNull().default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("cart_items_cart_idx").on(t.cartId)],
);

// ── orders ────────────────────────────────────────────────────────────────────
export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orderNumber: text("order_number").notNull().unique(),
    customerId: text("customer_id")
      .notNull()
      .references(() => customers.id),
    status: orderStatusEnum("status").notNull().default("PENDING"),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    discount: numeric("discount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    couponId: text("coupon_id").references(() => coupons.id),
    couponCode: text("coupon_code"),
    shippingAddressId: text("shipping_address_id").references(
      () => addresses.id,
    ),
    shippingName: shippingTypeEnum("shipping_name").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("orders_customer_idx").on(t.customerId),
    index("orders_status_idx").on(t.status),
    index("orders_created_at_idx").on(t.createdAt),
  ],
);

// ── order_items ───────────────────────────────────────────────────────────────
export const orderItems = pgTable(
  "order_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id),
    productVariantId: text("product_variant_id").references(
      () => productVariants.id,
    ),
    // 📸 Snapshots — ค่า ณ เวลาซื้อ (ป้องกันสินค้าถูกแก้ทีหลัง)
    productName: text("product_name").notNull(),
    productImage: text("product_image"),
    variantSku: text("variant_sku"),
    colorName: colorTypeEnum("color_name"),
    size: text("size"),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("order_items_order_idx").on(t.orderId),
    index("order_items_product_idx").on(t.productId),
  ],
);

// ── shipments ─────────────────────────────────────────────────────────────────
export const shipments = pgTable(
  "shipments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    orderId: text("order_id")
      .notNull()
      .unique()
      .references(() => orders.id),
    shippingType: shippingTypeEnum("shipping_type").notNull(),
    trackingNumber: text("tracking_number"),
    status: shipmentStatusEnum("status").notNull().default("PREPARING"),
    shippedAt: timestamp("shipped_at", { withTimezone: true, mode: "date" }),
    deliveredAt: timestamp("delivered_at", {
      withTimezone: true,
      mode: "date",
    }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("shipments_tracking_idx").on(t.trackingNumber),
    index("shipments_status_idx").on(t.status),
  ],
);

// ── transactions ──────────────────────────────────────────────────────────────
export const transactions = pgTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => nanoid()),
    transactionId: text("transaction_id").notNull(),
    merchantId: text("merchant_id").notNull(),
    merchantName: text("merchant_name").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    status: transactionStatusEnum("status").notNull(),
    postRequest: text("post_request").notNull().default(""),
    bankRequest: text("bank_request").notNull().default(""),
    bankResponse: text("bank_response").notNull().default(""),
    bankType: bankTypeEnum("bank_type"), // nullable — COD has no bank
    paymentMethod: paymentMethodEnum("payment_method").notNull().default("QR"),
    slipUrl: text("slip_url"),
    orderRef: text("order_ref")
      .notNull()
      .unique()
      .references(() => orders.id),
    verifiedBy: text("verified_by").references(() => user.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("transactions_id_idx").on(t.transactionId),
    index("transactions_status_idx").on(t.status),
  ],
);

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;

export type Banner = typeof banners.$inferSelect;
export type NewBanner = typeof banners.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Color = typeof colors.$inferSelect;
export type NewColor = typeof colors.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type ProductImage = typeof productImages.$inferSelect;
export type ProductVariant = typeof productVariants.$inferSelect;

export type Address = typeof addresses.$inferSelect;
export type Coupon = typeof coupons.$inferSelect;

export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;

export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;

export type Shipment = typeof shipments.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
