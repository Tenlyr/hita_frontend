export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  title: string;
  items: FaqItem[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    title: "For Shipping",
    items: [
      {
        question: "Do you offer international shipping?",
        answer:
          "No, we currently do not ship outside India. Domestic deliveries typically take 3-5 working days, depending on your pincode.",
      },
      {
        question: "Can I request early delivery?",
        answer:
          "No, we do not offer expedited shipping. Your order will be delivered within the standard timeframe based on your pincode.",
      },
    ],
  },
  {
    title: "Order & Payment",
    items: [
      {
        question: "Can I place an order through WhatsApp?",
        answer:
          "Yes! You can place an order via WhatsApp at +91 97784 17711 for a convenient shopping experience.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept debit/credit cards and UPI payments for a seamless shopping experience.",
      },
      {
        question: "Can I cancel, return, or exchange my order?",
        answer:
          "We do not encourage cancellations, returns, or exchanges. However, if you receive a damaged or incorrect item, please contact us within 24 hours of delivery via email at info@hitadecor.com or WhatsApp at +91 97784 17711 for assistance.",
      },
      {
        question: "Do you have a physical store?",
        answer:
          "Yes, you can visit our store in Coimbatore to explore our collection in person.",
      },
    ],
  },
];
