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
