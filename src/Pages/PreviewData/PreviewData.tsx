// src/Pages/PreviewData/PreviewData.tsx
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";

import PineappleLoader from "../../Components/Loaders/Loaders";
import { useCanvasSetup } from "../../hooks/useCanvasSetup";
import Layout from "../../Layout/Layout";
import "./PreviewData.scss";
import {
  AMBER_PRIMARY_BTN_STYLES,
  LIME_PRIMARY_BTN_STYLES,
} from "../../Services/constants";
import { Polygon } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

const PreviewData = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showContent, setShowContent] = useState<boolean>(false);

  // useCanvasSetup provides DPR-compensated canvas sizing + stable resize
  const { canvasRef, canvasParentRef, scaleFactor } = useCanvasSetup(image);

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!state.imageSelected?.url) return;
    const img = new Image();
    img.src = state.imageSelected.url;
    img.onload = () => setImage(img);
  }, [state.imageSelected?.url]);

  // Memoize scaled polygons for efficient rendering
  const scaledPolygons = useMemo(() => {
    if (!image) return [];
    return state.polygons.map((polygon) => ({
      ...polygon,
      points: polygon.points.map((p) => ({
        x: p.x * scaleFactor.x,
        y: p.y * scaleFactor.y,
      })),
    }));
  }, [state.polygons, scaleFactor, image]);

  // Function to draw image and polygons on canvas
  const drawImageAndPolygons = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!image || !canvasRef.current) return;

      const dpr = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.scale(dpr, dpr);

      const displayW = canvas.width / dpr;
      const displayH = canvas.height / dpr;
      ctx.drawImage(image, 0, 0, displayW, displayH);

      scaledPolygons.forEach((polygon) => {
        drawPolygon(ctx, polygon);
      });

      ctx.restore();
    },
    [image, scaledPolygons, canvasRef],
  );

  useEffect(() => {
    if (canvasRef.current && image) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) drawImageAndPolygons(ctx);
    }
  }, [image, drawImageAndPolygons]);

  // Draw polygon with label
  const drawPolygon = useCallback(
    (ctx: CanvasRenderingContext2D, polygon: Polygon) => {
      ctx.beginPath();
      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 2;
      ctx.fillStyle = `${polygon.color}60`;

      const points = polygon.points;
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw label in the center of the polygon
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

      ctx.font = "bold 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 4;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(polygon.label, centerX, centerY);
      ctx.shadowBlur = 0;
    },
    [],
  );

  useEffect(() => {
    setShowContent(true);
  }, []);

  // When saving annotations from canvas
  const saveAnnotatedImage = () => {
    // Get canvas reference
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Convert canvas to data URL
    const dataUrl = canvas.toDataURL("image/png"); //canvas.toDataURL('image/webp', 0.8)

    state.setAnnotatedCanvasImage(dataUrl);

    // Show success message
    state.showToast("success", "Success", "Annotated image saved");
  };

  const drawMiniCroppedPolygon = (
    ctx: CanvasRenderingContext2D,
    polygon: Polygon,
    image: HTMLImageElement,
  ) => {
    const [x1, y1, x2, y2] = polygon.bbox;
    const cropWidth = x2 - x1;
    const cropHeight = y2 - y1;

    // Clear previous canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Scale ratio between cropped image area and canvas
    const scaleX = ctx.canvas.width / cropWidth;
    const scaleY = ctx.canvas.height / cropHeight;

    // Draw the cropped image section
    ctx.drawImage(
      image,
      x1,
      y1,
      cropWidth,
      cropHeight,
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height,
    );

    // Transform and draw polygon
    const adjustedPoints = polygon.points.map((p) => ({
      x: (p.x - x1) * scaleX,
      y: (p.y - y1) * scaleY,
    }));

    ctx.beginPath();
    if (adjustedPoints.length > 0) {
      ctx.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);
      adjustedPoints.forEach((pt) => ctx.lineTo(pt.x, pt.y));
      ctx.closePath();

      ctx.strokeStyle = polygon.color;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = `${polygon.color}60`; // Add some transparency
      ctx.fill();
      ctx.stroke();
    }
  };

  return (
    <Layout>
      {loading ? (
        <div className="w-full h-full p-3 flex flex-col justify-center items-center gap-y-3">
          <PineappleLoader variant="spinner" />
          <p className="font-heading text-xl sm:text-2xl text-center text-metallic-brown">
            No image found. Navigating to home page.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`customScrollbar h-full p-2 pb-20 md:pb-4 sm:p-4 flex flex-col justify-around items-center bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md overflow-y-auto transition-all duration-1000 transform ${
              showContent
                ? "translate-y-0 opacity-100"
                : "-translate-y-full opacity-0"
            }`}
          >
            <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5 overflow-y-auto">
              <div className="px-2 md:px-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-y-3">
                <div className="flex flex-col gap-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
                    Preview Data
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
                    Preview the data before proceeding
                  </p>
                </div>
                <div className="w-full xl:w-auto hidden md:flex flex-row-reverse gap-x-1">
                  <Button
                    disabled={
                      state?.imageSelected?.url?.length <= 0 ||
                      state.polygons?.length < 1
                    }
                    icon="pi pi-thumbs-up"
                    label="Continue"
                    className={`${LIME_PRIMARY_BTN_STYLES} h-10 px-2 md:px-5 text-sm sm:text-base flex items-center gap-2 rounded-r-2xl! rounded-l-sm!`}
                    onClick={() => {
                      startTransition(() => {
                        navigate("/success");
                      });

                      saveAnnotatedImage();
                    }}
                  />
                  <Button
                    icon={"pi pi-list"}
                    label={"Polygons Data"}
                    onClick={() => setShowListOfPolygons(true)}
                    className={`${AMBER_PRIMARY_BTN_STYLES} h-10 px-2 md:px-5 text-sm sm:text-base flex items-center gap-2 rounded-l-2xl! rounded-r-sm!`}
                  />
                </div>
              </div>
              <div className="w-full h-[calc(100%-150px)] flex flex-col md:flex-row gap-2">
                <div className="w-full h-full md:mb-0 mx-auto flex justify-center">
                  <div
                    className="w-full h-full max-w-full my-auto"
                    ref={canvasParentRef}
                  >
                    <canvas
                      className="mx-auto border border-ochre rounded-xl lg:rounded-2xl"
                      ref={canvasRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile sticky bottom bar — same rationale as the Draw page: these
       are primary actions, not secondary ones, so SpeedDial was a mismatch. */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-amber-200 dark:border-amber-800 px-2 py-2 flex items-center gap-1.5 safe-area-bottom">
            <Button
              aria-label="Show polygons data"
              disabled={state.polygons.length < 1}
              onClick={() => setShowListOfPolygons(true)}
              className="flex-1 h-11 flex flex-col items-center justify-center gap-0.5 bg-transparent! text-amber-700! dark:text-amber-300! border! border-amber-400! dark:border-amber-600! rounded-xl!"
            >
              <span className="pi pi-list text-base" />
              <span className="text-[11px] font-content leading-none">
                Polygons ({state.polygons.length})
              </span>
            </Button>
            <Button
              aria-label="Continue"
              disabled={
                state?.imageSelected?.url?.length <= 0 ||
                state.polygons?.length < 1
              }
              onClick={() => {
                startTransition(() => {
                  navigate("/success");
                });
                saveAnnotatedImage();
              }}
              className={`flex-1 h-11 flex flex-col items-center justify-center gap-0.5 ${LIME_PRIMARY_BTN_STYLES} rounded-xl!`}
            >
              <span className="pi pi-thumbs-up text-base" />
              <span className="text-[11px] font-content leading-none">
                Continue
              </span>
            </Button>
          </div>
        </>
      )}

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
            Polygons Data
          </h2>
        }
        className="polygon-list-sidebar side-menu rounded-none! md:rounded-r-3xl! bg-white! dark:bg-black! aboutDialog w-full! md:w-[768px]!"
        position="left"
        closeIcon={
          <span className=" text-naples-yellow">
            <X size={16} />
          </span>
        }
        maskClassName="backdrop-blur"
      >
        <div className="w-full px-4 py-4 bg-amber-50 dark:bg-stone-900 rounded-3xl overflow-y-auto text-stone-700 dark:text-stone-300 font-content">
          {state.polygons.length > 0 ? (
            state.polygons?.map((polygon, index) => (
              <div className="mb-2" key={index}>
                <Panel
                  className="w-full bg-transparent rounded-2xl"
                  collapsed={true}
                  headerTemplate={(options) => {
                    const togglePanel = (
                      event: React.MouseEvent<HTMLElement>,
                    ) => {
                      options.onTogglerClick!(event); // Trigger expand/collapse behavior
                    };

                    return (
                      <div
                        className="cursor-pointer custom-panel-header w-full flex justify-between items-center px-2 py-4 rounded-xl"
                        onClick={togglePanel}
                      >
                        <div className="flex items-center gap-x-2">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: polygon.color }}
                          ></span>
                          <span className="text-base sm:text-lg font-heading">
                            {polygon?.label}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                  toggleable
                >
                  <div className="w-full flex flex-col gap-y-1 font-content">
                    {/* <canvas
                      width={120}
                      height={120}
                      className="rounded-lg border border-ochre mb-3"
                      ref={(el) => {
                        if (el && image) {
                          const ctx = el.getContext("2d");
                          if (ctx) {
                            drawMiniCroppedPolygon(ctx, polygon, image);
                          }
                        }
                      }}
                    /> */}

                    <canvas
                      width={120}
                      height={120}
                      className="rounded-lg border border-ochre mb-3"
                      ref={(el) => {
                        if (el && image) {
                          const ctx = el.getContext("2d");
                          if (ctx) {
                            drawMiniCroppedPolygon(ctx, polygon, image);
                          }
                        }
                      }}
                    />

                    <p className="font-content text-amber-600 dark:text-amber-400">
                      Coordinates
                    </p>
                    {polygon.points?.map((values, key) => (
                      <p
                        className="w-full flex flex-row items-center gap-x-1 text-sm sm:text-base"
                        key={key}
                      >
                        <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                          X{key}
                        </span>
                        <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                          {Math.round(values.x)}
                        </span>
                        <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                          Y{key}
                        </span>
                        <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                          {Math.round(values.y)}
                        </span>
                      </p>
                    ))}
                  </div>
                </Panel>

                {index !== state.polygons?.length - 1 && (
                  <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-center h-[40px] text-naples-yellow font-content text-base xs:text-lg md:text-xl  my-auto">
                No data to display
              </p>
            </div>
          )}
        </div>
      </Sidebar>
    </Layout>
  );
};

export default PreviewData;
