import React, { startTransition, useEffect, useRef, useState } from "react";

import { Button } from "primereact/button";
// import { Panel } from "primereact/panel";
// import { Dropdown } from "primereact/dropdown";
// import { InputText } from "primereact/inputtext";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "../../Services/AppContext";
import { DEFAULT_LABEL } from "../../Services/constants";
import { generateRandomColor } from "../../Services/functionServices";
import "./PolygonDrawer.scss";
import { Polygon } from "../../Services/interfaces";

const PolygonDrawer = ({ setShowListOfPolygons }) => {
  const navigate = useNavigate();
  const { state, setPolygons, showToast } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasParentRef = useRef<HTMLDivElement | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<number>(0);
  // const [editLabel, setEditLabel] = useState<number | null>(null);
  // const [editedLabel, setEditedLabel] = useState<string>("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current && canvasParentRef.current) {
        const canvasParentWidth = canvasParentRef.current.clientWidth;
        canvasRef.current.width = canvasParentWidth;
        // Optionally update canvas height here if needed
      }
    };

    updateCanvasSize(); // Update canvas size initially
    window.addEventListener("resize", updateCanvasSize); // Add listener for window resize

    return () => {
      window.removeEventListener("resize", updateCanvasSize); // Remove listener on component unmount
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas?.width as number, canvas?.height as number);
      ctx.imageSmoothingEnabled = false;

      const img = new Image();
      img.src = state?.imageSelected?.url; //images;

      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const canvasWidth = canvas.width; // Get the current canvas width
        const canvasHeight = (imgHeight / imgWidth) * canvasWidth; // Calculate canvas height to maintain aspect ratio
        // console.log(canvasHeight, canvasWidth);
        canvas.width = canvasWidth; // Set canvas width
        canvas.height = canvasHeight; // Set canvas height

        const widthScaleFactor = imgWidth / canvasWidth; //canvasWidth / imgWidth;
        // const heightScaleFactor = canvasHeight / imgHeight;
        setScaleFactor(widthScaleFactor);
        // console.log(widthScaleFactor, heightScaleFactor);

        // Clear canvas and draw the image with zoom
        ctx?.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx?.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        // polygons.forEach((polygon) => {
        state.polygons?.forEach((polygon) => {
          const path = new Path2D();
          const [startPoint, ...restPoints] = polygon.points;
          path.moveTo(startPoint.x, startPoint.y);

          restPoints.forEach((point) => {
            path.lineTo(point.x, point.y);
          });

          path.closePath();

          ctx.strokeStyle = polygon.color;
          ctx.lineWidth = 2;

          ctx.fillStyle = `${polygon.color}60`;
          ctx.fill(path);

          const labelX =
            polygon.points.reduce((sum, point) => sum + point.x, 0) /
            polygon.points.length;
          const labelY =
            polygon.points.reduce((sum, point) => sum + point.y, 0) /
            polygon.points.length;

          ctx.fillStyle = "white";
          const padding = 10;
          const labelWidth =
            ctx.measureText(polygon.label.substring(0, 10))?.width + 8;
          const labelHeight = 14;
          ctx.fillRect(
            labelX - labelWidth / 2 - padding,
            labelY - labelHeight / 2 - padding,
            labelWidth + 2 * padding,
            labelHeight + 1.7 * padding
          );

          ctx.fillStyle = "black";
          ctx.font = "14px 'Verdana'";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(polygon.label.substring(0, 10), labelX, labelY);

          ctx.stroke(path);
        });

        // Draw clicked points
        clickedPoints.forEach((point) => {
          ctx.beginPath();
          ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
          ctx.fillStyle = "blue";
          ctx.fill();
        });
      };
    }
  }, [state.polygons, clickedPoints, state?.imageSelected?.url]);
  // }, [polygons, clickedPoints]);

  const handleCanvasClick = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    const clickX = event.clientX - rect!.left;
    const clickY = event.clientY - rect!.top;

    if (!currentPolygon) {
      setClickedPoints([{ x: clickX, y: clickY }]); // Set the first point
      setCurrentPolygon({
        color: generateRandomColor(),
        // label: `${DEFAULT_LABEL} ${polygons.length + 1}`,
        label: `${DEFAULT_LABEL} ${state.polygons?.length + 1}`,
        points: [{ x: clickX, y: clickY }],
        units: 0,
        bbox: [
          clickX * scaleFactor,
          clickY * scaleFactor,
          clickX * scaleFactor,
          clickY * scaleFactor,
        ],
      });
    } else {
      const updatedClickedPoints = [
        ...currentPolygon.points,
        { x: clickX, y: clickY },
      ];
      setCurrentPolygon({
        ...currentPolygon,
        points: updatedClickedPoints,
        bbox: calculateBoundingBox(updatedClickedPoints),
      });
      setClickedPoints([...clickedPoints, { x: clickX, y: clickY }]);

      // if (updatedClickedPoints.length === 4) {
      //   handleCompletePolygon();
      // }
    }
  };

  // Calculate BBox
  const calculateBoundingBox = (points: string | any[], padding = 20) => {
    if (points.length === 0) {
      return [0, 0, 0, 0]; // Return an empty bounding box if there are no points
    }

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      const { x, y } = points[i];
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }

    // Apply padding to the bounding box
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    return [minX, minY, maxX, maxY];
  };

  const handleCompletePolygon = () => {
    if (currentPolygon && currentPolygon.points.length >= 3) {
      // const updatedPolygons = [...polygons, currentPolygon];
      const updatedPolygons = [...state.polygons, currentPolygon];
      setPolygons(updatedPolygons);
      setCurrentPolygon(null);
      setClickedPoints([]);
      setAddNew(false);
      showToast("success", "Success", "Polygon added succesfully");
    } else {
      showToast(
        "warn",
        "Warning",
        "A polygon must have at least 3 points to be completed."
      );
    }
  };

  // Delete Polygon
  // const handleDeletePolygon = (index: number) => {
  //   const updatedPolygons = [...state.polygons];
  //   updatedPolygons.splice(index, 1);
  //   setPolygons(updatedPolygons);
  //   showToast("warn", "Warning", "Polygon deleted");
  // };

  // // Enable Edit for Polygon Lable
  // const handleEditLabel = (index: number) => {
  //   setEditLabel(index);
  //   setEditedLabel(state.polygons[index].label);
  // };

  // // Save new Polygon Label
  // const handleSaveLabel = () => {
  //   if (editLabel !== null && editedLabel.trim() !== "") {
  //     const updatedPolygons = [...state.polygons];
  //     updatedPolygons[editLabel].label = editedLabel?.trim();
  //     setPolygons(updatedPolygons);
  //     showToast("success", "Success", "Label Updated");
  //   }
  //   setEditLabel(null);
  // };

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
              <span className="text-lg md:text-xl font-heading text-naples-yellow">
                Draw required polygons
              </span>
              <span className="text-sm md:text-base text-bud-green font-content font-medium">
                Identify and select the correct annotations in the image
              </span>
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
                  className="h-10 px-2 md:px-5 text-sm sm:text-base text-naples-yellow border-2 border-naples-yellow bg-transparent"
                  onClick={() => setAddNew(true)}
                />
              )}
              {addNew && (
                <Button
                  icon="pi pi-check"
                  label="Complete Polygon"
                  onClick={handleCompletePolygon}
                  className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
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
          <div className="w-full h-full flex flex-col md:flex-row gap-2">
            <div className="w-full h-full md:mb-0 mx-auto flex justify-center">
              <div
                className="w-full h-fit border-2 border-ochre rounded-lg my-auto"
                ref={canvasParentRef}
              >
                <canvas
                  className="mx-auto rounded-lg"
                  ref={canvasRef}
                  onClick={(e) => (addNew ? handleCanvasClick(e) : "")}
                  // width={canvasParentRef?.current?.clientWidth}
                  // height={canvasParentRef?.current?.clientHeight}
                />
              </div>
            </div>
            {/* <div className="w-full md:w-2/4 lg:w-3/5">
              <div className="w-full p-3 rounded-xl bg-fern-green">
                <div className="flex justify-between items-center text-base text-blue-900 pb-2">
                  <span className="text-base sm:text-lg text-naples-yellow font-heading font-medium">
                    Polygon (
                    {state.polygons?.length < 10
                      ? `0${state.polygons?.length}`
                      : `${state.polygons?.length}`}
                    )
                  </span>
                  <div className="hidden">
                    {!addNew && (
                      <Button
                        disabled={state.imageSelected.url === ""}
                        icon="pi pi-plus"
                        label="Add Polygon"
                        className="h-9 sm:h-10 text-sm sm:text-base px-2 md:px-5 text-naples-yellow border-2 border-naples-yellow bg-transparent"
                        onClick={() => setAddNew(true)}
                      />
                    )}
                    {addNew && (
                      <Button
                        icon="pi pi-plus"
                        label="Complete Polygon"
                        onClick={handleCompletePolygon}
                        className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
                      />
                    )}
                  </div>
                </div>
                <div>
                  {state.polygons?.map((polygon, index) => (
                    <div className="mt-2" key={index}>
                      <Panel
                        className="annotationPanel w-full mb-1"
                        collapsed={true}
                        header={
                          <div className="w-full h-full flex justify-between items-center">
                            <span className="text-base sm:text-lg text-metallic-brown">
                              {polygon?.label}
                            </span>
                            <Button
                              icon="pi pi-trash"
                              onClick={() => handleDeletePolygon(index)}
                              className="p-2 text-sm bg-transparent text-metallic-brown border-0 rounded-full"
                            />
                          </div>
                        }
                        toggleable
                      >
                        <div className="w-full flex items-center gap-4">
                          <div className="w-full h-fit xs:h-9 sm:h-10 text-sm sm:text-base flex flex-col justify-center xs:flex-row items-end xs:items-center gap-4">
                            <InputText
                              value={
                                editLabel !== index
                                  ? polygon?.label
                                  : editedLabel
                              }
                              readOnly={editLabel !== index}
                              className="h-full w-full xs:w-3/4 bg-naples-yellow border-2 border-bud-green text-metallic-brown"
                              onChange={(e) => setEditedLabel(e.target?.value)}
                            />
                            {editLabel === index ? (
                              <Button
                                icon="pi pi-check"
                                label="Save Label"
                                className="w-fit xs:w-1/4 h-full bg-fern-green text-naples-yellow border-fern-green"
                                onClick={handleSaveLabel}
                              />
                            ) : (
                              <Button
                                icon="pi pi-pencil"
                                label="Edit Label"
                                className="w-fit xs:w-1/4 h-full bg-fern-green text-naples-yellow border-fern-green"
                                onClick={() => handleEditLabel(index)}
                              />
                            )}
                          </div>
                        </div>
                      </Panel>
                    </div>
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <div
        className={`w-full p-2 block md:hidden sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl text-xs`}
      >
        <div className="flex justify-center items-center flex-row gap-x-5 font-content">
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
              className=" text-sm sm:text-base px-2 md:px-5 text-naples-yellow border-2 border-naples-yellow bg-transparent"
              onClick={() => setAddNew(true)}
            />
          )}
          {addNew && (
            <Button
              icon="pi pi-check"
              rounded
              onClick={handleCompletePolygon}
              className=" text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
            />
          )}
          <div className="relative">
            <Button
              disabled={state.polygons.length < 1}
              icon={"pi pi-list"}
              rounded
              // size="small"
              className=" text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
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
