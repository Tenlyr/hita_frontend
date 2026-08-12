import { PageBanner } from "@/components/layout/page-banner";
import { PolicyDocument } from "@/components/legal/policy-document";
import { APP_ROUTES } from "@/constants/routes";
import {
  RETURN_CONTACT_LEAD,
  RETURN_POLICY_ROWS,
  RETURN_RULE_BODY,
  RETURN_RULE_TITLE,
} from "@/constants/shipping";

export const metadata = {
  title: "Return Policy — Hitadecor",
  description:
    "When a return is accepted, how refunds are processed, and which items are not returnable.",
};

export default function ReturnPolicyPage() {
  return (
    <>
      <PageBanner
        title="Return Policy"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Return Policy" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <PolicyDocument
          title="Return Policy"
          rows={RETURN_POLICY_ROWS}
          ruleTitle={RETURN_RULE_TITLE}
          ruleBody={RETURN_RULE_BODY}
          contactLead={RETURN_CONTACT_LEAD}
        />
      </div>
    </>
  );
}
