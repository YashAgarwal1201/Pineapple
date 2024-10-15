import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../../Services/AppContext";
// import { DEFAULT_LABEL } from "../../Services/constants";
import { generateRandomColor } from "../../Services/functionServices";
import "./PolygonDrawer.scss";
import { Polygon } from "../../Services/interfaces";

const PolygonDrawer = ({ setShowListOfPolygons }) => {
  const navigate = useNavigate();

  const { state, setPolygons, showToast } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState(false);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const [showContent, setShowContent] = useState(false);

  const updateCanvasSize = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    const parent = canvasParentRef.current;

    if (canvas && parent) {
      const parentWidth = parent.clientWidth;
      const parentHeight = parent.clientHeight;

      // Calculate the aspect ratio of the image
      const imageAspectRatio = img.width / img.height;

      // Determine the new canvas dimensions while maintaining the image's aspect ratio
      let newCanvasWidth, newCanvasHeight;

      if (parentWidth / parentHeight > imageAspectRatio) {
        // Parent is wider than the image's aspect ratio, fit by height
        newCanvasHeight = parentHeight;
        newCanvasWidth = newCanvasHeight * imageAspectRatio;
      } else {
        // Parent is taller than the image's aspect ratio, fit by width
        newCanvasWidth = parentWidth;
        newCanvasHeight = newCanvasWidth / imageAspectRatio;
      }

      canvas.width = newCanvasWidth;
      canvas.height = newCanvasHeight;

      // Calculate the scaling factors for rendering polygons and points
      const scaleX = newCanvasWidth / img.width;
      const scaleY = newCanvasHeight / img.height;
      setScaleFactor({ x: scaleX, y: scaleY });
    }
  }, []);

  // Memoize the image loading and scaling
  useEffect(() => {
    if (!state.imageSelected?.url) return;

    const img = new Image();
    img.src = state.imageSelected.url;
    img.onload = () => {
      setImage(img);
      updateCanvasSize(img); // Calculate scaling factor based on image size
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

  // Memoize scaled polygons to avoid recalculating on every render
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

        // Draw memoized polygons
        scaledPolygons.forEach((polygon) => {
          drawPolygon(ctx, polygon);
        });

        // Draw clicked points
        clickedPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(
            point.x * scaleFactor.x,
            point.y * scaleFactor.y,
            5,
            0,
            2 * Math.PI
          );
          ctx.fillStyle = "blue";
          ctx.fill();
        });
      }
    },
    [image, clickedPoints, scaledPolygons, scaleFactor]
  );

  useEffect(() => {
    if (canvasRef.current && image) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) drawImageAndPolygons(ctx);
    }
  }, [image, drawImageAndPolygons]);

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

      // Draw label in the center
      const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
      const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;

      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(polygon.label, centerX, centerY);
    },
    []
  );

  // Memoize the canvas click handler
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!canvasRef.current || !image) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const clickX = (event.clientX - rect.left) / scaleFactor.x;
      const clickY = (event.clientY - rect.top) / scaleFactor.y;

      const newPoint = { x: clickX, y: clickY };

      if (!currentPolygon) {
        setCurrentPolygon({
          color: generateRandomColor(),
          label: `Polygon ${state.polygons.length + 1}`,
          points: [newPoint],
          bbox: [clickX, clickY, clickX, clickY],
          units: 0,
        });
        setClickedPoints([newPoint]);
      } else {
        const updatedPoints = [...currentPolygon.points, newPoint];
        setCurrentPolygon({ ...currentPolygon, points: updatedPoints });
        setClickedPoints(updatedPoints);
      }
    },
    [currentPolygon, scaleFactor, image, state.polygons.length]
  );

  const handleCompletePolygon = useCallback(() => {
    if (currentPolygon && currentPolygon.points.length >= 3) {
      setPolygons([...state.polygons, currentPolygon]);
      setCurrentPolygon(null);
      setClickedPoints([]);
      showToast("success", "Success", "Polygon successfully added.");
    } else {
      showToast("warn", "Warning", "A polygon needs at least 3 points.");
    }
  }, [currentPolygon, state.polygons, setPolygons, showToast]);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <>
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
                Draw required polygons
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-bud-green font-content font-medium">
                Identify and select the correct annotations in the image
              </p>
            </div>
            <div className="w-full xl:w-auto hidden md:flex flex-row-reverse gap-x-4">
              <Button
                disabled={
                  state?.imageSelected?.url?.length <= 0 ||
                  state.polygons?.length < 1
                }
                icon="pi pi-thumbs-up"
                label="Save & Continue"
                className="h-10 px-2 md:px-5 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => {
                  // console.log(canvasRef?.current?.getContext("2d"));
                  startTransition(() => {
                    navigate("/preview");
                  });
                }}
              />
              {!addNew && (
                <Button
                  disabled={state.imageSelected.url === ""}
                  icon="pi pi-pencil"
                  label="Add Polygon"
                  className="h-10 px-2 md:px-5 text-sm sm:text-base text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
                  onClick={() => setAddNew(true)}
                />
              )}
              {addNew && (
                <Button
                  icon="pi pi-check"
                  label="Complete Polygon"
                  onClick={handleCompletePolygon}
                  className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
                />
              )}

              <Button
                disabled={state.polygons.length < 1}
                icon={"pi pi-list"}
                label={`Polygons (${
                  state.polygons?.length < 10
                    ? `0${state.polygons?.length}`
                    : `${state.polygons?.length}`
                })
                    `}
                className="h-10 px-2 md:px-5 text-sm sm:text-base text-naples-yellow border-2 border-naples-yellow bg-transparent"
                onClick={() => setShowListOfPolygons(true)}
              />
            </div>
          </div>
          <div className="w-full h-[calc(100%-150px)] flex flex-col md:flex-row gap-2">
            <div className="w-full h-full md:mb-0 mx-auto flex justify-center">
              <div
                className="w-full h-full max-w-full  my-auto"
                ref={canvasParentRef}
              >
                <canvas
                  className="mx-auto border-2 border-ochre rounded-lg"
                  ref={canvasRef}
                  onClick={(e) => (addNew ? handleCanvasClick(e) : "")}
                  // width={canvasParentRef?.current?.clientWidth}
                  // height={canvasParentRef?.current?.clientHeight}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full p-2 block md:hidden sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl text-xs`}
      >
        <div className="flex justify-center items-center flex-row-reverse gap-x-5 font-content">
          <Button
            disabled={
              state?.imageSelected?.url?.length <= 0 ||
              state.polygons?.length < 1
            }
            icon="pi pi-thumbs-up"
            rounded
            className=" text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              startTransition(() => {
                navigate("/preview");
              });
            }}
          />
          {!addNew && (
            <Button
              disabled={state.imageSelected.url === ""}
              icon="pi pi-pencil"
              rounded
              className=" text-sm sm:text-base px-2 md:px-5 text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
              onClick={() => setAddNew(true)}
            />
          )}
          {addNew && (
            <Button
              icon="pi pi-check"
              rounded
              onClick={handleCompletePolygon}
              className=" text-xs sm:text-sm text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
            />
          )}
          <div className="relative">
            <Button
              disabled={state.polygons.length < 1}
              icon={"pi pi-list"}
              rounded
              // size="small"
              className=" text-xs sm:text-sm text-naples-yellow border xs:border-2 border-naples-yellow bg-transparent"
              onClick={() => setShowListOfPolygons(true)}
            />
            {state.polygons.length > 0 && (
              <span className="bg-bud-green text-sm w-3 h-3 flex justify-center items-center rounded-full absolute -right-0 top-1 animate-pulse"></span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PolygonDrawer;
