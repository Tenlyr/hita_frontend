export interface LegalSection {
  title: string;
  items: string[];
}

export const TERMS_INTRO =
  "Welcome to Hita Decor, your trusted home decor provider. By accessing or using our website and services, you agree to comply with the following terms and conditions. Please read them carefully.";

/* The privacy page reproduces the same clauses, so both pages read from one
   list. Editing a clause in one place keeps the two from drifting apart. */
export const TERMS_SECTIONS: LegalSection[] = [
  {
    title: "General Terms",
    items: [
      "These Terms and Conditions govern the use of our website, products, and services.",
      "We reserve the right to update or modify these terms at any time without prior notice.",
    ],
  },
  {
    title: "Products and Services",
    items: [
      "All product descriptions and images are for illustrative purposes. Colors and materials may slightly vary due to screen resolution and manufacturing processes.",
      "We reserve the right to modify, discontinue, or limit the availability of any product without notice.",
    ],
  },
  {
    title: "Orders and Payments",
    items: [
      "All orders are subject to acceptance and availability.",
      "Prices are listed in Indian Rupees and include applicable taxes unless stated otherwise.",
      "Payments must be made in full at the time of purchase via our approved payment methods.",
      "We reserve the right to cancel any order due to pricing errors, fraudulent activity, or stock unavailability.",
    ],
  },
  {
    title: "Shipping and Delivery",
    items: [
      "Estimated delivery times are provided for reference and may vary due to unforeseen circumstances.",
      "Customers are responsible for providing accurate shipping details. We are not liable for delays or losses due to incorrect information.",
    ],
  },
  {
    title: "Returns and Refunds",
    items: [
      "We accept returns within 2-4 working days of delivery, provided the item is damaged during the transit and must be reported within 24 hours of delivery.",
      "Customers must provide clear images or videos as proof of damage when requesting a return.",
      "Refunds or replacements will be processed after verification of the reported damage.",
      "Customized or clearance items are not eligible for return or refund.",
    ],
  },
  {
    title: "Warranties and Liability",
    items: [
      "We warrant that our products meet industry standards for quality and craftsmanship.",
      "We are not liable for damages resulting from misuse, improper installation, or unauthorized modifications of our products.",
      "Our liability is limited to the cost of the purchased product.",
    ],
  },
  {
    title: "Intellectual Property",
    items: [
      "All content on our website, including images, text, and logos, is the property of Hita Decor and may not be used without permission.",
      "Any unauthorized use of our intellectual property may result in legal action.",
    ],
  },
  {
    title: "Privacy Policy",
    items: [
      "We collect and use personal information as outlined in our Privacy Policy.",
      "We take reasonable measures to protect customer data but cannot guarantee absolute security.",
    ],
  },
  {
    title: "Governing Law",
    items: [
      "These terms shall be governed by and construed in accordance with the laws of Coimbatore, Tamilnadu Jurisdiction.",
      "Any disputes shall be resolved in the courts of Coimbatore, Tamilnadu Jurisdiction.",
    ],
  },
];
