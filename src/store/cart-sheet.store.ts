import { create } from "zustand";

interface CartSheetState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

/** One shared cart drawer, opened from the header or any Add to Cart button. */
export const useCartSheetStore = create<CartSheetState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}));
