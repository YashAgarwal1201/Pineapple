import React, {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Menu } from "lucide-react";
import { Button } from "primereact/button";
import { SpeedDial } from "primereact/speeddial";
import { useNavigate } from "react-router-dom";

import { generateRandomColor } from "../../Services/functionServices";
import "./PolygonDrawer.scss";
import { Polygon } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

const PolygonDrawer = ({ setShowListOfPolygons }) => {
  const navigate = useNavigate();

  const state = usePineappleStore();
  const { setPolygons, showToast } = state;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState<boolean>(false);
  const [scaleFactor, setScaleFactor] = useState({ x: 1, y: 1 });
  const [showContent, setShowContent] = useState<boolean>(false);

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
  // const handleCanvasClick = useCallback(
  //   (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
  //     if (!canvasRef.current || !image) return;

  //     const canvas = canvasRef.current;
  //     const rect = canvas.getBoundingClientRect();

  //     const clickX = (event.clientX - rect.left) / scaleFactor.x;
  //     const clickY = (event.clientY - rect.top) / scaleFactor.y;

  //     const newPoint = { x: clickX, y: clickY };

  //     if (!currentPolygon) {
  //       setCurrentPolygon({
  //         color: generateRandomColor(),
  //         label: `Polygon ${state.polygons.length + 1}`,
  //         points: [newPoint],
  //         bbox: [clickX, clickY, clickX, clickY],
  //         units: 0,
  //       });
  //       setClickedPoints([newPoint]);
  //     } else {
  //       const updatedPoints = [...currentPolygon.points, newPoint];
  //       setCurrentPolygon({ ...currentPolygon, points: updatedPoints });
  //       setClickedPoints(updatedPoints);
  //     }
  //   },
  //   [currentPolygon, scaleFactor, image, state.polygons.length]
  // );

  const calculateBBoxWithPadding = (
    points: { x: number; y: number }[],
    padding = 100
  ): [number, number, number, number] => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);

    const minX = Math.max(Math.min(...xs) - padding, 0);
    const minY = Math.max(Math.min(...ys) - padding, 0);
    const maxX = Math.max(...xs) + padding;
    const maxY = Math.max(...ys) + padding;

    return [minX, minY, maxX, maxY];
  };

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!canvasRef.current || !image) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();

      const clickX = (event.clientX - rect.left) / scaleFactor.x;
      const clickY = (event.clientY - rect.top) / scaleFactor.y;

      const newPoint = { x: clickX, y: clickY };

      if (!currentPolygon) {
        const newPolygon = {
          color: generateRandomColor(),
          label: `Polygon ${state.polygons.length + 1}`,
          points: [newPoint],
          bbox: calculateBBoxWithPadding([newPoint]), // Initial bbox with padding
          units: 0,
        };
        setCurrentPolygon(newPolygon);
        setClickedPoints([newPoint]);
      } else {
        const updatedPoints = [...currentPolygon.points, newPoint];
        const updatedBBox = calculateBBoxWithPadding(updatedPoints); // Proper bbox with padding

        const updatedPolygon = {
          ...currentPolygon,
          points: updatedPoints,
          bbox: updatedBBox,
        };

        setCurrentPolygon(updatedPolygon);
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
      setAddNew(false);
      showToast("success", "Success", "Polygon successfully added.");
    } else {
      showToast("warn", "Warning", "A polygon needs at least 3 points.");
    }
  }, [currentPolygon, state.polygons, setPolygons, showToast]);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const actions = [
    {
      label: "Navigate to Preview",
      icon: "pi pi-thumbs-up",
      command: () => {
        startTransition(() => {
          navigate("/preview");
        });
      },
      disabled:
        state?.imageSelected?.url?.length <= 0 || state.polygons?.length < 1,
      className:
        "bg-naples-yellow text-metallic-brown border-naples-yellow hover:bg-yellow-500",
    },
    {
      label: addNew ? "Complete Polygon" : "Edit Polygon",
      icon: addNew ? "pi pi-check" : "pi pi-pencil",
      // command: () => (addNew ? handleCompletePolygon() : setAddNew(true)),
      command: () => {
        if (addNew) {
          handleCompletePolygon();
        } else {
          setAddNew(true);
          setCurrentPolygon(null);
          setClickedPoints([]);
        }
      },

      disabled: !addNew && state.imageSelected.url === "",
      className:
        "bg-transparent text-naples-yellow border-2 border-naples-yellow hover:bg-naples-yellow hover:text-metallic-brown",
    },
    {
      label: "Show Polygons List",
      icon: "pi pi-list",
      command: () => setShowListOfPolygons(true),
      disabled: state.polygons.length < 1,
      className:
        "bg-transparent text-naples-yellow border-2 border-naples-yellow hover:bg-naples-yellow hover:text-metallic-brown",
      // template: (item, options) => (
      //   <Button
      //     {...options}
      //     className={`bg-transparent text-naples-yellow border-2 border-naples-yellow hover:bg-naples-yellow hover:text-metallic-brown relative`}
      //   >
      //     <i className={item.icon}></i>
      //     {state.polygons.length > 0 && (
      //       <span
      //         // value={state.polygons.length}
      //         className="bg-bud-green text-xs w-5 h-5 flex justify-center items-center rounded-full absolute -right-2 top-0 animate-pulse"
      //       >
      //         {state.polygons.length}
      //       </span>
      //     )}
      //   </Button>
      // ),
    },
  ];

  return (
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
                Draw required polygons
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-bud-green font-content font-medium">
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
                className="h-10 px-2 md:px-5 text-sm sm:text-base  flex items-center gap-2 rounded-2xl text-metallic-brown bg-naples-yellow border-naples-yellow"
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
                  className="h-10 px-2 md:px-5 text-sm sm:text-base flex items-center gap-2 rounded-2xl text-naples-yellow border border-naples-yellow bg-transparent"
                  onClick={() => setAddNew(true)}
                />
              )}
              {addNew && (
                <Button
                  icon="pi pi-check"
                  label="Complete Polygon"
                  onClick={handleCompletePolygon}
                  className="h-10 px-2 md:px-5 text-xs sm:text-sm flex items-center gap-2 rounded-2xl text-naples-yellow border border-naples-yellow bg-transparent"
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
                className="h-10 px-2 md:px-5 flex items-center gap-2 rounded-2xl text-sm sm:text-base text-naples-yellow border border-naples-yellow bg-transparent"
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
                  className="mx-auto border-2 border-ochre rounded-2xl md:rounded-3xl"
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
  );
};

export default PolygonDrawer;
