import React, { startTransition, useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext/AppContext";
import { generateRandomColor } from "../../Services/functionServices";
import "./PolygonDrawer.scss";

interface Polygon {
  points: { x: number; y: number }[];
  color: string;
  label: string;
  units: string | number;
}

interface Label {
  name: string;
  code: string;
}

const PolygonDrawer = () => {
  const navigate = useNavigate();
  const { state, setPolygons, showToast } = useAppContext();

  const DEFAULT_LABEL = "Item";
  const labels: Label[] = [
    { name: "Catheter", code: "CAT" },
    { name: "Unknown Label", code: "UK" },
  ];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState(false);
  const [scaleFactor, setScaleFactor] = useState<number>(0);

  useEffect(() => {
    // if (state?.imageSelected?.url?.length < 1) {
    //   startTransition(() => {
    //     navigate("/");
    //   });
    // }
    // console.log(state?.polygons);
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas?.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas?.width as number, canvas?.height as number);

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
          const padding = 4;
          const labelWidth = ctx.measureText(polygon.label).width + 5;
          const labelHeight = 14;
          ctx.fillRect(
            labelX - labelWidth / 2 - padding,
            labelY - labelHeight / 2 - padding,
            labelWidth + 2 * padding,
            labelHeight + 1 * padding
          );

          ctx.fillStyle = "black";
          ctx.font = "12px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(polygon.label, labelX, labelY);

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
      });
    } else {
      const updatedClickedPoints = [
        ...currentPolygon.points,
        { x: clickX, y: clickY },
      ];
      setCurrentPolygon({
        ...currentPolygon,
        points: updatedClickedPoints,
      });
      setClickedPoints([...clickedPoints, { x: clickX, y: clickY }]);

      // if (updatedClickedPoints.length === 4) {
      //   handleCompletePolygon();
      // }
    }
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
      alert("A polygon must have at least 3 points to be completed.");
    }
  };

  const handleDeletePolygon = (index: number) => {
    // const updatedPolygons = [...polygons];
    const updatedPolygons = [...state.polygons];
    updatedPolygons.splice(index, 1);
    setPolygons(updatedPolygons);
    showToast("warn", "Warning", "Polygon deleted");
  };

  const handleLabelChange = (index: number, selectedLabel: Label | null) => {
    if (selectedLabel) {
      // const updatedPolygons = [...polygons];
      const updatedPolygons = [...state.polygons];
      updatedPolygons[index].label = selectedLabel.name;
      setPolygons(updatedPolygons);
      showToast("success", "Success", "Label Updated");
    }
  };

  return (
    <>
      <div className="customScrollbar h-full p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md overflow-y-auto">
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5 overflow-y-auto">
          <div className="px-2 md:px-0 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-lg md:text-xl font-medium text-naples-yellow">
                Draw required polygons
              </span>
              <span className="text-sm md:text-base text-bud-green">
                Identify and select the correct annotations in the image
              </span>
            </div>
            <div className="hidden md:flex flex-row gap-x-10">
              {/* {!addNew && (
    <Button
      icon="pi pi-plus"
      label="Add New"
      className="px-5 text-[#3778B1] border-2 border-[#3778B1] bg-transparent"
      onClick={() => setAddNew(true)}
    />
  )}
  {addNew && (
    <Button
      icon="pi pi-plus"
      label="Complete Polygon"
      onClick={handleCompletePolygon}
      className="px-5 text-[#3778B1] border-2 border-[#3778B1] bg-transparent"
    />
  )} */}
              <Button
                disabled={
                  state?.imageSelected?.url?.length <= 0 ||
                  state.polygons?.length < 1
                }
                label="Save & Continue"
                className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => {
                  // console.log(canvasRef?.current?.getContext("2d"));
                  startTransition(() => {
                    navigate("/success");
                  });
                }}
              />
            </div>
          </div>
          <div className="w-full h-full flex flex-col md:flex-row gap-2">
            <div className="w-full md:w-2/4 lg:w-2/5 h-fit md:mb-0 mx-auto">
              <div className="w-fit h-fit m-auto border-2 border-ochre rounded-lg">
                <canvas
                  className="mx-auto rounded-lg"
                  ref={canvasRef}
                  onClick={(e) => (addNew ? handleCanvasClick(e) : "")}
                />
              </div>
            </div>
            <div className="w-full md:w-2/4 lg:w-3/5">
              <div className="w-full p-3 rounded-xl bg-fern-green">
                <div className="flex justify-between items-center text-base text-blue-900 pb-2">
                  <span className="text-sm sm:text-base text-naples-yellow font-semibold">
                    Annotations (
                    {state.polygons?.length < 10
                      ? `0${state.polygons?.length}`
                      : `${state.polygons?.length}`}
                    )
                  </span>
                  {!addNew && (
                    <Button
                      icon="pi pi-plus"
                      label="Add Annotation"
                      className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
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
                          <Dropdown
                            value={polygon?.label}
                            onChange={(e) => handleLabelChange(index, e.value)}
                            options={labels}
                            optionLabel="name"
                            placeholder="Select an Annotation label"
                            className="w-full md:w-14rem"
                          />
                        </div>
                      </Panel>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full p-2 flex md:hidden flex-col items-center sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl text-xs`}
      >
        <div className="flex flex-row gap-x-10">
          {/* {!addNew && (
      <Button
        icon="pi pi-plus"
        label="Add New"
        className="px-2 md:px-5 text-xs sm:text-sm text-[#3778B1] border-2 border-[#3778B1] bg-transparent"
        onClick={() => setAddNew(true)}
      />
    )}
    {addNew && (
      <Button
        icon="pi pi-plus"
        label="Complete Polygon"
        onClick={handleCompletePolygon}
        className="px-2 md:px-5 text-xs sm:text-sm text-[#3778B1] border-2 border-[#3778B1] bg-transparent"
      />
    )} */}
          <Button
            disabled={
              state?.imageSelected?.url?.length <= 0 ||
              state.polygons?.length < 1
            }
            label="Save & Continue"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              startTransition(() => {
                navigate("/success");
              });
            }}
          />
        </div>
      </div>
    </>
  );
};

export default PolygonDrawer;
