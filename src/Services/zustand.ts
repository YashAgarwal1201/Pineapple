import { Toast } from "primereact/toast/toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // Actions
  setToastRef: (toast: Toast) => void;
  setIsOptionSelected: (option: string | null) => void;
  setSelectedImage: (title: string, url: string, type: string) => void;
  setRectangles: (rectangles: Rectangle[]) => void;
  setPolygons: (polygons: Polygon[]) => void;
  showToast: (
    severity: "success" | "info" | "warn" | "error" | undefined,
    summary: "Success" | "Info" | "Warning" | "Error",
    detail: string,
    life?: number
  ) => void;
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

      showToast: (
        severity: "success" | "info" | "warn" | "error" | undefined,
        summary: "Success" | "Info" | "Warning" | "Error",
        detail: string,
        life?: number
      ) => {
        const { toast } = get();
        toast?.show({ severity, summary, detail, life });
      },
    }),
    {
      name: "pineapple-storage", // storage key
      // You can customize storage options here if needed
    }
  )
);
