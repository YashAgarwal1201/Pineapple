import { Toast } from "primereact/toast/toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Polygon, Rectangle } from "./interfaces";

// Define the store state type
interface AppState {
  isOptionSelected: string | null;
  imageSelected: {
    title: string;
    url: string;
    type: string;
  };
  toast: Toast | null;
  rectangles: Rectangle[];
  polygons: Polygon[];
  annotatedCanvasImage: string | null;
  isSideMenuOpen: boolean;

  isFeedbackDialogOpen: boolean;

  // Actions
  setToastRef: (toast: Toast) => void;
  setIsOptionSelected: (option: string | null) => void;
  setSelectedImage: (title: string, url: string, type: string) => void;
  setRectangles: (rectangles: Rectangle[]) => void;
  setPolygons: (polygons: Polygon[]) => void;
  setAnnotatedCanvasImage: (dataUrl: string | null) => void;
  showToast: (
    severity: "success" | "info" | "warn" | "error" | undefined,
    summary: "Success" | "Info" | "Warning" | "Error",
    detail: string,
    life?: number
  ) => void;
  toggleSideMenu: () => void;
  closeSideMenu: () => void;
  openFeedbackDialog: () => void;
  closeFeedbackDialog: () => void;
}

// Create the store
export const usePineappleStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isOptionSelected: null,
      imageSelected: {
        title: "",
        url: "",
        type: "",
      },
      toast: null,
      rectangles: [],
      polygons: [],
      annotatedCanvasImage: null,

      // State for the side menu (open/close)
      isSideMenuOpen: false,

      // State for the feedback dialog (open/close)
      isFeedbackDialogOpen: false,

      // Actions
      setToastRef: (toast: Toast) => set({ toast }),

      setIsOptionSelected: (option: string | null) =>
        set({ isOptionSelected: option }),

      setSelectedImage: (title: string, url: string, type: string) =>
        set({
          imageSelected: {
            title,
            url,
            type,
          },
        }),

      setRectangles: (rectangles: Rectangle[]) => set({ rectangles }),

      setPolygons: (polygons: Polygon[]) => set({ polygons }),

      setAnnotatedCanvasImage: (dataUrl: string | null) =>
        set({ annotatedCanvasImage: dataUrl }),

      showToast: (
        severity: "success" | "info" | "warn" | "error" | undefined,
        summary: "Success" | "Info" | "Warning" | "Error",
        detail: string,
        life?: number
      ) => {
        const { toast } = get();
        toast?.show({ severity, summary, detail, life });
      },
      toggleSideMenu: () =>
        set((state) => ({
          isSideMenuOpen: !state.isSideMenuOpen,
        })),
      closeSideMenu: () => set({ isSideMenuOpen: false }),
      openFeedbackDialog: () => set({ isFeedbackDialogOpen: true }),
      closeFeedbackDialog: () => set({ isFeedbackDialogOpen: false }),
    }),
    {
      name: "pineapple-storage", // storage key
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
