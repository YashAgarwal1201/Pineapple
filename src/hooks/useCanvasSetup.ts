import { useCallback, useEffect, useRef, useState } from "react";

export interface ScaleFactor {
  x: number;
  y: number;
}

/**
 * Handles canvas sizing, DPR compensation, and resize listening.
 *
 * Returns refs for the canvas and its parent container, the current
 * scaleFactor (image-space → CSS-pixel space), and a manual trigger
 * to recompute sizing when the image changes.
 *
 * Why DPR compensation matters:
 *   canvas.width sets the pixel buffer, not the CSS display size.
 *   Without DPR scaling, on a retina screen (DPR=2) the browser
 *   stretches a 300px buffer across 600 CSS pixels → blurry.
 *   Fix: set buffer = CSS size × DPR, then ctx.scale(DPR, DPR)
 *   so all drawing operations use CSS coordinates as normal.
 *
 * Why the resize listener was leaking:
 *   The previous code did:
 *     addEventListener("resize", () => fn())   ← reference A
 *     removeEventListener("resize", () => fn()) ← reference B (different!)
 *   B !== A so the listener was never removed. This hook stores the
 *   handler in a ref so the same reference is used for both calls.
 */
export const useCanvasSetup = (image: HTMLImageElement | null) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState<ScaleFactor>({ x: 1, y: 1 });

  const updateCanvasSize = useCallback(
    (img: HTMLImageElement) => {
      const canvas = canvasRef.current;
      const parent = canvasParentRef.current;
      if (!canvas || !parent) return;

      const dpr = window.devicePixelRatio || 1;

      // CSS display dimensions — what the user sees
      const cssWidth = parent.clientWidth;
      const cssHeight = parent.clientHeight;

      // Fit image inside parent while preserving aspect ratio
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;
      let displayWidth: number;
      let displayHeight: number;

      if (cssWidth / cssHeight > imageAspectRatio) {
        displayHeight = cssHeight;
        displayWidth = cssHeight * imageAspectRatio;
      } else {
        displayWidth = cssWidth;
        displayHeight = cssWidth / imageAspectRatio;
      }

      // Canvas pixel buffer = display size × DPR (sharp on retina)
      canvas.width = Math.round(displayWidth * dpr);
      canvas.height = Math.round(displayHeight * dpr);

      // CSS size stays at display dimensions
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      // scaleFactor maps image-space coordinates → CSS pixel coordinates.
      // Drawing code multiplies by this to position things correctly.
      // Note: ctx.scale(dpr, dpr) is applied per-draw (caller's responsibility)
      // so callers still work in CSS pixel space — no change to drawing math.
      setScaleFactor({
        x: displayWidth / img.naturalWidth,
        y: displayHeight / img.naturalHeight,
      });
    },
    [], // no deps — reads from refs, stable forever
  );

  // Stable handler ref — same object reference across renders,
  // so addEventListener and removeEventListener operate on the same fn.
  const resizeHandlerRef = useRef<() => void>(() => {});

  useEffect(() => {
    resizeHandlerRef.current = () => {
      if (image) updateCanvasSize(image);
    };
  }, [image, updateCanvasSize]);

  useEffect(() => {
    const handler = () => resizeHandlerRef.current();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []); // runs once — handler ref is kept fresh by the effect above

  // Trigger a size update whenever the image changes
  useEffect(() => {
    if (image) updateCanvasSize(image);
  }, [image, updateCanvasSize]);

  return { canvasRef, canvasParentRef, scaleFactor, updateCanvasSize };
};
