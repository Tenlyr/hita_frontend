export const APP_ROUTES = {
  /** Public storefront. */
  SHOP: {
    HOME: "/",
    PRODUCTS: "/products",
    product: (id: number | string) => `/products/${id}`,
  },
  APP: {
    DASHBOARD: "/dashboard",
    PRODUCTS: "/dashboard/products",
    ADD_PRODUCT: "/dashboard/products/new",
    CATALOG_UPLOAD: "/dashboard/catalog-upload",
    INVENTORY: "/dashboard/inventory",
    ORDERS: "/dashboard/orders",
  },
  ADMIN: {
    LOGIN: "/dashboard/login",
  },
};
