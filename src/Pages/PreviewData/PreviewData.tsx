import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { useAppContext } from "../../Services/AppContext";
import "./PreviewData.scss";
import { Polygon } from "../../Services/interfaces";

const PreviewData = () => {
  const navigate = useNavigate();

  const { state } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);

  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const [showContent, setShowContent] = useState<boolean>(false);

  const updateCanvasSize = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const parent = canvasParentRef.current;

    if (canvas && parent) {
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;

      // Maintain aspect ratio of the image while resizing
      const imageAspectRatio = img.width / img.height;
      let newCanvasWidth, newCanvasHeight;

      if (parentWidth / parentHeight > imageAspectRatio) {
        newCanvasHeight = parentHeight;
        newCanvasWidth = newCanvasHeight * imageAspectRatio;
      } else {
        newCanvasWidth = parentWidth;
        newCanvasHeight = newCanvasWidth / imageAspectRatio;
      }

      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;

      // Scaling factors for rendering polygons
      const scaleX = newCanvasWidth / img.width;
      const scaleY = newCanvasHeight / img.height;
      setScaleFactor({ x: scaleX, y: scaleY });
    }
  }, []);

  useEffect(() => {
    if (!state.imageSelected?.url) return;

    const img = new Image();
    img.src = state.imageSelected.url;
    img.onload = () => {
      setImage(img);
      updateCanvasSize(img);
    };
  }, [state.imageSelected?.url, updateCanvasSize]);

  useEffect(() => {
    window.addEventListener("resize", () => image && updateCanvasSize(image));
    return () =>
      window.removeEventListener(
        "resize",
        () => image && updateCanvasSize(image)
      );
  }, [image, updateCanvasSize]);

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
      if (image) {
        ctx.clearRect(
          0,
          0,
          canvasRef.current!.width,
          canvasRef.current!.height
        );
        ctx.drawImage(
          image,
          0,
          0,
          image.width * scaleFactor.x,
          image.height * scaleFactor.y
        );

        // Draw polygons
        scaledPolygons.forEach((polygon) => {
          drawPolygon(ctx, polygon);
        });
      }
    },
    [image, scaledPolygons, scaleFactor]
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

      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(polygon.label, centerX, centerY);
    },
    []
  );

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Layout>
      <div
        className={`customScrollbar h-full py-3 px-1 sm:px-3 my-3 mx-0 sm:mx-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md overflow-y-auto transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5 overflow-y-auto">
          <div className="px-2 md:px-0 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-y-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-naples-yellow">
                Preview Data
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-bud-green font-content font-medium">
                Preview the data before proceeding
              </p>
            </div>
            <div className="w-full xl:w-auto hidden md:flex flex-row-reverse gap-x-4">
              <Button
                disabled={
                  state?.imageSelected?.url?.length <= 0 ||
                  state.polygons?.length < 1
                }
                icon="pi pi-thumbs-up"
                label="Continue"
                className="h-10 px-2 md:px-5 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => {
                  startTransition(() => {
                    navigate("/success");
                  });
                }}
              />
              <Button
                icon={"pi pi-list"}
                label={"Polygons Data"}
                onClick={() => setShowListOfPolygons(true)}
                className="h-10 px-2 md:px-5 text-sm sm:text-base text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
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
                  className="mx-auto border-2 border-ochre rounded-lg"
                  ref={canvasRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full p-2 flex md:hidden flex-col items-center sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-row-reverse gap-x-5 font-content">
          <Button
            disabled={
              state?.imageSelected?.url?.length <= 0 ||
              state.polygons?.length < 1
            }
            title="Save & Conitnue"
            icon="pi pi-thumbs-up"
            rounded
            className="text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              startTransition(() => {
                navigate("/success");
              });
            }}
          />
          <Button
            title="Show Polygons Data"
            icon={"pi pi-list"}
            rounded
            onClick={() => setShowListOfPolygons(true)}
            className="text-xs sm:text-sm text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
          />
        </div>
      </div>

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        position="left"
        className="polygon-list-sidebar w-full md:w-[768px]"
        header={
          <h2 className="font-heading text-naples-yellow text-lg sm:text-xl md:text-2xl">
            Polygons
          </h2>
        }
        maskClassName="backdrop-blur"
        closeIcon={
          <span className="pi pi-times text-metallic-brown bg-naples-yellow w-10 h-10 flex justify-center items-center"></span>
        }
      >
        <div className="w-full h-full rounded-lg bg-metallic-brown p-2 xs:p-3 sm:p-4">
          {state.polygons.length > 0 ? (
            state.polygons?.map((polygon, index) => (
              <div className="mb-2" key={index}>
                <Panel
                  className="annotationPanel w-full mb-1"
                  collapsed={true}
                  header={
                    <div className="w-full h-full flex justify-between items-center">
                      <span className="text-base sm:text-lg text-metallic-brown font-heading">
                        {polygon?.label}
                      </span>
                    </div>
                  }
                  collapseIcon={
                    <span className="p-2 pi pi-angle-up text-metallic-brown"></span>
                  }
                  expandIcon={
                    <span className="p-2 pi pi-angle-down text-metallic-brown"></span>
                  }
                  toggleable
                >
                  <div className="w-full flex flex-col gap-y-1 font-content">
                    <p className="w-full p-2 bg-fern-green text-naples-yellow font-medium rounded-lg">
                      Coordinates -{" "}
                    </p>
                    {polygon.points?.map((values, key) => (
                      <p
                        className="w-full flex flex-row items-center gap-x-1 text-sm sm:text-base"
                        key={key}
                      >
                        <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                          X:
                        </span>
                        <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                          {Math.round(values.x)}
                        </span>
                        <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                          Y:
                        </span>
                        <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                          {Math.round(values.y)}
                        </span>
                      </p>
                    ))}
                  </div>
                </Panel>
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
