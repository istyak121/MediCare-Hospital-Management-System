import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapsed: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleCollapsed: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
      closeMobile: () => set({ isMobileOpen: false }),
    }),
    { name: 'medicare-sidebar' },
  ),
);
