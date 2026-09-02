// src/Services/importAdapters.ts
//
// Import adapter layer: translates external annotation file formats into
// Pineapple's internal Polygon/Rectangle shapes. Nothing downstream of this
// file (store, canvas, draw loop) ever needs to know which format a shape
// originally came from — every adapter below returns the same ImportResult.

import { generateAnnotationColor } from "./functionServices";
import { Polygon, Rectangle } from "./interfaces";

// ─── Public types ────────────────────────────────────────────────────────────

export type SupportedFormat = "pineapple" | "coco" | "unknown";

export interface ImportResult {
  polygons: Polygon[];
  rectangles: Rectangle[];
  /** Human-readable messages for anything skipped, rescaled, or filtered. */
  warnings: string[];
}

export interface ImageDimensions {
  width: number;
  height: number;
}

// ─── Format detection (best-effort suggestion, not a source of truth) ───────

/**
 * Guesses which format a file is from its parsed content. This only
 * *suggests* a format for the format dropdown — the user can always
 * override it, so this never throws and "unknown" is always valid.
 */
export const detectFormat = (rawText: string): SupportedFormat => {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return "unknown";
  }

  if (Array.isArray(parsed)) {
    // Legacy bare-array Pineapple export (polygons only, no wrapper).
    return "pineapple";
  }

  if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    if ("polygons" in obj || "rectangles" in obj) {
      return "pineapple";
    }
    if ("images" in obj && "annotations" in obj && "categories" in obj) {
      return "coco";
    }
  }

  return "unknown";
};

// ─── Shared validation helpers ───────────────────────────────────────────────

const isFiniteNumber = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v);

const isValidPoint = (p: unknown): p is { x: number; y: number } =>
  !!p &&
  typeof p === "object" &&
  isFiniteNumber((p as { x?: unknown }).x) &&
  isFiniteNumber((p as { y?: unknown }).y);

const isValidPolygonShape = (p: unknown): p is Polygon => {
  if (!p || typeof p !== "object") return false;
  const c = p as Partial<Polygon>;
  return (
    Array.isArray(c.points) &&
    c.points.length >= 3 &&
    c.points.every(isValidPoint) &&
    Array.isArray(c.bbox) &&
    c.bbox.length === 4 &&
    c.bbox.every(isFiniteNumber) &&
    typeof c.label === "string" &&
    typeof c.color === "string"
  );
};

const isValidRectangleShape = (r: unknown): r is Rectangle => {
  if (!r || typeof r !== "object") return false;
  const c = r as Partial<Rectangle>;
  return (
    isFiniteNumber(c.startX) &&
    isFiniteNumber(c.startY) &&
    isFiniteNumber(c.endX) &&
    isFiniteNumber(c.endY) &&
    typeof c.label === "string" &&
    typeof c.color === "string"
  );
};

/**
 * Rescales a point from the annotation file's reference image size to the
 * actual uploaded image's size. No-op if the sizes already match or the
 * source size is missing/invalid.
 */
const rescalePoint = (
  point: { x: number; y: number },
  from: ImageDimensions,
  to: ImageDimensions,
): { x: number; y: number } => {
  if (from.width === to.width && from.height === to.height) return point;
  if (!isFiniteNumber(from.width) || !isFiniteNumber(from.height)) return point;
  if (from.width <= 0 || from.height <= 0) return point;
  return {
    x: (point.x / from.width) * to.width,
    y: (point.y / from.height) * to.height,
  };
};

// ─── Pineapple JSON adapter ───────────────────────────────────────────────────

/**
 * Accepts both the current `{ polygons, rectangles }` wrapper and legacy
 * bare-array exports (`Polygon[]` only, from before rectangles existed).
 * Already in our own coordinate space, so no rescaling needed.
 */
export const parsePineappleJSON = (rawText: string): ImportResult => {
  const warnings: string[] = [];
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      polygons: [],
      rectangles: [],
      warnings: ["File isn't valid JSON — nothing was imported."],
    };
  }

  const rawPolygons: unknown[] = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as Record<string, unknown>)?.polygons)
      ? ((parsed as Record<string, unknown>).polygons as unknown[])
      : [];
  const rawRectangles: unknown[] = Array.isArray(
    (parsed as Record<string, unknown>)?.rectangles,
  )
    ? ((parsed as Record<string, unknown>).rectangles as unknown[])
    : [];

  const polygons: Polygon[] = [];
  rawPolygons.forEach((p, i) => {
    if (isValidPolygonShape(p)) {
      polygons.push(p);
    } else {
      warnings.push(
        `Skipped polygon at index ${i}: doesn't match the expected shape.`,
      );
    }
  });

  const rectangles: Rectangle[] = [];
  rawRectangles.forEach((r, i) => {
    if (isValidRectangleShape(r)) {
      rectangles.push(r);
    } else {
      warnings.push(
        `Skipped rectangle at index ${i}: doesn't match the expected shape.`,
      );
    }
  });

  if (rawPolygons.length === 0 && rawRectangles.length === 0) {
    warnings.push("No polygons or rectangles found in this file.");
  }

  return { polygons, rectangles, warnings };
};

// ─── COCO JSON adapter ────────────────────────────────────────────────────────

interface CocoCategory {
  id: number;
  name: string;
}

interface CocoImage {
  id: number;
  file_name?: string;
  width?: number;
  height?: number;
}

interface CocoAnnotation {
  image_id: number;
  category_id: number;
  bbox?: number[]; // [x, y, w, h] — top-left + size
  segmentation?: number[][]; // [[x1, y1, x2, y2, ...]]
}

/**
 * COCO files describe whole datasets (many images). We only support
 * importing against the single image the user is currently uploading, so
 * this picks the image entry that matches the uploaded file's name (falling
 * back to the first image in the file) and only imports annotations for
 * that one image — warning if the file clearly held more than that.
 */
export const parseCocoJSON = (
  rawText: string,
  targetImage: ImageDimensions,
  uploadedFileName?: string,
): ImportResult => {
  const warnings: string[] = [];
  let parsed: any;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    return {
      polygons: [],
      rectangles: [],
      warnings: ["File isn't valid JSON — nothing was imported."],
    };
  }

  const categories: CocoCategory[] = Array.isArray(parsed?.categories)
    ? parsed.categories
    : [];
  const images: CocoImage[] = Array.isArray(parsed?.images)
    ? parsed.images
    : [];
  const annotations: CocoAnnotation[] = Array.isArray(parsed?.annotations)
    ? parsed.annotations
    : [];

  if (images.length === 0 || annotations.length === 0) {
    return {
      polygons: [],
      rectangles: [],
      warnings: [
        "This COCO file has no images or no annotations — nothing to import.",
      ],
    };
  }

  let chosenImage = images[0];
  if (uploadedFileName) {
    const match = images.find((img) => img.file_name === uploadedFileName);
    if (match) chosenImage = match;
  }

  if (images.length > 1) {
    warnings.push(
      chosenImage.file_name
        ? `This file describes ${images.length} images — only annotations for "${chosenImage.file_name}" were imported.`
        : `This file describes ${images.length} images — only the first image's annotations were imported.`,
    );
  }

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));

  const sourceDims: ImageDimensions = {
    width: chosenImage.width ?? targetImage.width,
    height: chosenImage.height ?? targetImage.height,
  };

  if (
    isFiniteNumber(sourceDims.width) &&
    isFiniteNumber(sourceDims.height) &&
    (sourceDims.width !== targetImage.width ||
      sourceDims.height !== targetImage.height)
  ) {
    warnings.push(
      "Annotation coordinates were rescaled to match the uploaded image's dimensions.",
    );
  }

  const polygons: Polygon[] = [];
  const rectangles: Rectangle[] = [];
  const relevant = annotations.filter((a) => a.image_id === chosenImage.id);

  relevant.forEach((ann, i) => {
    const label =
      categoryNameById.get(ann.category_id) ?? `Category ${ann.category_id}`;
    const color = generateAnnotationColor();

    const hasPolygonSeg =
      Array.isArray(ann.segmentation) &&
      ann.segmentation.length > 0 &&
      Array.isArray(ann.segmentation[0]) &&
      ann.segmentation[0].length >= 6;

    if (hasPolygonSeg) {
      const flat = ann.segmentation![0];
      const points: { x: number; y: number }[] = [];
      for (let j = 0; j + 1 < flat.length; j += 2) {
        points.push(
          rescalePoint({ x: flat[j], y: flat[j + 1] }, sourceDims, targetImage),
        );
      }
      if (points.length >= 3 && points.every(isValidPoint)) {
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        polygons.push({
          points,
          bbox: [
            Math.min(...xs),
            Math.min(...ys),
            Math.max(...xs),
            Math.max(...ys),
          ],
          color,
          label,
          units: 0,
        });
        return;
      }
      warnings.push(
        `Skipped annotation ${i}: segmentation points were invalid.`,
      );
      return;
    }

    if (
      Array.isArray(ann.bbox) &&
      ann.bbox.length === 4 &&
      ann.bbox.every(isFiniteNumber)
    ) {
      const [x, y, w, h] = ann.bbox;
      const start = rescalePoint({ x, y }, sourceDims, targetImage);
      const end = rescalePoint({ x: x + w, y: y + h }, sourceDims, targetImage);
      rectangles.push({
        startX: start.x,
        startY: start.y,
        endX: end.x,
        endY: end.y,
        color,
        label,
      });
      return;
    }

    warnings.push(`Skipped annotation ${i}: no usable bbox or segmentation.`);
  });

  if (polygons.length === 0 && rectangles.length === 0) {
    warnings.push("No importable shapes were found for this image.");
  }

  return { polygons, rectangles, warnings };
};

// ─── Dispatcher ───────────────────────────────────────────────────────────────

/**
 * Single entry point the UI calls. `format` should come from the format
 * dropdown (auto-detected, user-overridable) — this never guesses on its
 * own, it just routes to the matching adapter.
 */
export const parseAnnotationFile = (
  format: SupportedFormat,
  rawText: string,
  targetImage: ImageDimensions,
  uploadedFileName?: string,
): ImportResult => {
  switch (format) {
    case "pineapple":
      return parsePineappleJSON(rawText);
    case "coco":
      return parseCocoJSON(rawText, targetImage, uploadedFileName);
    default:
      return {
        polygons: [],
        rectangles: [],
        warnings: [
          "Unrecognized format — check the format dropdown, or see Supported Formats for what's accepted.",
        ],
      };
  }
};
