// v18072026
// src/Components/PolygonDrawer/PolygonDrawer.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Check,
  Hexagon,
  List,
  Minus,
  Plus,
  Square,
  ThumbsUp,
  Undo2,
  X,
} from "lucide-react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";

import { useViewport, ZOOM_MAX, ZOOM_MIN } from "../../hooks/useViewport";
import {
  AMBER_PRIMARY_BTN_STYLES,
  LIME_PRIMARY_BTN_STYLES,
} from "../../Services/constants";
import {
  calculateBBox,
  generateAnnotationColor,
} from "../../Services/functionServices";
import { Polygon, Rectangle } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";
import LabelInputDialog from "../LabelInputDialog/LabelInputDialog";
import "./PolygonDrawer.scss";

// Bumped from 14 → 22 to match the ~44px touch-target minimum
// (Apple HIG / Material Design), since this radius is what a user has to
// tap accurately to close a polygon on a touchscreen.
const CLOSE_HIT_RADIUS = 22;

// Gesture-disambiguation thresholds — see the gesture spec doc.
// A pointer-down while drawing resolves to a "tap" (place a point) only if
// it lifts within these bounds; otherwise it's treated as a pan-drag.
const TAP_MOVE_THRESHOLD = 10; // px
const TAP_TIME_THRESHOLD = 300; // ms

// A rectangle drag shorter than this (in image-space px) is treated as an
// accidental tap rather than an intentional box, and is discarded instead
// of opening the label dialog on a near-zero-size rectangle.
const MIN_RECT_SIZE = 6;

type DrawMode = "polygon" | "rectangle";

const ZOOM_STEP = 0.25; // per click of the +/- buttons or Ctrl+/-

// Preset levels for the mobile zoom dropdown — a single accurate tap instead
// of dragging a small slider handle. ZOOM_MIN (1) is fit-to-container, i.e. 100%.
const ZOOM_PRESETS = [1, 1.5, 2, 3, 4, 6, ZOOM_MAX];

const TOOLBAR_LABELS_STORAGE_KEY = "pineapple:toolbar-labels-visible";

// Log-scale mapping so the slider feels linear-ish across the whole
// zoom range instead of sluggish near 100% / twitchy near 800%.
const zoomToSliderT = (zoom: number) =>
  Math.log(zoom / ZOOM_MIN) / Math.log(ZOOM_MAX / ZOOM_MIN);
const sliderTToZoom = (t: number) => ZOOM_MIN * (ZOOM_MAX / ZOOM_MIN) ** t;

// Returns true when keyboard focus is inside any text-editable element.
// Used to suppress canvas keyboard shortcuts while the label dialog is open.
const isFocusInInput = (): boolean => {
  const el = document.activeElement;
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  );
};

const PolygonDrawer = ({ setShowListOfPolygons }) => {
  const navigate = useNavigate();
  const state = usePineappleStore();
  const { setPolygons, setRectangles, showToast } = state;

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [labelDialogVisible, setLabelDialogVisible] = useState(false);
  const pendingPolygonRef = useRef<Polygon | null>(null);

  // ── Rectangle tool ──────────────────────────────────────────────────────
  // Unlike polygons (tap-to-place-a-point), a rectangle is drawn with a
  // single click-drag/touch-drag gesture — pointerdown marks the first
  // corner, pointermove drags the opposite corner, pointerup finalizes it.
  const [drawMode, setDrawMode] = useState<DrawMode>("polygon");
  const [currentRectangle, setCurrentRectangle] = useState<Rectangle | null>(
    null,
  );
  // Non-null while a rectangle drag is in progress; holds the image-space
  // anchor corner so we don't need to re-derive it from state each move.
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);
  const pendingRectangleRef = useRef<Rectangle | null>(null);

  // ── Toolbar label visibility ────────────────────────────────────────────
  // Icon-only by default (locked decision), toggled via a small icon in the
  // toolbar itself, persisted per-browser since it's a display preference,
  // not project data. Applies to every toolbar button except zoom controls.
  const [labelsVisible, setLabelsVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem(TOOLBAR_LABELS_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TOOLBAR_LABELS_STORAGE_KEY, String(labelsVisible));
    } catch {
      // localStorage unavailable (e.g. private browsing) — setting just
      // won't persist across sessions, not worth surfacing to the user.
    }
  }, [labelsVisible]);

  const isPanningRef = useRef(false);
  const lastPanPos = useRef<{ x: number; y: number } | null>(null);

  // Active touch/mouse pointers, keyed by pointerId — size 2 means a pinch
  // gesture is in progress.
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(
    new Map(),
  );
  // Snapshot of the pinch gesture from the previous move event, so zoom/pan
  // deltas are computed frame-to-frame rather than from a fixed start point.
  const pinchStateRef = useRef<{
    distance: number;
    cx: number;
    cy: number;
  } | null>(null);
  // Undecided single-pointer gesture while addNew=true — resolves to either
  // "place a point" (tap) or "pan" (drag past the threshold) on release.
  const tapStateRef = useRef<{
    x: number;
    y: number;
    time: number;
    moved: boolean;
  } | null>(null);

  const {
    canvasRef,
    containerRef,
    viewport,
    toScreen,
    toImage,
    zoomAt,
    resetZoom,
    applyPan,
    prepareCanvas,
  } = useViewport(image);

  // ── Image load ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!state.imageSelected?.url) return;
    const img = new Image();
    img.src = state.imageSelected.url;
    img.onload = () => setImage(img);
  }, [state.imageSelected?.url]);

  useEffect(() => {
    setShowContent(true);
  }, []);

  // ── Draw ──────────────────────────────────────────────────────────────────

  const drawPolygon = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: { x: number; y: number }[],
      color: string,
      label: string,
    ) => {
      if (points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = `${color}50`;
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
      const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, cx, cy);
      ctx.shadowBlur = 0;
    },
    [],
  );

  const drawInProgress = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      points: { x: number; y: number }[],
      color: string,
    ) => {
      if (points.length === 0) return;

      if (points.length >= 2) {
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      points.forEach((pt, i) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? "#ffffff" : color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.fill();
        ctx.stroke();
      });

      if (points.length >= 3) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, CLOSE_HIT_RADIUS, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
    [],
  );

  // Draws a rectangle in screen space. `inProgress` renders the dashed,
  // unfilled, unlabeled variant used while the drag is still live — mirrors
  // the polygon/in-progress-polygon split above.
  const drawRectangle = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      corners: { x1: number; y1: number; x2: number; y2: number },
      color: string,
      label: string,
      inProgress = false,
    ) => {
      const { x1, y1, x2, y2 } = corners;
      const w = x2 - x1;
      const h = y2 - y1;
      if (w === 0 || h === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (inProgress) ctx.setLineDash([6, 3]);
      ctx.rect(x1, y1, w, h);
      if (!inProgress) {
        ctx.fillStyle = `${color}50`;
        ctx.fill();
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (!inProgress) {
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "rgba(0,0,0,0.7)";
        ctx.shadowBlur = 4;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x1 + w / 2, y1 + h / 2);
        ctx.shadowBlur = 0;
      }
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !prepareCanvas(ctx)) return;

    // Canvas is always sized to the container. Clear the whole thing.
    ctx.clearRect(0, 0, viewport.containerWidth, viewport.containerHeight);

    // Draw the image at its zoomed size, offset by pan.
    // panX/panY already include the centering offset (originX/Y), so at
    // zoom=1 this naturally centers the image inside the container.
    //
    // Drawn size = fitWidth * zoom × fitHeight * zoom
    // This means at zoom=2 the image is twice as wide/tall and overflows
    // the canvas edges — which are clipped by the container's overflow:hidden.
    ctx.drawImage(
      image,
      viewport.panX,
      viewport.panY,
      viewport.fitWidth * viewport.zoom,
      viewport.fitHeight * viewport.zoom,
    );

    // Polygons: toScreen() maps image-space → screen-space using the exact
    // same math as the image draw above, so they always align correctly.
    state.polygons.forEach((polygon) => {
      const screenPoints = polygon.points.map(toScreen);
      drawPolygon(ctx, screenPoints, polygon.color, polygon.label);
    });

    // Rectangles: same toScreen() mapping, just two corners instead of a
    // point list. Stored startX/Y/endX/Y aren't guaranteed min→max (a drag
    // can go in any direction), so screen-space corners are used as-is —
    // ctx.rect() below handles negative width/height fine.
    state.rectangles.forEach((rectangle) => {
      const p1 = toScreen({ x: rectangle.startX, y: rectangle.startY });
      const p2 = toScreen({ x: rectangle.endX, y: rectangle.endY });
      drawRectangle(
        ctx,
        { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y },
        rectangle.color,
        rectangle.label,
      );
    });

    if (addNew && clickedPoints.length > 0 && currentPolygon) {
      const screenPoints = clickedPoints.map(toScreen);
      drawInProgress(ctx, screenPoints, currentPolygon.color);
    }

    if (addNew && drawMode === "rectangle" && currentRectangle) {
      const p1 = toScreen({
        x: currentRectangle.startX,
        y: currentRectangle.startY,
      });
      const p2 = toScreen({
        x: currentRectangle.endX,
        y: currentRectangle.endY,
      });
      drawRectangle(
        ctx,
        { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y },
        currentRectangle.color,
        "",
        true,
      );
    }
  }, [
    image,
    viewport,
    state.polygons,
    state.rectangles,
    clickedPoints,
    addNew,
    currentPolygon,
    currentRectangle,
    drawMode,
    toScreen,
    drawPolygon,
    drawRectangle,
    drawInProgress,
    prepareCanvas,
    canvasRef,
  ]);

  // ── Zoom / pan ────────────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();

      // Ctrl/Cmd+wheel — also how browsers report trackpad pinch-zoom as a
      // wheel event — zooms toward the cursor.
      if (e.ctrlKey) {
        const direction = e.deltaY < 0 ? 1 : -1;
        zoomAt(e.clientX - rect.left, e.clientY - rect.top, direction * 0.12);
        return;
      }

      // Shift+wheel — horizontal pan. Some browsers already move the value
      // into deltaX once Shift is held; fall back to deltaY if not.
      if (e.shiftKey) {
        const amount = e.deltaX !== 0 ? e.deltaX : e.deltaY;
        applyPan(-amount, 0);
        return;
      }

      // Plain scroll (wheel or trackpad) — pan in both directions.
      applyPan(-e.deltaX, -e.deltaY);
    };
    canvas.addEventListener("wheel", onWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", onWheel);
  }, [canvasRef, zoomAt, applyPan]);

  // Ctrl/Cmd + Plus/Minus — zoom toward the viewport center.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isFocusInInput()) return;
      if (!(e.ctrlKey || e.metaKey)) return;
      if (!["+", "=", "-", "_"].includes(e.key)) return;
      e.preventDefault();
      const direction = e.key === "-" || e.key === "_" ? -1 : 1;
      zoomAt(
        viewport.containerWidth / 2,
        viewport.containerHeight / 2,
        direction * ZOOM_STEP,
      );
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomAt, viewport.containerWidth, viewport.containerHeight]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !addNew && !isFocusInInput()) {
        e.preventDefault();
        isPanningRef.current = true;
        if (canvasRef.current) canvasRef.current.style.cursor = "grab";
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isPanningRef.current = false;
        lastPanPos.current = null;
        if (canvasRef.current) {
          canvasRef.current.style.cursor = addNew ? "crosshair" : "default";
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [addNew, canvasRef]);

  // ── Label dialog ──────────────────────────────────────────────────────────

  const openLabelDialog = useCallback((polygon: Polygon) => {
    pendingPolygonRef.current = polygon;
    pendingRectangleRef.current = null;
    setLabelDialogVisible(true);
  }, []);

  const openRectangleLabelDialog = useCallback((rectangle: Rectangle) => {
    pendingRectangleRef.current = rectangle;
    pendingPolygonRef.current = null;
    setLabelDialogVisible(true);
  }, []);

  const handleLabelConfirm = useCallback(
    (label: string) => {
      if (pendingRectangleRef.current) {
        const rectangle = pendingRectangleRef.current;
        setRectangles([...state.rectangles, { ...rectangle, label }]);
        pendingRectangleRef.current = null;
        setLabelDialogVisible(false);
        setCurrentRectangle(null);
        setAddNew(false);
        showToast("success", "Success", `Rectangle "${label}" added.`);
        return;
      }

      const polygon = pendingPolygonRef.current;
      if (!polygon) return;
      setPolygons([...state.polygons, { ...polygon, label }]);
      pendingPolygonRef.current = null;
      setLabelDialogVisible(false);
      setCurrentPolygon(null);
      setClickedPoints([]);
      setAddNew(false);
      showToast("success", "Success", `Polygon "${label}" added.`);
    },
    [state.polygons, state.rectangles, setPolygons, setRectangles, showToast],
  );

  const handleLabelCancel = useCallback(() => {
    if (pendingRectangleRef.current) {
      pendingRectangleRef.current = null;
      setLabelDialogVisible(false);
      // Unlike a polygon (which keeps its committed points on cancel), a
      // rectangle has nothing partial to preserve — just clear it and let
      // the user drag a fresh box.
      setCurrentRectangle(null);
      setAddNew(true);
      return;
    }

    pendingPolygonRef.current = null;
    setLabelDialogVisible(false);
    // Keep the in-progress polygon so the user can keep editing
    setAddNew(true);
  }, []);

  // ── Polygon controls ──────────────────────────────────────────────────────

  const handleCompletePolygon = useCallback(() => {
    if (!currentPolygon || currentPolygon.points.length < 3) {
      showToast("warn", "Warning", "A polygon needs at least 3 points.");
      return;
    }
    openLabelDialog({ ...currentPolygon });
  }, [currentPolygon, openLabelDialog, showToast]);

  const handleUndoLastPoint = useCallback(() => {
    if (!currentPolygon || currentPolygon.points.length === 0) return;
    if (currentPolygon.points.length === 1) {
      setCurrentPolygon(null);
      setClickedPoints([]);
      return;
    }
    const updatedPoints = currentPolygon.points.slice(0, -1);
    setCurrentPolygon({
      ...currentPolygon,
      points: updatedPoints,
      bbox: image
        ? calculateBBox(updatedPoints, image.naturalWidth, image.naturalHeight)
        : currentPolygon.bbox,
    });
    setClickedPoints(updatedPoints);
  }, [currentPolygon, image]);

  const handleCancelDrawing = useCallback(() => {
    setAddNew(false);
    setCurrentPolygon(null);
    setClickedPoints([]);
    setCurrentRectangle(null);
    rectStartRef.current = null;
  }, []);

  // Keyboard shortcuts — ONLY fire when focus is NOT inside a text input.
  // Undo/Enter-to-complete are polygon-only concepts (a rectangle has no
  // intermediate points and completes on pointer-up, not on a keypress).
  useEffect(() => {
    if (!addNew || drawMode !== "polygon") return;
    const onKeyDown = (e: KeyboardEvent) => {
      // If the label dialog is open and focus is in an input, let the browser
      // handle the keystroke normally — do not intercept it for canvas actions.
      if (isFocusInInput()) return;

      if (e.key === "Escape") {
        e.preventDefault();
        // First Escape undoes last point; if no points remain, cancels drawing
        if (!currentPolygon || currentPolygon.points.length === 0) {
          handleCancelDrawing();
        } else {
          handleUndoLastPoint();
        }
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleUndoLastPoint();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleCompletePolygon();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    addNew,
    drawMode,
    handleUndoLastPoint,
    handleCompletePolygon,
    handleCancelDrawing,
    currentPolygon,
  ]);

  // Escape while rectangle drawing is armed — no undo concept, so it just
  // exits drawing mode outright.
  useEffect(() => {
    if (!addNew || drawMode !== "rectangle") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (isFocusInInput()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancelDrawing();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [addNew, drawMode, handleCancelDrawing]);

  // ── Pointer events ────────────────────────────────────────────────────────
  //
  // Gesture model (see zoom/pan gesture spec):
  //   2 pointers down            → pinch-zoom + two-finger pan, always.
  //   1 pointer, not drawing     → pan immediately (same as before).
  //   1 pointer, drawing (addNew) → undecided until release: a short/small
  //                                  movement resolves to "place a point",
  //                                  anything past the threshold becomes a pan.
  //
  // Note: there's no existing "drag an already-placed point to reposition
  // it" feature in this codebase, so that priority branch from the spec
  // doesn't apply yet — this only disambiguates tap vs. pan.

  // Converts a raw client-space tap into a placed/closed polygon point.
  // This replaces the old onClick handler — it's now invoked from
  // handlePointerUp once a gesture has resolved to a tap, so it works
  // identically for mouse and touch.
  const resolveTap = useCallback(
    (clientX: number, clientY: number) => {
      if (!image) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const cssX = clientX - rect.left;
      const cssY = clientY - rect.top;
      const imagePoint = toImage({ x: cssX, y: cssY });

      if (!currentPolygon) {
        const newPolygon: Polygon = {
          color: generateAnnotationColor(),
          label: `Polygon ${state.polygons.length + 1}`,
          points: [imagePoint],
          bbox: calculateBBox(
            [imagePoint],
            image.naturalWidth,
            image.naturalHeight,
          ),
          units: 0,
        };
        setCurrentPolygon(newPolygon);
        setClickedPoints([imagePoint]);
        return;
      }

      if (currentPolygon.points.length >= 3) {
        const firstScreen = toScreen(currentPolygon.points[0]);
        if (
          Math.hypot(cssX - firstScreen.x, cssY - firstScreen.y) <=
          CLOSE_HIT_RADIUS
        ) {
          handleCompletePolygon();
          return;
        }
      }

      const updatedPoints = [...currentPolygon.points, imagePoint];
      setCurrentPolygon({
        ...currentPolygon,
        points: updatedPoints,
        bbox: calculateBBox(
          updatedPoints,
          image.naturalWidth,
          image.naturalHeight,
        ),
      });
      setClickedPoints(updatedPoints);
    },
    [
      currentPolygon,
      image,
      toImage,
      toScreen,
      state.polygons.length,
      handleCompletePolygon,
      canvasRef,
    ],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      activePointersRef.current.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
      });

      if (activePointersRef.current.size === 2) {
        // Entering a pinch — abandon any pending tap/pan from pointer #1.
        tapStateRef.current = null;
        isPanningRef.current = false;
        lastPanPos.current = null;
        const pts = Array.from(activePointersRef.current.values());
        pinchStateRef.current = {
          distance: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          cx: (pts[0].x + pts[1].x) / 2,
          cy: (pts[0].y + pts[1].y) / 2,
        };
        return;
      }

      if (activePointersRef.current.size > 2) return; // ignore a 3rd touch

      // Pan on left-button/single-finger drag when not actively drawing.
      // Spacebar is an additional shortcut that also enables pan while addNew=true.
      if (!addNew || isPanningRef.current) {
        isPanningRef.current = true;
        lastPanPos.current = { x: e.clientX, y: e.clientY };
        if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        return;
      }

      // Rectangle tool: no tap-vs-pan ambiguity to resolve — a single-pointer
      // drag always draws the box, so the anchor corner is committed
      // immediately on pointerdown.
      if (drawMode === "rectangle") {
        if (!image) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const imagePoint = toImage({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
        rectStartRef.current = imagePoint;
        setCurrentRectangle({
          label: "",
          color: generateAnnotationColor(),
          startX: imagePoint.x,
          startY: imagePoint.y,
          endX: imagePoint.x,
          endY: imagePoint.y,
        });
        return;
      }

      // Polygon tool, single pointer, no modifier — undecided gesture.
      tapStateRef.current = {
        x: e.clientX,
        y: e.clientY,
        time: Date.now(),
        moved: false,
      };
    },
    [addNew, drawMode, image, toImage, canvasRef],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, {
          x: e.clientX,
          y: e.clientY,
        });
      }

      // Two fingers down → pinch-zoom, plus pan if the centroid drifts.
      if (activePointersRef.current.size === 2 && pinchStateRef.current) {
        const pts = Array.from(activePointersRef.current.values());
        const distance = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const cx = (pts[0].x + pts[1].x) / 2;
        const cy = (pts[0].y + pts[1].y) / 2;
        const rect = canvasRef.current?.getBoundingClientRect();

        if (rect && pinchStateRef.current.distance > 0) {
          const scaleRatio = distance / pinchStateRef.current.distance;
          // zoomAt takes an additive delta, so convert the pinch's relative
          // scale change into a delta relative to the current zoom level.
          const zoomDelta = viewport.zoom * (scaleRatio - 1);
          zoomAt(cx - rect.left, cy - rect.top, zoomDelta);

          const dx = cx - pinchStateRef.current.cx;
          const dy = cy - pinchStateRef.current.cy;
          if (Math.hypot(dx, dy) > 3) {
            applyPan(dx, dy);
          }
        }
        pinchStateRef.current = { distance, cx, cy };
        return;
      }

      // Rectangle drag in progress — drag the opposite corner.
      if (rectStartRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect();
        if (rect) {
          const imagePoint = toImage({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
          setCurrentRectangle((prev) =>
            prev ? { ...prev, endX: imagePoint.x, endY: imagePoint.y } : prev,
          );
        }
        return;
      }

      // Single pointer, gesture still undecided (polygon drawing mode).
      if (tapStateRef.current) {
        const dx = e.clientX - tapStateRef.current.x;
        const dy = e.clientY - tapStateRef.current.y;
        if (
          !tapStateRef.current.moved &&
          Math.hypot(dx, dy) > TAP_MOVE_THRESHOLD
        ) {
          // Crossed the threshold mid-gesture — commit to panning instead.
          tapStateRef.current.moved = true;
          isPanningRef.current = true;
          lastPanPos.current = { x: e.clientX, y: e.clientY };
          if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
        }
        if (tapStateRef.current.moved && lastPanPos.current) {
          applyPan(
            e.clientX - lastPanPos.current.x,
            e.clientY - lastPanPos.current.y,
          );
          lastPanPos.current = { x: e.clientX, y: e.clientY };
        }
        return;
      }

      // Ordinary pan drag (idle mode, or spacebar held while drawing).
      if (isPanningRef.current && lastPanPos.current) {
        applyPan(
          e.clientX - lastPanPos.current.x,
          e.clientY - lastPanPos.current.y,
        );
        lastPanPos.current = { x: e.clientX, y: e.clientY };
      }
    },
    [applyPan, zoomAt, viewport.zoom, toImage, canvasRef],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      activePointersRef.current.delete(e.pointerId);

      if (activePointersRef.current.size < 2) {
        pinchStateRef.current = null;
      }
      // One finger remains after a pinch ends — rebase the pan origin so
      // panning doesn't jump when it resumes with the remaining finger.
      if (activePointersRef.current.size === 1) {
        lastPanPos.current = Array.from(activePointersRef.current.values())[0];
      }

      if (rectStartRef.current) {
        rectStartRef.current = null;
        const rect = currentRectangle;
        if (rect) {
          const width = Math.abs(rect.endX - rect.startX);
          const height = Math.abs(rect.endY - rect.startY);
          if (width < MIN_RECT_SIZE || height < MIN_RECT_SIZE) {
            // Too small to be an intentional box — likely a stray tap.
            setCurrentRectangle(null);
          } else {
            openRectangleLabelDialog({
              ...rect,
              startX: Math.min(rect.startX, rect.endX),
              startY: Math.min(rect.startY, rect.endY),
              endX: Math.max(rect.startX, rect.endX),
              endY: Math.max(rect.startY, rect.endY),
            });
          }
        }
        return;
      }

      if (tapStateRef.current) {
        const { x, y, time, moved } = tapStateRef.current;
        const elapsed = Date.now() - time;
        if (!moved && elapsed < TAP_TIME_THRESHOLD) {
          resolveTap(x, y);
        }
        tapStateRef.current = null;
        isPanningRef.current = false;
        lastPanPos.current = null;
        if (canvasRef.current) canvasRef.current.style.cursor = "crosshair";
        return;
      }

      lastPanPos.current = null;
      if (canvasRef.current && !addNew) {
        isPanningRef.current = false;
        canvasRef.current.style.cursor = viewport.zoom > 1 ? "grab" : "default";
      }
    },
    [
      addNew,
      viewport.zoom,
      canvasRef,
      resolveTap,
      currentRectangle,
      openRectangleLabelDialog,
    ],
  );

  const zoomPercent = Math.round(viewport.zoom * 100);
  const zoomSliderValue = zoomToSliderT(viewport.zoom);

  const handleZoomSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetZoom = sliderTToZoom(parseFloat(e.target.value));
      zoomAt(
        viewport.containerWidth / 2,
        viewport.containerHeight / 2,
        targetZoom - viewport.zoom,
      );
    },
    [zoomAt, viewport.containerWidth, viewport.containerHeight, viewport.zoom],
  );

  const stepZoom = useCallback(
    (direction: 1 | -1) => {
      zoomAt(
        viewport.containerWidth / 2,
        viewport.containerHeight / 2,
        direction * ZOOM_STEP,
      );
    },
    [zoomAt, viewport.containerWidth, viewport.containerHeight],
  );

  // ── Mobile zoom control ──────────────────────────────────────────────────
  // Uses PrimeReact's Dropdown, which renders its overlay panel through its
  // own internal portal (appendTo="self" by default renders inline, so we
  // explicitly set appendTo={document.body}) — this sidesteps the same
  // overflow-x-auto clipping issue a hand-rolled popover would hit here,
  // without us having to manage positioning/click-outside/portal manually.
  const selectZoomPreset = useCallback(
    (target: number) => {
      zoomAt(
        viewport.containerWidth / 2,
        viewport.containerHeight / 2,
        target - viewport.zoom,
      );
    },
    [zoomAt, viewport.containerWidth, viewport.containerHeight, viewport.zoom],
  );

  // ── Hint text ─────────────────────────────────────────────────────────────
  // One sentence, tailored to exactly what the user can do right now — the
  // biggest source of "how does this work?" confusion for a first-time user
  // is this line staying generic while the toolbar underneath it changes
  // shape (literally) depending on drawMode.
  const hintText = (() => {
    if (!addNew) {
      return drawMode === "polygon"
        ? "Polygon tool selected — tap Add Polygon, then click points around the shape to trace it. Scroll to pan, Ctrl+scroll or pinch to zoom."
        : "Rectangle tool selected — tap Add Rectangle, then click and drag a box around the shape. Scroll to pan, Ctrl+scroll or pinch to zoom.";
    }
    if (drawMode === "rectangle") {
      return "Click and drag across the image to draw a box — release to finish. Esc cancels.";
    }
    const pointCount = currentPolygon?.points.length ?? 0;
    return `${pointCount} point${pointCount === 1 ? "" : "s"} placed — click to add more, click the first point (or press Enter) to close the shape, Esc to undo the last point. Drag to pan, pinch/Ctrl+scroll to zoom.`;
  })();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        className={`customScrollbar h-full p-2 pb-20 md:pb-4 sm:p-4 flex flex-col bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md overflow-hidden transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* ── Header — title + hint only. Actions live in the toolbar below.
            Hint is allowed to wrap to two lines (no truncate) since a
            first-time user reading it in full matters more than a tidy
            single line. ── */}
        <div className="flex-none px-1 mb-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-heading text-amber-700 dark:text-amber-300 font-bold truncate">
            Draw annotations
          </h1>
          <p className="text-xs sm:text-sm font-content text-amber-600 dark:text-amber-400">
            {hintText}
          </p>
        </div>

        {/* ── Unified toolbar — one docked row, md+ only. Google Docs/Word
            pattern: mode actions | polygons/continue | zoom, all in a single
            line, scrolls horizontally rather than wrapping or floating.
            Labels are icon-only by default — see labelsVisible toggle at
            the end of the row. ── */}
        <div className="hidden md:flex flex-none items-center gap-2.5 mb-3 px-2 py-1.5 overflow-x-auto whitespace-nowrap rounded-xl bg-white/70 dark:bg-stone-800/50 shadow-sm">
          <div className="flex items-center gap-1.5 flex-none">
            {!addNew ? (
              <>
                {/* Tool switcher — segmented control, sits right before the
                    Add button so the mode you're about to draw is obvious
                    before you commit to it. */}
                <div
                  role="group"
                  aria-label="Drawing tool"
                  className="flex items-center h-9 rounded-lg border border-amber-200/60 dark:border-amber-800/50 overflow-hidden flex-none"
                >
                  <button
                    type="button"
                    aria-pressed={drawMode === "polygon"}
                    title="Polygon tool — trace a shape point by point"
                    onClick={() => setDrawMode("polygon")}
                    className={`h-full px-2.5 text-sm flex items-center gap-1.5 transition-colors ${
                      drawMode === "polygon"
                        ? "bg-amber-500 dark:bg-amber-600 text-white"
                        : "bg-transparent text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-700/60"
                    }`}
                  >
                    <Hexagon size={16} />
                    {labelsVisible && <span>Polygon</span>}
                  </button>
                  <button
                    type="button"
                    aria-pressed={drawMode === "rectangle"}
                    title="Rectangle tool — click and drag a box"
                    onClick={() => setDrawMode("rectangle")}
                    className={`h-full px-2.5 text-sm flex items-center gap-1.5 transition-colors border-l border-amber-200/60 dark:border-amber-800/50 ${
                      drawMode === "rectangle"
                        ? "bg-amber-500 dark:bg-amber-600 text-white"
                        : "bg-transparent text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-stone-700/60"
                    }`}
                  >
                    <Square size={16} />
                    {labelsVisible && <span>Rectangle</span>}
                  </button>
                </div>

                <Button
                  disabled={state.imageSelected.url === ""}
                  title={
                    labelsVisible
                      ? undefined
                      : drawMode === "polygon"
                        ? "Add Polygon"
                        : "Add Rectangle"
                  }
                  className={`${AMBER_PRIMARY_BTN_STYLES} h-9 ${labelsVisible ? "px-4 gap-1.5" : "px-2.5"} text-sm flex items-center rounded-lg!`}
                  onClick={() => setAddNew(true)}
                >
                  {drawMode === "polygon" ? (
                    <Hexagon size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                  {labelsVisible && (
                    <span>
                      {drawMode === "polygon" ? "Add Polygon" : "Add Rectangle"}
                    </span>
                  )}
                </Button>
              </>
            ) : drawMode === "polygon" ? (
              <>
                <Button
                  title={labelsVisible ? undefined : "Cancel"}
                  onClick={handleCancelDrawing}
                  className={`h-9 ${labelsVisible ? "px-3 gap-1.5" : "px-2.5"} text-sm flex items-center !rounded-lg !border-transparent !bg-stone-100/80 dark:!bg-stone-700/60 !text-stone-500 dark:!text-stone-400 hover:!bg-stone-200 dark:hover:!bg-stone-700`}
                >
                  <X size={16} />
                  {labelsVisible && <span>Cancel</span>}
                </Button>
                <Button
                  title={labelsVisible ? undefined : "Undo last point"}
                  disabled={
                    !currentPolygon || currentPolygon.points.length === 0
                  }
                  onClick={handleUndoLastPoint}
                  className={`h-9 ${labelsVisible ? "px-3 gap-1.5" : "px-2.5"} text-sm flex items-center !rounded-lg !border-transparent !bg-amber-50/80 dark:!bg-stone-700/60 !text-amber-700 dark:!text-amber-300 hover:!bg-amber-100 dark:hover:!bg-stone-600`}
                >
                  <Undo2 size={16} />
                  {labelsVisible && <span>Undo Point</span>}
                </Button>
                <Button
                  title={
                    labelsVisible
                      ? undefined
                      : "Complete polygon (needs 3+ points)"
                  }
                  disabled={!currentPolygon || currentPolygon.points.length < 3}
                  onClick={handleCompletePolygon}
                  className={`${AMBER_PRIMARY_BTN_STYLES} h-9 ${labelsVisible ? "px-4 gap-1.5" : "px-2.5"} text-sm flex items-center rounded-lg!`}
                >
                  <Check size={16} />
                  {labelsVisible && <span>Complete Polygon</span>}
                </Button>
                {currentPolygon && currentPolygon.points.length > 0 && (
                  <span className="ml-1 px-2.5 py-1 rounded-full text-xs font-content bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex-none">
                    {currentPolygon.points.length} / 3 min
                  </span>
                )}
              </>
            ) : (
              <>
                <Button
                  title={labelsVisible ? undefined : "Cancel"}
                  onClick={handleCancelDrawing}
                  className={`h-9 ${labelsVisible ? "px-3 gap-1.5" : "px-2.5"} text-sm flex items-center !rounded-lg !border-transparent !bg-stone-100/80 dark:!bg-stone-700/60 !text-stone-500 dark:!text-stone-400 hover:!bg-stone-200 dark:hover:!bg-stone-700`}
                >
                  <X size={16} />
                  {labelsVisible && <span>Cancel</span>}
                </Button>
                <span className="ml-1 px-2.5 py-1 rounded-full text-xs font-content bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex-none">
                  Drag on the image to draw a box
                </span>
              </>
            )}
          </div>

          <div className="w-px h-6 self-center bg-amber-200/50 dark:bg-amber-800/40 flex-none" />

          <div className="flex items-center gap-1.5 flex-none">
            <Button
              disabled={state.polygons.length + state.rectangles.length < 1}
              title={
                labelsVisible
                  ? undefined
                  : `Shapes (${state.polygons.length + state.rectangles.length})`
              }
              className={`${AMBER_PRIMARY_BTN_STYLES} h-9 ${labelsVisible ? "px-3 gap-1.5" : "px-2.5"} text-sm flex items-center !rounded-lg`}
              onClick={() => setShowListOfPolygons(true)}
            >
              <List size={16} />
              {labelsVisible && (
                <span>
                  Shapes ({state.polygons.length + state.rectangles.length})
                </span>
              )}
            </Button>
            <Button
              disabled={
                state?.imageSelected?.url?.length <= 0 ||
                state.polygons.length + state.rectangles.length < 1
              }
              title={labelsVisible ? undefined : "Continue"}
              className={`${LIME_PRIMARY_BTN_STYLES} h-9 ${labelsVisible ? "px-3 gap-1.5" : "px-2.5"} text-sm flex items-center !rounded-lg`}
              onClick={() => navigate("/preview")}
            >
              <ThumbsUp size={16} />
              {labelsVisible && <span>Continue</span>}
            </Button>
          </div>

          <div className="flex-1 min-w-2" />

          <div className="w-px h-6 self-center bg-amber-200/50 dark:bg-amber-800/40 flex-none" />

          <div className="flex items-center gap-1 flex-none pl-1">
            <button
              aria-label="Zoom out"
              title="Zoom out"
              onClick={() => stepZoom(-1)}
              className="h-7 w-7 flex-none flex items-center justify-center rounded-full text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
            >
              <Minus size={14} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.001}
              value={zoomSliderValue}
              onChange={handleZoomSlider}
              aria-label="Zoom level"
              className="w-16 sm:w-24 accent-amber-500"
            />
            <button
              aria-label="Zoom in"
              title="Zoom in"
              onClick={() => stepZoom(1)}
              className="h-7 w-7 flex-none flex items-center justify-center rounded-full text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={resetZoom}
              title="Reset zoom"
              className="w-12 flex-none text-xs font-content text-amber-700 dark:text-amber-300 tabular-nums text-center rounded-md py-1 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
            >
              {zoomPercent}%
            </button>
          </div>

          <div className="w-px h-6 self-center bg-amber-200/50 dark:bg-amber-800/40 flex-none" />

          {/* Labels toggle — icon-only by default (locked decision).
              Doesn't affect the zoom group above. */}
          <button
            aria-label={
              labelsVisible ? "Hide button labels" : "Show button labels"
            }
            aria-pressed={labelsVisible}
            title={labelsVisible ? "Hide labels" : "Show labels"}
            onClick={() => setLabelsVisible((v) => !v)}
            className={`h-7 w-8 flex-none flex items-center justify-center rounded-md text-xs font-content font-semibold transition-colors ${
              labelsVisible
                ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
                : "text-amber-500 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900"
            }`}
          >
            Aa
          </button>
        </div>

        {/* ── Canvas area ── */}
        <div className="flex-1 min-h-0 w-full">
          <div
            className="w-full h-full overflow-hidden rounded-xl lg:rounded-2xl"
            ref={containerRef}
          >
            <canvas
              className={`block w-full h-full touch-none ${addNew ? "cursor-crosshair" : viewport.zoom > 1 ? "cursor-grab" : "cursor-default"}`}
              style={{ touchAction: "none" }}
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
          </div>
        </div>
      </div>

      {/* ── Mobile toolbar — same content set as the desktop row above,
          docked to the bottom instead of the top (thumbs reach the bottom
          more easily), single scrollable line instead of wrapping. Zoom is
          a dropdown here instead of a slider — a tap on a preset is more
          accurate than dragging a small handle on a touchscreen. ── */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-amber-200/60 dark:border-amber-800/50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] px-2 py-2 pr-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap safe-area-bottom"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {addNew && drawMode === "polygon" && (
          <div className="flex items-center gap-1.5 flex-none">
            <Button
              aria-label="Cancel drawing"
              title={labelsVisible ? undefined : "Cancel"}
              onClick={handleCancelDrawing}
              className={`h-11 ${labelsVisible ? "px-3 gap-1.5" : "w-11 justify-center"} flex items-center !border-transparent !bg-stone-100/80 dark:!bg-stone-800/70 !text-stone-500 dark:!text-stone-400 !rounded-xl flex-none`}
            >
              <X size={18} />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  Cancel
                </span>
              )}
            </Button>
            <Button
              aria-label="Undo last point"
              title={labelsVisible ? undefined : "Undo last point"}
              disabled={!currentPolygon || currentPolygon.points.length === 0}
              onClick={handleUndoLastPoint}
              className={`h-11 ${labelsVisible ? "px-3 gap-1.5" : "w-11 justify-center"} flex items-center border-transparent! bg-amber-50/80! dark:bg-stone-800/70! text-amber-700! dark:text-amber-300! !rounded-xl flex-none`}
            >
              <Undo2 size={18} />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">Undo</span>
              )}
            </Button>
            <Button
              aria-label="Complete polygon"
              title={
                labelsVisible ? undefined : "Complete polygon (needs 3+ points)"
              }
              disabled={!currentPolygon || currentPolygon.points.length < 3}
              onClick={handleCompletePolygon}
              className={`h-11 ${labelsVisible ? "px-4 gap-1.5" : "w-11 justify-center"} flex items-center ${AMBER_PRIMARY_BTN_STYLES} rounded-xl! flex-none`}
            >
              <Check size={18} />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  Complete
                </span>
              )}
            </Button>
          </div>
        )}

        {addNew && drawMode === "rectangle" && (
          <div className="flex items-center gap-1.5 flex-none">
            <Button
              aria-label="Cancel drawing"
              title={labelsVisible ? undefined : "Cancel"}
              onClick={handleCancelDrawing}
              className={`h-11 ${labelsVisible ? "px-3 gap-1.5" : "w-11 justify-center"} flex items-center !border-transparent !bg-stone-100/80 dark:!bg-stone-800/70 !text-stone-500 dark:!text-stone-400 !rounded-xl flex-none`}
            >
              <X size={18} />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  Cancel
                </span>
              )}
            </Button>
            <span className="px-3 h-11 flex items-center rounded-xl text-xs font-content bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex-none whitespace-nowrap">
              Drag to draw a box
            </span>
          </div>
        )}

        {!addNew && (
          <div className="flex items-center gap-1.5 flex-none">
            {/* Tool switcher — same segmented control as desktop, just
                touch-sized (h-11). */}
            <div
              role="group"
              aria-label="Drawing tool"
              className="flex items-center h-11 rounded-xl border border-amber-200/60 dark:border-amber-800/50 overflow-hidden flex-none"
            >
              <button
                type="button"
                aria-pressed={drawMode === "polygon"}
                title="Polygon tool"
                onClick={() => setDrawMode("polygon")}
                className={`h-full w-11 flex items-center justify-center transition-colors ${
                  drawMode === "polygon"
                    ? "bg-amber-500 dark:bg-amber-600 text-white"
                    : "bg-transparent text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className="pi pi-share-alt text-base" />
              </button>
              <button
                type="button"
                aria-pressed={drawMode === "rectangle"}
                title="Rectangle tool"
                onClick={() => setDrawMode("rectangle")}
                className={`h-full w-11 flex items-center justify-center transition-colors border-l border-amber-200/60 dark:border-amber-800/50 ${
                  drawMode === "rectangle"
                    ? "bg-amber-500 dark:bg-amber-600 text-white"
                    : "bg-transparent text-amber-700 dark:text-amber-300"
                }`}
              >
                <span className="pi pi-stop text-base" />
              </button>
            </div>

            <Button
              aria-label={
                drawMode === "polygon" ? "Add polygon" : "Add rectangle"
              }
              title={
                labelsVisible
                  ? undefined
                  : drawMode === "polygon"
                    ? "Add polygon"
                    : "Add rectangle"
              }
              disabled={state.imageSelected.url === ""}
              onClick={() => {
                setAddNew(true);
                setCurrentPolygon(null);
                setClickedPoints([]);
                setCurrentRectangle(null);
              }}
              className={`h-11 ${labelsVisible ? "px-4 gap-1.5" : "w-11 justify-center"} flex items-center ${AMBER_PRIMARY_BTN_STYLES} rounded-xl! flex-none`}
            >
              <span className="pi pi-pencil text-base" />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  {drawMode === "polygon" ? "Add Polygon" : "Add Rectangle"}
                </span>
              )}
            </Button>
            <Button
              aria-label="Show shapes list"
              title={
                labelsVisible
                  ? undefined
                  : `Shapes (${state.polygons.length + state.rectangles.length})`
              }
              disabled={state.polygons.length + state.rectangles.length < 1}
              onClick={() => setShowListOfPolygons(true)}
              className={`h-11 ${labelsVisible ? "px-3 gap-1.5" : "w-11 justify-center"} flex items-center !border-transparent !bg-amber-50/80 dark:!bg-stone-800/70 !text-amber-700 dark:!text-amber-300 !rounded-xl flex-none`}
            >
              <span className="pi pi-list text-base" />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  Shapes ({state.polygons.length + state.rectangles.length})
                </span>
              )}
            </Button>
            <Button
              aria-label="Continue to preview"
              title={labelsVisible ? undefined : "Continue"}
              disabled={
                state?.imageSelected?.url?.length <= 0 ||
                state.polygons.length + state.rectangles.length < 1
              }
              onClick={() => navigate("/preview")}
              className={`h-11 ${labelsVisible ? "px-3 gap-1.5" : "w-11 justify-center"} flex items-center ${LIME_PRIMARY_BTN_STYLES} !rounded-xl flex-none`}
            >
              <span className="pi pi-thumbs-up text-base" />
              {labelsVisible && (
                <span className="text-xs font-content leading-none">
                  Continue
                </span>
              )}
            </Button>
          </div>
        )}

        <div className="w-px h-6 self-center mx-1 bg-amber-200/60 dark:bg-amber-800/50 flex-none" />

        {/* Zoom control — PrimeReact Dropdown. Its overlay panel uses its own
            internal portal (appendTo=document.body below), so it isn't
            subject to the overflow-x-auto clipping this row would otherwise
            cause for a hand-rolled popover. valueTemplate always shows the
            live zoom value (e.g. from pinch), even when it isn't an exact
            preset match. */}
        <Dropdown
          value={viewport.zoom}
          options={ZOOM_PRESETS}
          onChange={(e) => selectZoomPreset(e.value)}
          appendTo={typeof document !== "undefined" ? document.body : undefined}
          aria-label="Zoom level"
          valueTemplate={() => (
            <span className="text-sm font-content tabular-nums">
              {zoomPercent}%
            </span>
          )}
          itemTemplate={(option: number) => (
            <div className="flex items-center justify-between w-full text-sm font-content">
              <span>{Math.round(option * 100)}%</span>
              {Math.round(option * 100) === zoomPercent && (
                <span className="pi pi-check text-xs" />
              )}
            </div>
          )}
          panelClassName="!min-w-[7.5rem] !rounded-xl !border-amber-200 dark:!border-amber-800"
          className="h-11 flex-none flex items-center !rounded-xl !border-transparent !bg-amber-50/80 dark:!bg-stone-800/70 [&_.p-dropdown-label]:!px-3 [&_.p-dropdown-label]:!py-0 [&_.p-dropdown-trigger]:!w-7"
        />

        <div className="w-px h-6 self-center mx-1 bg-amber-200/60 dark:bg-amber-800/50 flex-none" />

        {/* Labels toggle — icon-only by default (locked decision) */}
        <button
          aria-label={
            labelsVisible ? "Hide button labels" : "Show button labels"
          }
          aria-pressed={labelsVisible}
          title={labelsVisible ? "Hide labels" : "Show labels"}
          onClick={() => setLabelsVisible((v) => !v)}
          className={`h-11 w-11 flex-none flex items-center justify-center rounded-xl text-sm font-content font-semibold transition-colors ${
            labelsVisible
              ? "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200"
              : "text-amber-500 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900"
          }`}
        >
          Aa
        </button>
      </div>

      <LabelInputDialog
        visible={labelDialogVisible}
        defaultLabel={
          pendingRectangleRef.current
            ? `Rectangle ${state.rectangles.length + 1}`
            : (currentPolygon?.label ?? `Polygon ${state.polygons.length + 1}`)
        }
        onConfirm={handleLabelConfirm}
        onCancel={handleLabelCancel}
      />
    </>
  );
};

export default PolygonDrawer;
