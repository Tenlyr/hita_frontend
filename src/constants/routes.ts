export const APP_ROUTES = {
  /** Public storefront. */
  SHOP: {
    HOME: "/",
    PRODUCTS: "/products",
    product: (id: number | string) => `/products/${id}`,
    ACCOUNT: "/account",
    CART: "/cart",
    CHECKOUT: "/checkout",
    WISHLIST: "/wishlist",
    ABOUT: "/about",
    CONTACT: "/contact",
    FAQ: "/faqs",
    PRIVACY_POLICY: "/privacy-policy",
    SHIPPING_POLICY: "/shipping-policy",
    RETURN_POLICY: "/return-policy",
    TERMS: "/terms",
  },
  APP: {
    DASHBOARD: "/dashboard",
    PRODUCTS: "/dashboard/products",
    ADD_PRODUCT: "/dashboard/products/new",
    CAROUSEL: "/dashboard/carousel",
    INVENTORY: "/dashboard/inventory",
    MESSAGES: "/dashboard/messages",
    ORDERS: "/dashboard/orders",
    INVOICES: "/dashboard/invoices",
    OFFERS: "/dashboard/offers",
  },
  ADMIN: {
    LOGIN: "/dashboard/login",
  },
};
