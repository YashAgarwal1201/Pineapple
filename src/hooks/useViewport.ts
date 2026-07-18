// // src/hooks/useViewport.ts
// import { useCallback, useEffect, useRef, useState } from "react";

// // ─── Types ────────────────────────────────────────────────────────────────────

// export interface Viewport {
//   // Container dimensions — the canvas CSS size always matches these
//   containerWidth: number;
//   containerHeight: number;
//   // Offset that centers the image inside the container at zoom=1
//   // (non-zero when container aspect != image aspect)
//   originX: number; // pan.x at zoom=1
//   originY: number; // pan.y at zoom=1
//   // Image display size at zoom=1 (fit-to-container)
//   fitWidth: number;
//   fitHeight: number;
//   // Current zoom multiplier (1 = fit-to-container)
//   zoom: number;
//   // Current pan offset in CSS-pixel space (includes origin centering)
//   panX: number;
//   panY: number;
//   // devicePixelRatio
//   dpr: number;
// }

// const ZOOM_MIN = 1; // never zoom out past fit-to-container
// const ZOOM_MAX = 8;

// // ─── Hook ─────────────────────────────────────────────────────────────────────

// /**
//  * useViewport v2 — correct zoom/pan model.
//  *
//  * Model:
//  *   The canvas element always fills the container (CSS width/height = container).
//  *   At zoom=1 the image is centered inside the canvas, fit-to-container.
//  *   At zoom>1 the image overflows the canvas; pan controls which part is visible.
//  *   The canvas clips the overflow via its own bounds (overflow:hidden on the
//  *   container div).
//  *
//  * Coordinate math:
//  *   screenX = imageX * fitWidth/naturalWidth * zoom + panX
//  *   imageX  = (screenX - panX) / (fitWidth/naturalWidth * zoom)
//  *
//  *   panX starts at originX (centering offset). At zoom=1 this positions the
//  *   image centered in the canvas. Zooming adjusts panX so the focal point
//  *   stays fixed.
//  */
// export const useViewport = (image: HTMLImageElement | null) => {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   const [viewport, setViewport] = useState<Viewport>({
//     containerWidth: 0,
//     containerHeight: 0,
//     originX: 0,
//     originY: 0,
//     fitWidth: 0,
//     fitHeight: 0,
//     zoom: 1,
//     panX: 0,
//     panY: 0,
//     dpr: window.devicePixelRatio || 1,
//   });

//   // ── Fit computation ───────────────────────────────────────────────────────

//   const computeFit = useCallback(
//     (
//       containerW: number,
//       containerH: number,
//       img: HTMLImageElement,
//     ): Viewport => {
//       const dpr = window.devicePixelRatio || 1;
//       const aspect = img.naturalWidth / img.naturalHeight;
//       const containerAspect = containerW / containerH;

//       let fitWidth: number;
//       let fitHeight: number;

//       if (containerAspect > aspect) {
//         fitHeight = containerH;
//         fitWidth = containerH * aspect;
//       } else {
//         fitWidth = containerW;
//         fitHeight = containerW / aspect;
//       }

//       // Center the image inside the container
//       const originX = (containerW - fitWidth) / 2;
//       const originY = (containerH - fitHeight) / 2;

//       return {
//         containerWidth: containerW,
//         containerHeight: containerH,
//         originX,
//         originY,
//         fitWidth,
//         fitHeight,
//         zoom: 1,
//         panX: originX,
//         panY: originY,
//         dpr,
//       };
//     },
//     [],
//   );

//   // ── ResizeObserver ────────────────────────────────────────────────────────

//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;

//     const observer = new ResizeObserver((entries) => {
//       const entry = entries[0];
//       if (!entry || !image) return;
//       const { width, height } = entry.contentRect;
//       if (width === 0 || height === 0) return;
//       // On resize always reset to fit — keeps things sane
//       setViewport(computeFit(width, height, image));
//     });

//     observer.observe(container);
//     return () => observer.disconnect();
//   }, [image, computeFit]);

//   // Initial sizing when image loads
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!image || !container) return;
//     const { width, height } = container.getBoundingClientRect();
//     if (width === 0 || height === 0) return;
//     setViewport(computeFit(width, height, image));
//   }, [image, computeFit]);

//   // ── Zoom ──────────────────────────────────────────────────────────────────

//   /**
//    * Zoom toward a focal point (CSS-pixel position on the canvas).
//    * The pixel under the cursor stays visually fixed.
//    *
//    * Math:
//    *   Before: screenX = imageX * scale * prevZoom + prevPanX
//    *   After:  screenX = imageX * scale * newZoom  + newPanX
//    *   Solve for newPanX: newPanX = screenX - (screenX - prevPanX) * (newZoom/prevZoom)
//    */
//   const zoomAt = useCallback(
//     (focalX: number, focalY: number, delta: number) => {
//       setViewport((prev) => {
//         const newZoom = Math.min(
//           ZOOM_MAX,
//           Math.max(ZOOM_MIN, prev.zoom + delta),
//         );
//         if (newZoom === prev.zoom) return prev;

//         const ratio = newZoom / prev.zoom;
//         const newPanX = focalX - (focalX - prev.panX) * ratio;
//         const newPanY = focalY - (focalY - prev.panY) * ratio;

//         // Clamp pan so the image never moves fully off-screen.
//         // At the given zoom, the image occupies fitWidth*zoom × fitHeight*zoom.
//         // We allow panning until the far edge reaches the near edge of the canvas.
//         const imgW = prev.fitWidth * newZoom;
//         const imgH = prev.fitHeight * newZoom;
//         const clampedPanX = Math.min(
//           prev.containerWidth * 0.9, // left edge can go to 90% of canvas
//           Math.max(prev.containerWidth * 0.1 - imgW, newPanX), // right edge can go to 10%
//         );
//         const clampedPanY = Math.min(
//           prev.containerHeight * 0.9,
//           Math.max(prev.containerHeight * 0.1 - imgH, newPanY),
//         );

//         return { ...prev, zoom: newZoom, panX: clampedPanX, panY: clampedPanY };
//       });
//     },
//     [],
//   );

//   const resetZoom = useCallback(() => {
//     setViewport((prev) => ({
//       ...prev,
//       zoom: 1,
//       panX: prev.originX,
//       panY: prev.originY,
//     }));
//   }, []);

//   // ── Pan ───────────────────────────────────────────────────────────────────

//   const applyPan = useCallback((dx: number, dy: number) => {
//     setViewport((prev) => {
//       const imgW = prev.fitWidth * prev.zoom;
//       const imgH = prev.fitHeight * prev.zoom;

//       const newPanX = Math.min(
//         prev.containerWidth * 0.9,
//         Math.max(prev.containerWidth * 0.1 - imgW, prev.panX + dx),
//       );
//       const newPanY = Math.min(
//         prev.containerHeight * 0.9,
//         Math.max(prev.containerHeight * 0.1 - imgH, prev.panY + dy),
//       );

//       return { ...prev, panX: newPanX, panY: newPanY };
//     });
//   }, []);

//   // ── Coordinate converters ─────────────────────────────────────────────────

//   /**
//    * Image-space → screen-space (CSS pixels on the canvas).
//    *
//    * scale = fitWidth / naturalWidth  (same ratio used to draw the image)
//    * screenX = imageX * scale * zoom + panX
//    */
//   const toScreen = useCallback(
//     (p: { x: number; y: number }): { x: number; y: number } => {
//       if (!image) return p;
//       const scaleX = viewport.fitWidth / image.naturalWidth;
//       const scaleY = viewport.fitHeight / image.naturalHeight;
//       return {
//         x: p.x * scaleX * viewport.zoom + viewport.panX,
//         y: p.y * scaleY * viewport.zoom + viewport.panY,
//       };
//     },
//     [viewport, image],
//   );

//   /**
//    * Screen-space → image-space. Inverse of toScreen.
//    *
//    * imageX = (screenX - panX) / (scale * zoom)
//    */
//   const toImage = useCallback(
//     (p: { x: number; y: number }): { x: number; y: number } => {
//       if (!image) return p;
//       const scaleX = viewport.fitWidth / image.naturalWidth;
//       const scaleY = viewport.fitHeight / image.naturalHeight;
//       return {
//         x: (p.x - viewport.panX) / (scaleX * viewport.zoom),
//         y: (p.y - viewport.panY) / (scaleY * viewport.zoom),
//       };
//     },
//     [viewport, image],
//   );

//   // ── Canvas preparation ────────────────────────────────────────────────────

//   /**
//    * Sizes the canvas buffer to the container (not the image) and applies DPR.
//    * The canvas CSS size always equals containerWidth × containerHeight.
//    * Content outside the canvas bounds is naturally clipped.
//    *
//    * Returns false if not ready yet.
//    */
//   const prepareCanvas = useCallback(
//     (ctx: CanvasRenderingContext2D): boolean => {
//       const canvas = canvasRef.current;
//       if (!canvas || viewport.containerWidth === 0) return false;

//       const { containerWidth, containerHeight, dpr } = viewport;
//       const bufferW = Math.round(containerWidth * dpr);
//       const bufferH = Math.round(containerHeight * dpr);

//       if (canvas.width !== bufferW || canvas.height !== bufferH) {
//         canvas.width = bufferW;
//         canvas.height = bufferH;
//         canvas.style.width = `${containerWidth}px`;
//         canvas.style.height = `${containerHeight}px`;
//       }

//       ctx.setTransform(1, 0, 0, 1, 0, 0);
//       ctx.scale(dpr, dpr);
//       return true;
//     },
//     [viewport],
//   );

//   return {
//     canvasRef,
//     containerRef,
//     viewport,
//     toScreen,
//     toImage,
//     zoomAt,
//     resetZoom,
//     applyPan,
//     prepareCanvas,
//   };
// };

// v17062026
// src/hooks/useViewport.ts
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Viewport {
  // Container dimensions — the canvas CSS size always matches these
  containerWidth: number;
  containerHeight: number;
  // Offset that centers the image inside the container at zoom=1
  // (non-zero when container aspect != image aspect)
  originX: number; // pan.x at zoom=1
  originY: number; // pan.y at zoom=1
  // Image display size at zoom=1 (fit-to-container)
  fitWidth: number;
  fitHeight: number;
  // Current zoom multiplier (1 = fit-to-container)
  zoom: number;
  // Current pan offset in CSS-pixel space (includes origin centering)
  panX: number;
  panY: number;
  // devicePixelRatio
  dpr: number;
}

export const ZOOM_MIN = 1; // never zoom out past fit-to-container
export const ZOOM_MAX = 8;

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useViewport v2 — correct zoom/pan model.
 *
 * Model:
 *   The canvas element always fills the container (CSS width/height = container).
 *   At zoom=1 the image is centered inside the canvas, fit-to-container.
 *   At zoom>1 the image overflows the canvas; pan controls which part is visible.
 *   The canvas clips the overflow via its own bounds (overflow:hidden on the
 *   container div).
 *
 * Coordinate math:
 *   screenX = imageX * fitWidth/naturalWidth * zoom + panX
 *   imageX  = (screenX - panX) / (fitWidth/naturalWidth * zoom)
 *
 *   panX starts at originX (centering offset). At zoom=1 this positions the
 *   image centered in the canvas. Zooming adjusts panX so the focal point
 *   stays fixed.
 */
export const useViewport = (image: HTMLImageElement | null) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, setViewport] = useState<Viewport>({
    containerWidth: 0,
    containerHeight: 0,
    originX: 0,
    originY: 0,
    fitWidth: 0,
    fitHeight: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
    dpr: window.devicePixelRatio || 1,
  });

  // ── Fit computation ───────────────────────────────────────────────────────

  const computeFit = useCallback(
    (
      containerW: number,
      containerH: number,
      img: HTMLImageElement,
    ): Viewport => {
      const dpr = window.devicePixelRatio || 1;
      const aspect = img.naturalWidth / img.naturalHeight;
      const containerAspect = containerW / containerH;

      let fitWidth: number;
      let fitHeight: number;

      if (containerAspect > aspect) {
        fitHeight = containerH;
        fitWidth = containerH * aspect;
      } else {
        fitWidth = containerW;
        fitHeight = containerW / aspect;
      }

      // Center the image inside the container
      const originX = (containerW - fitWidth) / 2;
      const originY = (containerH - fitHeight) / 2;

      return {
        containerWidth: containerW,
        containerHeight: containerH,
        originX,
        originY,
        fitWidth,
        fitHeight,
        zoom: 1,
        panX: originX,
        panY: originY,
        dpr,
      };
    },
    [],
  );

  // ── ResizeObserver ────────────────────────────────────────────────────────

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !image) return;
      const { width, height } = entry.contentRect;
      if (width === 0 || height === 0) return;
      // On resize always reset to fit — keeps things sane
      setViewport(computeFit(width, height, image));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [image, computeFit]);

  // Initial sizing when image loads
  useEffect(() => {
    const container = containerRef.current;
    if (!image || !container) return;
    const { width, height } = container.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    setViewport(computeFit(width, height, image));
  }, [image, computeFit]);

  // ── Zoom ──────────────────────────────────────────────────────────────────

  /**
   * Zoom toward a focal point (CSS-pixel position on the canvas).
   * The pixel under the cursor stays visually fixed.
   *
   * Math:
   *   Before: screenX = imageX * scale * prevZoom + prevPanX
   *   After:  screenX = imageX * scale * newZoom  + newPanX
   *   Solve for newPanX: newPanX = screenX - (screenX - prevPanX) * (newZoom/prevZoom)
   */
  const zoomAt = useCallback(
    (focalX: number, focalY: number, delta: number) => {
      setViewport((prev) => {
        const newZoom = Math.min(
          ZOOM_MAX,
          Math.max(ZOOM_MIN, prev.zoom + delta),
        );
        if (newZoom === prev.zoom) return prev;

        const ratio = newZoom / prev.zoom;
        const newPanX = focalX - (focalX - prev.panX) * ratio;
        const newPanY = focalY - (focalY - prev.panY) * ratio;

        // Clamp pan so the image never moves fully off-screen.
        // At the given zoom, the image occupies fitWidth*zoom × fitHeight*zoom.
        // We allow panning until the far edge reaches the near edge of the canvas.
        const imgW = prev.fitWidth * newZoom;
        const imgH = prev.fitHeight * newZoom;
        const clampedPanX = Math.min(
          prev.containerWidth * 0.9, // left edge can go to 90% of canvas
          Math.max(prev.containerWidth * 0.1 - imgW, newPanX), // right edge can go to 10%
        );
        const clampedPanY = Math.min(
          prev.containerHeight * 0.9,
          Math.max(prev.containerHeight * 0.1 - imgH, newPanY),
        );

        return { ...prev, zoom: newZoom, panX: clampedPanX, panY: clampedPanY };
      });
    },
    [],
  );

  const resetZoom = useCallback(() => {
    setViewport((prev) => ({
      ...prev,
      zoom: 1,
      panX: prev.originX,
      panY: prev.originY,
    }));
  }, []);

  // ── Pan ───────────────────────────────────────────────────────────────────

  const applyPan = useCallback((dx: number, dy: number) => {
    setViewport((prev) => {
      const imgW = prev.fitWidth * prev.zoom;
      const imgH = prev.fitHeight * prev.zoom;

      const newPanX = Math.min(
        prev.containerWidth * 0.9,
        Math.max(prev.containerWidth * 0.1 - imgW, prev.panX + dx),
      );
      const newPanY = Math.min(
        prev.containerHeight * 0.9,
        Math.max(prev.containerHeight * 0.1 - imgH, prev.panY + dy),
      );

      return { ...prev, panX: newPanX, panY: newPanY };
    });
  }, []);

  // ── Coordinate converters ─────────────────────────────────────────────────

  /**
   * Image-space → screen-space (CSS pixels on the canvas).
   *
   * scale = fitWidth / naturalWidth  (same ratio used to draw the image)
   * screenX = imageX * scale * zoom + panX
   */
  const toScreen = useCallback(
    (p: { x: number; y: number }): { x: number; y: number } => {
      if (!image) return p;
      const scaleX = viewport.fitWidth / image.naturalWidth;
      const scaleY = viewport.fitHeight / image.naturalHeight;
      return {
        x: p.x * scaleX * viewport.zoom + viewport.panX,
        y: p.y * scaleY * viewport.zoom + viewport.panY,
      };
    },
    [viewport, image],
  );

  /**
   * Screen-space → image-space. Inverse of toScreen.
   *
   * imageX = (screenX - panX) / (scale * zoom)
   */
  const toImage = useCallback(
    (p: { x: number; y: number }): { x: number; y: number } => {
      if (!image) return p;
      const scaleX = viewport.fitWidth / image.naturalWidth;
      const scaleY = viewport.fitHeight / image.naturalHeight;
      return {
        x: (p.x - viewport.panX) / (scaleX * viewport.zoom),
        y: (p.y - viewport.panY) / (scaleY * viewport.zoom),
      };
    },
    [viewport, image],
  );

  // ── Canvas preparation ────────────────────────────────────────────────────

  /**
   * Sizes the canvas buffer to the container (not the image) and applies DPR.
   * The canvas CSS size always equals containerWidth × containerHeight.
   * Content outside the canvas bounds is naturally clipped.
   *
   * Returns false if not ready yet.
   */
  const prepareCanvas = useCallback(
    (ctx: CanvasRenderingContext2D): boolean => {
      const canvas = canvasRef.current;
      if (!canvas || viewport.containerWidth === 0) return false;

      const { containerWidth, containerHeight, dpr } = viewport;
      const bufferW = Math.round(containerWidth * dpr);
      const bufferH = Math.round(containerHeight * dpr);

      if (canvas.width !== bufferW || canvas.height !== bufferH) {
        canvas.width = bufferW;
        canvas.height = bufferH;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      return true;
    },
    [viewport],
  );

  return {
    canvasRef,
    containerRef,
    viewport,
    toScreen,
    toImage,
    zoomAt,
    resetZoom,
    applyPan,
    prepareCanvas,
  };
};
