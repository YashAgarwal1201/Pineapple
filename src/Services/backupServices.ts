import { usePineappleStore } from "./zustand";
import { db, PineappleSession } from "../db/db";

interface BackupFormat {
  version: string;
  type: "pineapple_backup";
  timestamp: string;
  preferences: {
    annotatorName: string;
    crosshairCursor: boolean;
  };
  session: {
    imageMeta: {
      title: string;
      type: string;
    } | null;
    imageBlobDataUrl: string | null;
    polygons: any[];
    rectangles: any[];
  } | null;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const dataURLtoBlob = async (dataUrl: string): Promise<Blob> => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

export const exportFullBackup = async () => {
  try {
    const state = usePineappleStore.getState();
    const session = await db.sessions.get(1);

    let imageBlobDataUrl: string | null = null;
    if (session?.imageBlob) {
      imageBlobDataUrl = await blobToBase64(session.imageBlob);
    }

    const backup: BackupFormat = {
      version: "1.0",
      type: "pineapple_backup",
      timestamp: new Date().toISOString(),
      preferences: {
        annotatorName: state.annotatorName,
        crosshairCursor: state.crosshairCursor,
      },
      session: session ? {
        imageMeta: session.imageMeta || null,
        imageBlobDataUrl,
        polygons: session.polygons || [],
        rectangles: session.rectangles || [],
      } : null,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `pineapple-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  } catch (error: unknown) {
    console.error("Export backup failed:", error);
    throw error;
  }
};

export const importFullBackup = async (file: File): Promise<void> => {
  try {
    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    const parsed = JSON.parse(text) as Partial<BackupFormat>;

    if (parsed.type !== "pineapple_backup") {
      throw new Error("INVALID_FORMAT");
    }

    const state = usePineappleStore.getState();

    // 1. Restore Preferences
    if (parsed.preferences) {
      state.setAnnotatorName(parsed.preferences.annotatorName || "Annotator");
      state.setCrosshairCursor(parsed.preferences.crosshairCursor ?? true);
    }

    // 2. Restore DB
    await state.clearSessionDb(); // This also clears existing state

    if (parsed.session) {
      const { imageBlobDataUrl, imageMeta, polygons, rectangles } = parsed.session;
      let blob: Blob | null = null;

      if (imageBlobDataUrl) {
        blob = await dataURLtoBlob(imageBlobDataUrl);
      }

      const newSession: PineappleSession = {
        id: 1,
        imageBlob: blob,
        imageMeta: imageMeta || { title: "restored_image", type: "image/jpeg" },
        polygons: polygons || [],
        rectangles: rectangles || [],
      };

      await db.sessions.put(newSession);

      // 3. Load DB back to Zustand
      await state.loadSessionFromDb();
    }
  } catch (error: unknown) {
    console.error("Import backup failed:", error);
    throw error;
  }
};
