import { Label } from "./interfaces";

export const PROJECT_NAME = "Pineapple";

export const DEFAULT_LABEL = "Polygon";

export const labels: Label[] = [
  { name: "Label A", code: "LA" },
  { name: "Label B", code: "LB" },
];

export const aspectRatios = [
  { label: "16:9", value: "16:9", ratio: 16 / 9 },
  { label: "4:3", value: "4:3", ratio: 4 / 3 },
  { label: "1:1", value: "1:1", ratio: 1 },
  { label: "3:4", value: "3:4", ratio: 3 / 4 },
  { label: "9:16", value: "9:16", ratio: 9 / 16 },
  { label: "Full", value: "full", ratio: null },
];

export const LIME_PRIMARY_BTN_STYLES =
  "!bg-lime-700 dark:!bg-lime-800  !text-white !border-lime-700 dark:!border-lime-800";

export const AMBER_PRIMARY_BTN_STYLES =
  "!text-white !bg-amber-800 dark:bg-amber-900 !border-amber-800 dark:!border-amber-900";

export const RED_SECONDARY_BTN_STYLES =
  "!bg-transparent !border !border-red-500 !text-red-500";
