export interface PolicyRow {
  label: string;
  value: string;
}

export const SHIPPING_POLICY_ROWS: PolicyRow[] = [
  { label: "Shipping Areas", value: "We ship across India." },
  {
    label: "Processing Time",
    value: "Orders are dispatched within 2-3 business days.",
  },
  {
    label: "Delivery Time & Charges",
    value:
      "Delivery times may vary based on your location and the selected delivery method.",
  },
  { label: "Standard Shipping", value: "Varies according to the location." },
  { label: "Tracking", value: "A tracking link will be sent once shipped." },
  {
    label: "Damages/Missing Items",
    value: "Report issues within 48 hours with photos.",
  },
];

export const SHIPPING_RULE_TITLE = "Shipping Rule";

export const SHIPPING_RULE_BODY =
  "Shipping Rule: Discover our transparent shipping rules, ensuring clarity and peace of mind. We prioritize efficient delivery, ensuring your items arrive safely and on time. With clear guidelines in place, you can shop confidently knowing your orders are handled with care.";

export const SHIPPING_CONTACT_LEAD = "For assistance, contact us at";

export const RETURN_POLICY_ROWS: PolicyRow[] = [
  { label: "Order Cancellation", value: "Not allowed" },
  {
    label: "Returns",
    value:
      "Accepted only for damaged or incorrect items reported within 4-5 days.",
  },
  {
    label: "Refunds",
    value: "Processed after item inspection within 4-5 business days.",
  },
  {
    label: "Non-Returnable Items",
    value: "Customized, clearance, or perishable products.",
  },
];

export const RETURN_RULE_TITLE = "For Return";

export const RETURN_RULE_BODY =
  "We offer a hassle-free process to ensure your satisfaction. Please review our return policy for eligibility and steps to initiate a return.";

export const RETURN_CONTACT_LEAD = "For returns and refunds, email us at";
