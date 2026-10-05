// src/Services/exportAdapters.ts
import { Polygon, Rectangle } from "./interfaces";
import { ImageDimensions } from "./importAdapters"; 

export type ExportFormat = "pineapple" | "coco" | "yolo";

export const exportToCOCO = (
  polygons: Polygon[],
  rectangles: Rectangle[],
  imageMeta: { title: string; type: string } | null,
  imageDims: ImageDimensions,
  annotatorName: string
): string => {
  // 1. Extract unique categories
  const categoriesMap = new Map<string, number>();
  let catId = 1;

  const addCategory = (label: string) => {
    if (!categoriesMap.has(label)) {
      categoriesMap.set(label, catId++);
    }
  };

  polygons.forEach((p) => addCategory(p.label));
  rectangles.forEach((r) => addCategory(r.label));

  const categories = Array.from(categoriesMap.entries()).map(([name, id]) => ({
    id,
    name,
    supercategory: "none",
  }));

  // 2. Build single image entry
  const imageId = 1;
  const images = [
    {
      id: imageId,
      file_name: imageMeta?.title || "image.png",
      width: imageDims.width,
      height: imageDims.height,
    },
  ];

  // 3. Build annotations
  let annId = 1;
  const annotations: any[] = [];

  polygons.forEach((p) => {
    const category_id = categoriesMap.get(p.label)!;
    // COCO segmentation is flattened [x1, y1, x2, y2, ...]
    const segmentation = p.points.flatMap((pt) => [pt.x, pt.y]);
    
    // BBox: [x, y, width, height]
    const [minX, minY, maxX, maxY] = p.bbox;
    const bbox = [minX, minY, maxX - minX, maxY - minY];
    const area = bbox[2] * bbox[3];

    annotations.push({
      id: annId++,
      image_id: imageId,
      category_id,
      segmentation: [segmentation],
      area,
      bbox,
      iscrowd: 0,
    });
  });

  rectangles.forEach((r) => {
    const category_id = categoriesMap.get(r.label)!;
    const x = Math.min(r.startX, r.endX);
    const y = Math.min(r.startY, r.endY);
    const width = Math.abs(r.endX - r.startX);
    const height = Math.abs(r.endY - r.startY);
    const area = width * height;

    annotations.push({
      id: annId++,
      image_id: imageId,
      category_id,
      segmentation: [],
      area,
      bbox: [x, y, width, height],
      iscrowd: 0,
    });
  });

  const cocoData = {
    info: {
      year: new Date().getFullYear(),
      version: "1.0",
      description: "Exported from Pineapple",
      contributor: annotatorName,
      date_created: new Date().toISOString(),
    },
    images,
    annotations,
    categories,
  };

  return JSON.stringify(cocoData, null, 2);
};

export const exportToYOLO = (
  polygons: Polygon[],
  rectangles: Rectangle[],
  imageDims: ImageDimensions
): { annotationsTxt: string; classesTxt: string } => {
  // 1. Extract unique categories (YOLO uses 0-indexed IDs)
  const categoriesMap = new Map<string, number>();
  let catId = 0;

  const addCategory = (label: string) => {
    if (!categoriesMap.has(label)) {
      categoriesMap.set(label, catId++);
    }
  };

  polygons.forEach((p) => addCategory(p.label));
  rectangles.forEach((r) => addCategory(r.label));

  const classesTxt = Array.from(categoriesMap.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([name]) => name)
    .join("\n");

  // 2. Build annotations
  // YOLO format: <class_index> <x_center> <y_center> <width> <height>
  // All coordinates are normalized [0, 1] relative to image dimensions
  let annotationsTxt = "";

  const addYoloLine = (label: string, bbox: [number, number, number, number]) => {
    const classIdx = categoriesMap.get(label)!;
    const [minX, minY, maxX, maxY] = bbox;
    
    const xCenter = ((minX + maxX) / 2) / imageDims.width;
    const yCenter = ((minY + maxY) / 2) / imageDims.height;
    const w = (maxX - minX) / imageDims.width;
    const h = (maxY - minY) / imageDims.height;

    // Format to 6 decimal places for precision
    annotationsTxt += `${classIdx} ${xCenter.toFixed(6)} ${yCenter.toFixed(6)} ${w.toFixed(6)} ${h.toFixed(6)}\n`;
  };

  polygons.forEach((p) => {
    addYoloLine(p.label, p.bbox as [number, number, number, number]);
  });

  rectangles.forEach((r) => {
    const minX = Math.min(r.startX, r.endX);
    const minY = Math.min(r.startY, r.endY);
    const maxX = Math.max(r.startX, r.endX);
    const maxY = Math.max(r.startY, r.endY);
    addYoloLine(r.label, [minX, minY, maxX, maxY]);
  });

  return { annotationsTxt, classesTxt };
};
