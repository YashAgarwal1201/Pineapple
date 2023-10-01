import { Dispatch, SetStateAction } from 'react';

import { Toast } from 'primereact/toast';

// import { AxiosResponse } from 'axios';

export type Action<T> = { type: string; payload?: T };

export interface State {
  [key: string]: any;
//   client_id: string;
  isOptionSelected: any;
  imageSelected: {
    title: string;
    url: string;
    type: string;
  };
  toast: Toast | null;
//   rectangles: Rectangle[];
  polygons: Polygon[];
}

export interface ToastInterface {
  severity: 'success' | 'info' | 'warn' | 'error' | undefined;
  summary: 'Success' | 'Info' | 'Warning' | 'Error';
  detail: string;
  life?: number;
}

export type ActionType =
  | Toast
  | boolean
  | string
  | null
//   | { client_id: string }
  | ToastInterface
  | { title: string; url: string; type: string }
//   | { title: string; url: string }
  | { key: string; value: boolean }
  | Rectangle
  | Polygon
  | Polygon[];

export interface AppContextType {
  state: State;
  dispatch: Dispatch<Action<ActionType>>;
  setRectangles: (newRectangles: Rectangle[]) => void;
  setPolygons: (newPolygons: Polygon[]) => void;
//   setClientId: (client_id: string) => void;
  setSelectedImage: (title: string, url: string, type: string) => void;
//   setSelectedCSV: (title: string, url: string) => void;
  showToast: (
    severity: 'success' | 'info' | 'warn' | 'error' | undefined,
    summary: 'Success' | 'Info' | 'Warning' | 'Error',
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
