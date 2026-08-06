import { AccountView } from "@/components/account/account-view";
import { PageBanner } from "@/components/layout/page-banner";
import { APP_ROUTES } from "@/constants/routes";

export const metadata = {
  title: "My Account — Hitadecor",
};

export default function AccountPage() {
  return (
    <>
      <PageBanner
        title="My Account"
        crumbs={[
          { label: "Home", href: APP_ROUTES.SHOP.HOME },
          { label: "Account" },
        ]}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <AccountView />
      </div>
    </>
  );
}
