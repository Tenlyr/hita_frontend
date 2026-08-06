import { create } from "zustand";

interface AuthDialogState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}

/**
 * One shared dialog for the whole storefront — every product card triggers the
 * same instance rather than rendering its own.
 */
export const useAuthDialogStore = create<AuthDialogState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setOpen: (isOpen) => set({ isOpen }),
}));
