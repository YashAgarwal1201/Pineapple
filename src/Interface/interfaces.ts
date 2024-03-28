// File for type and interfaces definitons

import { Dispatch, SetStateAction } from "react";

import { Toast } from "primereact/toast";

export type Action<T> = { type: string; payload?: T };

export interface State {
  [key: string]: any;
  isOptionSelected: any;
  imageSelected: {
    title: string;
    url: string;
    type: string;
  };
  toast: Toast | null;
  polygons: Polygon[];
}

export interface ToastInterface {
  severity: "success" | "info" | "warn" | "error" | undefined;
  summary: "Success" | "Info" | "Warning" | "Error";
  detail: string;
  life?: number;
}

export type ActionType =
  | Toast
  | boolean
  | string
  | null
  | ToastInterface
  | { title: string; url: string; type: string }
  | { key: string; value: boolean }
  | Rectangle
  | Polygon
  | Polygon[];

export interface AppContextType {
  state: State;
  dispatch: Dispatch<Action<ActionType>>;
  setRectangles: (newRectangles: Rectangle[]) => void;
  setPolygons: (newPolygons: Polygon[]) => void;
  setSelectedImage: (title: string, url: string, type: string) => void;
  showToast: (
    severity: "success" | "info" | "warn" | "error" | undefined,
    summary: "Success" | "Info" | "Warning" | "Error",
    detail: string,
    life?: number
  ) => void;
}

export interface Rectangle {
  label: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}

export interface Polygon {
  bbox: number[];
  points: { x: number; y: number }[];
  color: string;
  label: string;
  units: string | number;
}

export interface Point {
  x: number;
  y: number;
}

export interface FormattedData {
  [objectName: string]: {
    count: number;
    pts: Point[];
  };
}

export type dispatchParamType = {
  type: string;
  contextStateKey: string;
  payload: any;
};

export type UploadImageOptionsDialogType = {
  showOptions: boolean;
  setShowOptions: Dispatch<SetStateAction<boolean>>;
  openCamera: boolean;
  setOpenCamera: Dispatch<SetStateAction<boolean>>;
  uploadHandeler: () => void;
  onCaptureImageClick: () => void;
};
