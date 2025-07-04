import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Menu, X } from "lucide-react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import { SpeedDial } from "primereact/speeddial";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import "./PreviewData.scss";
import { Polygon } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

const PreviewData = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
  }, []);

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

  const actions = [
    {
      label: "Save & Continue",
      icon: "pi pi-thumbs-up",
      command: () => {
        startTransition(() => {
          navigate("/success");
        });

        saveAnnotatedImage();
      },
      disabled:
        state?.imageSelected?.url?.length <= 0 || state.polygons?.length < 1,
      className:
        "bg-naples-yellow text-metallic-brown border-naples-yellow hover:bg-yellow-500",
    },
    {
      label: "Show Polygons Data",
      icon: "pi pi-list",
      command: () => setShowListOfPolygons(true),
      className:
        "bg-transparent text-naples-yellow border-2 border-naples-yellow hover:bg-naples-yellow hover:text-metallic-brown",
    },
  ];

  // const drawMiniPolygon = (ctx: CanvasRenderingContext2D, polygon: Polygon) => {
  //   const padding = 5;
  //   const width = 100;
  //   const height = 100;

  //   // Clear canvas
  //   ctx.clearRect(0, 0, width, height);

  //   // Get min/max for normalization
  //   const xs = polygon.points.map((p) => p.x);
  //   const ys = polygon.points.map((p) => p.y);
  //   const minX = Math.min(...xs);
  //   const maxX = Math.max(...xs);
  //   const minY = Math.min(...ys);
  //   const maxY = Math.max(...ys);

  //   const rangeX = maxX - minX || 1;
  //   const rangeY = maxY - minY || 1;

  //   // Scale and translate points into 100x100 box with padding
  //   const scaledPoints = polygon.points.map((p) => ({
  //     x: ((p.x - minX) / rangeX) * (width - 2 * padding) + padding,
  //     y: ((p.y - minY) / rangeY) * (height - 2 * padding) + padding,
  //   }));

  //   // Draw polygon
  //   ctx.beginPath();
  //   ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
  //   scaledPoints.forEach((p) => ctx.lineTo(p.x, p.y));
  //   ctx.closePath();

  //   ctx.fillStyle = polygon.color + "66";
  //   ctx.strokeStyle = polygon.color;
  //   ctx.lineWidth = 2;
  //   ctx.fill();
  //   ctx.stroke();
  // };

  const drawMiniCroppedPolygon = (
    ctx: CanvasRenderingContext2D,
    polygon: Polygon,
    image: HTMLImageElement
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
      ctx.canvas.height
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
          <Lottie
            loop
            animationData={loadingDotsAnimation}
            play
            className="w-1/2 h-fit"
          />
          <p className="font-heading text-xl sm:text-2xl text-center text-metallic-brown">
            No image found. Navigating to home page.
          </p>
        </div>
      ) : (
        <>
          <div
            className={`customScrollbar h-full p-2 sm:p-4 flex flex-col justify-around items-center bg-metallic-brown rounded-2xl sm:rounded-3xl shadow-md overflow-y-auto transition-all duration-1000 transform ${
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
                  <p className="text-sm sm:text-base md:text-lg text-bud-green font-content font-medium">
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
                    className="h-10 px-2 md:px-5 text-sm sm:text-base flex items-center gap-2 rounded-2xl text-metallic-brown bg-naples-yellow border-naples-yellow"
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
                    className="h-10 px-2 md:px-5 text-sm sm:text-base flex items-center gap-2 rounded-2xl text-naples-yellow border border-naples-yellow bg-transparent"
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
                      className="mx-auto border-2 border-ochre rounded-2xl md:rounded-3xl"
                      ref={canvasRef}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="block md:hidden">
            <SpeedDial
              model={actions}
              direction="up"
              buttonClassName="bg-metallic-brown text-naples-yellow border-naples-yellow"
              showIcon="pi pi-bars"
              hideIcon="pi pi-times"
              className="p-speeddial absolute bottom-5 right-2"
              buttonTemplate={(options) => (
                <Button
                  onClick={options.onClick}
                  className="bg-ochre size-10 text-naples-yellow"
                  icon={<Menu size={16} />}
                  rounded
                />
              )}
            />
          </div>
        </>
      )}

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-naples-yellow">
            Polygons Data
          </h2>
        }
        className="polygon-list-sidebar side-menu rounded-none md:rounded-r-3xl bg-metallic-brown aboutDialog w-full md:w-[768px]"
        position="left"
        closeIcon={
          <span className=" text-naples-yellow">
            <X size={16} />
          </span>
        }
        maskClassName="backdrop-blur"
      >
        <div className="w-full px-4 py-4 text-fern-green bg-naples-yellow rounded-3xl overflow-y-auto">
          {state.polygons.length > 0 ? (
            state.polygons?.map((polygon, index) => (
              <div className="mb-2" key={index}>
                <Panel
                  className="w-full bg-transparent rounded-2xl"
                  collapsed={true}
                  headerTemplate={(options) => {
                    const togglePanel = (
                      event: React.MouseEvent<HTMLElement>
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

                    <p className="w-full text-fern-green font-medium rounded-lg">
                      Coordinates
                    </p>
                    {polygon.points?.map((values, key) => (
                      <p
                        className="w-full flex flex-row items-center gap-x-1 text-sm sm:text-base"
                        key={key}
                      >
                        <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-l-lg text-right">
                          X{key}
                        </span>
                        <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-r-lg">
                          {Math.round(values.x)}
                        </span>
                        <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-l-lg text-right">
                          Y{key}
                        </span>
                        <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-r-lg">
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
