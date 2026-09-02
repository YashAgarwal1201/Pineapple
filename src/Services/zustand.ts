import { Toast } from "primereact/toast/toast";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { Polygon, Rectangle } from "./interfaces";
import { db } from "../db/db";

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

  // Preferences
  annotatorName: string;
  crosshairCursor: boolean;

  // Actions
  setAnnotatorName: (name: string) => void;
  setCrosshairCursor: (enabled: boolean) => void;
  setToastRef: (toast: Toast) => void;
  setIsOptionSelected: (option: string | null) => void;
  setSelectedImage: (title: string, url: string, type: string) => void;
  setImageFileToDb: (file: File | Blob, title: string, type: string) => Promise<void>;
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

  // DB Actions
  loadSessionFromDb: () => Promise<void>;
  clearSessionDb: () => Promise<void>;
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

      // Preferences
      annotatorName: "Annotator",
      crosshairCursor: true,

      // State for the side menu (open/close)
      isSideMenuOpen: false,

      // State for the feedback dialog (open/close)
      isFeedbackDialogOpen: false,

      // Actions
      setAnnotatorName: (name) => set({ annotatorName: name }),
      setCrosshairCursor: (enabled) => set({ crosshairCursor: enabled }),
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

      setImageFileToDb: async (file: File | Blob, title: string, type: string) => {
        const { imageSelected } = get();
        if (imageSelected.url.startsWith("blob:")) {
          URL.revokeObjectURL(imageSelected.url);
        }

        // Save to DB
        const session = await db.sessions.get(1);
        if (session) {
          await db.sessions.update(1, { imageBlob: file, imageMeta: { title, type } });
        } else {
          await db.sessions.put({ id: 1, imageBlob: file, imageMeta: { title, type }, polygons: [], rectangles: [] });
        }

        const url = URL.createObjectURL(file);
        set({
          imageSelected: { title, type, url }
        });
      },

      setRectangles: async (rectangles: Rectangle[]) => {
        set({ rectangles });
        const session = await db.sessions.get(1);
        if (session) {
          await db.sessions.update(1, { rectangles });
        }
      },

      setPolygons: async (polygons: Polygon[]) => {
        set({ polygons });
        const session = await db.sessions.get(1);
        if (session) {
          await db.sessions.update(1, { polygons });
        }
      },

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

      loadSessionFromDb: async () => {
        const session = await db.sessions.get(1);
        if (session) {
          let url = "";
          if (session.imageBlob) {
            url = URL.createObjectURL(session.imageBlob);
          }
          set({
            polygons: session.polygons || [],
            rectangles: session.rectangles || [],
            imageSelected: {
              title: session.imageMeta?.title || "",
              type: session.imageMeta?.type || "",
              url,
            }
          });
        }
      },

      clearSessionDb: async () => {
        const { imageSelected } = get();
        if (imageSelected.url.startsWith("blob:")) {
          URL.revokeObjectURL(imageSelected.url);
        }
        await db.sessions.clear();
        set({
          polygons: [],
          rectangles: [],
          imageSelected: { title: "", url: "", type: "" },
          annotatedCanvasImage: null
        });
      }
    }),
    {
      name: "pineapple-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        annotatorName: state.annotatorName,
        crosshairCursor: state.crosshairCursor,
      }),
    }
  )
);
