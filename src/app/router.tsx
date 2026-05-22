import { RequirePermissions } from "@/modules/auth/presentation/ui/RequirePermissions";
import { LazyPage } from "@/shared/ui/LazyPage";
import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { lazy, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
// useEffect / useNavigate used in appIndexRoute inline component

const HomePage = lazy(() =>
  import("@/app/pages/HomePage").then((m) => ({ default: m.HomePage })),
);

const CustomerLoginPage = lazy(() =>
  import("@/modules/customer-auth/presentation/pages/CustomerLoginPage").then(
    (m) => ({ default: m.CustomerLoginPage }),
  ),
);
const CustomerRegisterPage = lazy(() =>
  import("@/modules/customer-auth/presentation/pages/CustomerRegisterPage").then(
    (m) => ({ default: m.CustomerRegisterPage }),
  ),
);
const CustomerOAuthCallbackPage = lazy(() =>
  import("@/modules/customer-auth/presentation/pages/CustomerOAuthCallbackPage").then(
    (m) => ({ default: m.CustomerOAuthCallbackPage }),
  ),
);

const AccountPage = lazy(() =>
  import("@/modules/customer-account/presentation/pages/AccountPage").then(
    (m) => ({ default: m.AccountPage }),
  ),
);
const MyOrderDetailPage = lazy(() =>
  import("@/modules/customer-account/presentation/pages/MyOrderDetailPage").then(
    (m) => ({ default: m.MyOrderDetailPage }),
  ),
);

const ShopPage = lazy(() =>
  import("@/modules/shop/presentation/pages/ShopPage").then(
    (m) => ({ default: m.ShopPage }),
  ),
);
const ShopProductDetailPage = lazy(() =>
  import("@/modules/shop/presentation/pages/ShopProductDetailPage").then(
    (m) => ({ default: m.ShopProductDetailPage }),
  ),
);

const CartPage = lazy(() =>
  import("@/modules/cart/presentation/pages/CartPage").then(
    (m) => ({ default: m.CartPage }),
  ),
);

const CheckoutPage = lazy(() =>
  import("@/modules/checkout/presentation/pages/CheckoutPage").then(
    (m) => ({ default: m.CheckoutPage }),
  ),
);

const CheckoutSuccessPage = lazy(() =>
  import("@/modules/checkout/presentation/pages/CheckoutSuccessPage").then(
    (m) => ({ default: m.CheckoutSuccessPage }),
  ),
);

const PaymentQrPage = lazy(() =>
  import("@/modules/payment/presentation/pages/PaymentQrPage").then(
    (m) => ({ default: m.PaymentQrPage }),
  ),
);

const RootLayout = lazy(() =>
  import("./layout/RootLayout").then((module) => ({
    default: module.RootLayout,
  })),
);
const ErrorBoundary = lazy(() =>
  import("./error/ErrorBoundary").then((module) => ({
    default: module.ErrorBoundary,
  })),
);
const AuthLayout = lazy(() =>
  import("./layout/AuthLayout").then((module) => ({
    default: module.AuthLayout,
  })),
);

const LoginPage = lazy(() =>
  import("@/modules/auth/presentation/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  })),
);
const AuthenticatedLayout = lazy(() =>
  import("./layout/AuthenticatedLayout").then((module) => ({
    default: module.AuthenticatedLayout,
  })),
);
const DashboardPage = lazy(() =>
  import("@/modules/dashboard/presentation/pages/DashboardPage").then(
    (module) => ({
      default: module.DashboardPage,
    }),
  ),
);
const RolesPage = lazy(() =>
  import("@/modules/roles/presentation/pages/RolesPage").then((module) => ({
    default: module.RolesPage,
  })),
);
const RoleCreatePage = lazy(() =>
  import("@/modules/roles/presentation/pages/RoleCreatePage").then((module) => ({
    default: module.RoleCreatePage,
  })),
);
const RoleEditPage = lazy(() =>
  import("@/modules/roles/presentation/pages/RoleEditPage").then((module) => ({
    default: module.RoleEditPage,
  })),
);
const AuditPage = lazy(() =>
  import("@/modules/audit/presentation/pages/AuditPage").then((module) => ({
    default: module.AuditPage,
  })),
);
const AuditDetailPage = lazy(() =>
  import("@/modules/audit/presentation/pages/AuditDetailPage").then(
    (module) => ({
      default: module.AuditDetailPage,
    }),
  ),
);
const UsersPage = lazy(() =>
  import("@/modules/users/presentation/pages/UsersPage").then((module) => ({
    default: module.UsersPage,
  })),
);
const UserCreatePage = lazy(() =>
  import("@/modules/users/presentation/pages/UserCreatePage").then((module) => ({
    default: module.UserCreatePage,
  })),
);
const UserEditPage = lazy(() =>
  import("@/modules/users/presentation/pages/UserEditPage").then((module) => ({
    default: module.UserEditPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/modules/auth/presentation/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);
const Forbidden = lazy(() =>
  import("./error/Forbidden").then((module) => ({
    default: module.Forbidden,
  })),
);

const CategoriesPage = lazy(() =>
  import("@/modules/categories/presentation/pages/CategoriesPage").then(
    (module) => ({ default: module.CategoriesPage }),
  ),
);

const ProductsPage = lazy(() =>
  import("@/modules/products/presentation/pages/ProductsPage").then(
    (module) => ({ default: module.ProductsPage }),
  ),
);
const ProductCreatePage = lazy(() =>
  import("@/modules/products/presentation/pages/ProductCreatePage").then(
    (module) => ({ default: module.ProductCreatePage }),
  ),
);
const ProductDetailPage = lazy(() =>
  import("@/modules/products/presentation/pages/ProductDetailPage").then(
    (module) => ({ default: module.ProductDetailPage }),
  ),
);

const OrdersPage = lazy(() =>
  import("@/modules/orders/presentation/pages/OrdersPage").then(
    (module) => ({ default: module.OrdersPage }),
  ),
);
const OrderDetailPage = lazy(() =>
  import("@/modules/orders/presentation/pages/OrderDetailPage").then(
    (module) => ({ default: module.OrderDetailPage }),
  ),
);

const CustomersPage = lazy(() =>
  import("@/modules/customers/presentation/pages/CustomersPage").then(
    (module) => ({ default: module.CustomersPage }),
  ),
);
const CustomerDetailPage = lazy(() =>
  import("@/modules/customers/presentation/pages/CustomerDetailPage").then(
    (module) => ({ default: module.CustomerDetailPage }),
  ),
);

const TransactionsPage = lazy(() =>
  import("@/modules/transactions/presentation/pages/TransactionsPage").then(
    (module) => ({ default: module.TransactionsPage }),
  ),
);

const rootRoute = createRootRoute({
  component: RootLayout,
  errorComponent: ErrorBoundary,
});

// "/" — Public landing page (ໜ້າທຳອິດ ສາທາລະນະ)
const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <LazyPage>
      <HomePage />
    </LazyPage>
  ),
});

// ─── Shop Routes (Public) ─────────────────────────────────────────────────────
const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop",
  component: () => (
    <LazyPage>
      <ShopPage />
    </LazyPage>
  ),
});

const shopProductDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shop/$id",
  component: () => (
    <LazyPage>
      <ShopProductDetailPage />
    </LazyPage>
  ),
});

// ─── Cart Route ───────────────────────────────────────────────────────────────
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: () => (
    <LazyPage>
      <CartPage />
    </LazyPage>
  ),
});

// ─── Checkout Routes ──────────────────────────────────────────────────────────
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: () => (
    <LazyPage>
      <CheckoutPage />
    </LazyPage>
  ),
});

const checkoutSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout/success",
  component: () => (
    <LazyPage>
      <CheckoutSuccessPage />
    </LazyPage>
  ),
});

// ─── Payment QR Route ─────────────────────────────────────────────────────────
const paymentQrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/qr",
  component: () => (
    <LazyPage>
      <PaymentQrPage />
    </LazyPage>
  ),
});

// ─── Customer Auth Routes ─────────────────────────────────────────────────────
const customerLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer/login",
  component: () => (
    <LazyPage>
      <CustomerLoginPage />
    </LazyPage>
  ),
});

const customerRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer/register",
  component: () => (
    <LazyPage>
      <CustomerRegisterPage />
    </LazyPage>
  ),
});

const customerOAuthCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customer/auth/callback",
  component: () => (
    <LazyPage>
      <CustomerOAuthCallbackPage />
    </LazyPage>
  ),
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app",
  component: AuthenticatedLayout,
});

// /app → redirect to /app/dashboard
const appIndexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: () => {
    const nav = useNavigate();
    useEffect(() => { nav({ to: "/app/dashboard", replace: true }); }, [nav]);
    return null;
  },
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/dashboard",
  component: () => (
    <LazyPage>
      <DashboardPage />
    </LazyPage>
  ),
});

const rolesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RolesPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roleCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles/create",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RoleCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const roleEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/roles/$id/edit",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:ban"]}>
      <LazyPage>
        <RoleEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const auditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/audit",
  component: () => (
    <RequirePermissions all={["audit:read"]}>
      <LazyPage>
        <AuditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const auditDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/audit/$id",
  component: () => (
    <RequirePermissions all={["audit:read"]}>
      <LazyPage>
        <AuditDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users",
  component: () => (
    <RequirePermissions all={["users:read"]}>
      <LazyPage>
        <UsersPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const userCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/create",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:create"]}>
      <LazyPage>
        <UserCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const userEditRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/users/$id/edit",
  component: () => (
    <RequirePermissions all={["users:read"]} any={["users:update"]}>
      <LazyPage>
        <UserEditPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/profile",
  component: () => (
    <LazyPage>
      <ProfilePage />
    </LazyPage>
  ),
});

const categoriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/categories",
  component: () => (
    <RequirePermissions all={["categories:read"]}>
      <LazyPage>
        <CategoriesPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const productsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products",
  component: () => (
    <RequirePermissions all={["products:read"]}>
      <LazyPage>
        <ProductsPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const productCreateRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products/create",
  component: () => (
    <RequirePermissions all={["products:read"]} any={["products:create"]}>
      <LazyPage>
        <ProductCreatePage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const productDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/products/$id",
  component: () => (
    <RequirePermissions all={["products:read"]}>
      <LazyPage>
        <ProductDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const customersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customers",
  component: () => (
    <RequirePermissions all={["customers:read"]}>
      <LazyPage>
        <CustomersPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const customerDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/customers/$id",
  component: () => (
    <RequirePermissions all={["customers:read"]}>
      <LazyPage>
        <CustomerDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const ordersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/orders",
  component: () => (
    <RequirePermissions all={["orders:read"]}>
      <LazyPage>
        <OrdersPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const orderDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/orders/$id",
  component: () => (
    <RequirePermissions all={["orders:read"]}>
      <LazyPage>
        <OrderDetailPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

const transactionsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/transactions",
  component: () => (
    <RequirePermissions all={["transactions:read"]}>
      <LazyPage>
        <TransactionsPage />
      </LazyPage>
    </RequirePermissions>
  ),
});

// ─── Customer Account Routes ──────────────────────────────────────────────────
const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account",
  component: () => (
    <LazyPage>
      <AccountPage />
    </LazyPage>
  ),
});

const myOrderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/account/orders/$id",
  component: () => (
    <LazyPage>
      <MyOrderDetailPage />
    </LazyPage>
  ),
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/errors/forbidden",
  component: () => (
    <LazyPage>
      <Forbidden />
    </LazyPage>
  ),
});

export const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  shopRoute,
  shopProductDetailRoute,
  cartRoute,
  checkoutRoute,
  checkoutSuccessRoute,
  paymentQrRoute,
  customerLoginRoute,
  customerRegisterRoute,
  customerOAuthCallbackRoute,
  accountRoute,
  myOrderDetailRoute,
  authLayoutRoute.addChildren([loginRoute]),
  appRoute.addChildren([
    appIndexRoute,
    dashboardRoute,
    rolesRoute,
    roleCreateRoute,
    roleEditRoute,
    usersRoute,
    userCreateRoute,
    userEditRoute,
    auditRoute,
    auditDetailRoute,
    profileRoute,
    categoriesRoute,
    productsRoute,
    productCreateRoute,
    productDetailRoute,
    customersRoute,
    customerDetailRoute,
    ordersRoute,
    orderDetailRoute,
    transactionsRoute,
  ]),
  forbiddenRoute,
]);
export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
