// src/Services/functionServices.ts
import { Polygon } from "./interfaces";

// ─── Annotation colors ────────────────────────────────────────────────────────

const POLYGON_COLORS = [
  "#E03131", // red
  "#1971C2", // blue
  "#2F9E44", // green
  "#E8590C", // orange
  "#7048E8", // violet
  "#0C8599", // cyan
  "#C2255C", // pink
  "#F08C00", // amber
  "#3BC9DB", // teal-light
  "#94D82D", // lime
  "#CC5DE8", // grape
  "#20C997", // teal
];

let colorIndex = 0;

export const generateAnnotationColor = (): string => {
  const color = POLYGON_COLORS[colorIndex % POLYGON_COLORS.length];
  colorIndex++;
  return color;
};

// Call when all annotations are cleared so the next session starts from red
export const resetColorIndex = (): void => {
  colorIndex = 0;
};

// ─── BBox ─────────────────────────────────────────────────────────────────────

/**
 * Calculates the bounding box of a set of points with optional padding,
 * clamped so it never exceeds the image dimensions.
 */
export const calculateBBox = (
  points: { x: number; y: number }[],
  imageWidth: number,
  imageHeight: number,
  padding = 40,
): [number, number, number, number] => {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  const minX = Math.max(Math.min(...xs) - padding, 0);
  const minY = Math.max(Math.min(...ys) - padding, 0);
  const maxX = Math.min(Math.max(...xs) + padding, imageWidth);
  const maxY = Math.min(Math.max(...ys) + padding, imageHeight);

  return [minX, minY, maxX, maxY];
};

// ─── Label presets ────────────────────────────────────────────────────────────

const PRESET_STORAGE_KEY = "pineapple-label-presets";
const MAX_PRESETS = 30;

/**
 * Returns the current list of saved label presets from localStorage.
 * Always returns an array — never throws.
 */
export const getLabelPresets = (): string[] => {
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/**
 * Adds a new label preset. Silently ignores duplicates and trims whitespace.
 * Enforces a MAX_PRESETS cap (oldest entries are dropped when exceeded).
 * Returns the updated list.
 */
export const addLabelPreset = (label: string): string[] => {
  const trimmed = label.trim();
  if (!trimmed) return getLabelPresets();

  const current = getLabelPresets();
  if (current.includes(trimmed)) return current;

  const updated = [...current, trimmed].slice(-MAX_PRESETS);
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage can be unavailable in some private browsing modes
    console.warn("Could not save label preset to localStorage.");
  }
  return updated;
};

/**
 * Removes a preset by exact string match. Returns the updated list.
 */
export const removeLabelPreset = (label: string): string[] => {
  const updated = getLabelPresets().filter((p) => p !== label);
  try {
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    console.warn("Could not update label presets in localStorage.");
  }
  return updated;
};

// ─── Download ─────────────────────────────────────────────────────────────────

export const downloadPolygonsData = (
  polygons: Polygon[],
  annotatedCanvasImage: string | null,
  showToast: (
    severity: "success" | "info" | "warn" | "error",
    summary: "Success" | "Info" | "Warning" | "Error",
    detail: string,
  ) => void,
) => {
  try {
    if (polygons.length === 0) {
      showToast("error", "Error", "No polygons data to download.");
      return;
    }

    if (!annotatedCanvasImage) {
      showToast("error", "Error", "No annotated image to download.");
      return;
    }

    // Download JSON
    const jsonData = JSON.stringify(polygons, null, 2);
    const jsonBlob = new Blob([jsonData], { type: "application/json" });
    const jsonAnchor = document.createElement("a");
    const jsonUrl = URL.createObjectURL(jsonBlob);
    jsonAnchor.href = jsonUrl;
    jsonAnchor.download = "annotations_data.json";
    document.body.appendChild(jsonAnchor);
    jsonAnchor.click();
    document.body.removeChild(jsonAnchor);
    URL.revokeObjectURL(jsonUrl);

    // Download annotated image
    const imgAnchor = document.createElement("a");
    imgAnchor.href = annotatedCanvasImage;
    imgAnchor.download = "annotated_image.png";
    document.body.appendChild(imgAnchor);
    imgAnchor.click();
    document.body.removeChild(imgAnchor);

    showToast(
      "success",
      "Success",
      "Polygons data and annotated image downloaded successfully.",
    );
  } catch (error) {
    console.error("Error downloading annotation data:", error);
    showToast(
      "error",
      "Error",
      "Error downloading annotation data. Check console for more details.",
    );
  }
};
