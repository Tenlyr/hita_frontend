"use client";

import {
  ChevronRight,
  GalleryHorizontalEnd,
  Inbox,
  House,
  LogOut,
  Package,
  ShoppingCart,
  Truck,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { APP_ROUTES } from "@/constants/routes";
import { useCurrentUser } from "@/hooks/use-current-user";

// Rows stay 2.5rem tall in both states — only the width collapses to a square.
// mx-auto centres that square in the 4.5rem rail set on SidebarProvider.
const MENU_BUTTON_CLASS =
  "h-10 gap-3 px-4 text-sm font-medium data-active:font-medium group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2.5!";

const NAV_ITEMS = [
  { label: "Dashboard", href: APP_ROUTES.APP.DASHBOARD, icon: House },
  {
    label: "Add Product",
    href: APP_ROUTES.APP.ADD_PRODUCT,
    icon: ShoppingCart,
  },
  {
    label: "Catalog Upload",
    href: APP_ROUTES.APP.CATALOG_UPLOAD,
    icon: Upload,
  },
  {
    label: "Carousel",
    href: APP_ROUTES.APP.CAROUSEL,
    icon: GalleryHorizontalEnd,
  },
  { label: "Inventory", href: APP_ROUTES.APP.INVENTORY, icon: Package },
  { label: "Orders", href: APP_ROUTES.APP.ORDERS, icon: Truck },
  { label: "Messages", href: APP_ROUTES.APP.MESSAGES, icon: Inbox },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useCurrentUser();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
        <Link
          href={APP_ROUTES.APP.DASHBOARD}
          className="flex items-center justify-center"
        >
          <Image
            src="/logo.svg"
            alt="hita"
            width={87}
            height={49}
            priority
            className="h-12 w-auto group-data-[collapsible=icon]:h-12"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  tooltip={item.label}
                  render={<Link href={item.href} />}
                  className={MENU_BUTTON_CLASS}
                >
                  <item.icon className="size-5!" />
                  <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                  <ChevronRight className="ml-auto size-4! opacity-60 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => void logout()}
              className={`${MENU_BUTTON_CLASS} cursor-pointer`}
            >
              <LogOut className="size-5!" />
              <span className="min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden">
                Logout
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
