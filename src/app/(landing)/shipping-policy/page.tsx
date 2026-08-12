import type { Metadata } from "next";

import { pageMetadata } from "@/lib/metadata";
import { PageBanner } from "@/components/layout/page-banner";
import { PolicyDocument } from "@/components/legal/policy-document";
import { APP_ROUTES } from "@/constants/routes";
import {
  SHIPPING_CONTACT_LEAD,
  SHIPPING_POLICY_ROWS,
  SHIPPING_RULE_BODY,
  SHIPPING_RULE_TITLE,
} from "@/constants/shipping";

export const metadata: Metadata = pageMetadata({
  title: "Shipping Policy",
  description:
    "Where Hitadecor ships, how long orders take, tracking, and what to do about damaged or missing items.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return (
    <>
      <PageBanner
        title="Shipping Policy"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Shipping Policy" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <PolicyDocument
          title="Shipping Policy"
          rows={SHIPPING_POLICY_ROWS}
          ruleTitle={SHIPPING_RULE_TITLE}
          ruleBody={SHIPPING_RULE_BODY}
          contactLead={SHIPPING_CONTACT_LEAD}
        />
      </div>
    </>
  );
}
