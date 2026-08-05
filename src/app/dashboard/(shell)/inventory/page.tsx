import { InventoryBoard } from "@/components/inventory/inventory-board";

export const metadata = {
  title: "Inventory — Hitadecor Admin",
};

export default function InventoryPage() {
  return (
    <div className="w-full">
      <InventoryBoard />
    </div>
  );
}
