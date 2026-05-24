import { Elysia } from "elysia";
import { auditRoutes } from "@/modules/audit/api";
import { authRoutes } from "@/modules/auth/api";
import { categoriesRoutes } from "@/modules/categories/api";
import { cartRoutes } from "@/modules/cart/api";
import { checkoutRoutes } from "@/modules/checkout/api";
import { paymentRoutes } from "@/modules/payment/api";
import { customerAuthRoutes } from "@/modules/customer-auth/api";
import { shopRoutes } from "@/modules/shop/api";
import { customersRoutes } from "@/modules/customers/api";
import { customerAccountRoutes } from "@/modules/customer-account/api";
import { dashboardRoutes } from "@/modules/dashboard/api";
import { ordersRoutes } from "@/modules/orders/api";
import { productsRoutes } from "@/modules/products/api";
import { shipmentsRoutes } from "@/modules/shipments/api";
import { rolesRoutes } from "@/modules/roles/api";
import { uploadRoutes } from "@/modules/upload/api";
import { usersRoutes } from "@/modules/users/api";
import { transactionsRoutes } from "@/modules/transactions/api";
import { bannersRoutes } from "@/modules/banner/api";

export function createRestRoutes() {
  return new Elysia()
    .use(authRoutes)
    .use(usersRoutes)
    .use(rolesRoutes)
    .use(auditRoutes)
    .use(uploadRoutes)
    .use(categoriesRoutes)
    .use(productsRoutes)
    .use(ordersRoutes)
    .use(shipmentsRoutes)
    .use(customerAuthRoutes)
    .use(shopRoutes)
    .use(cartRoutes)
    .use(checkoutRoutes)
    .use(paymentRoutes)
    .use(customersRoutes)
    .use(customerAccountRoutes)
    .use(dashboardRoutes)
    .use(transactionsRoutes)
    .use(bannersRoutes);
}
