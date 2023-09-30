import { Button } from "primereact/button";
import React, { startTransition, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const PolygonDrawer = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [clickedPoints, setClickedPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [addNew, setAddNew] = useState(false);

  return (
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
            //   disabled={
            //     state?.imageSelected?.url?.length <= 0 ||
            //     state.polygons?.length < 1 ||
            //     addNew
            //   }
            label="Save & Continue"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              // console.log(canvasRef?.current?.getContext("2d"));
              startTransition(() => {
                navigate("/");
              });
            }}
          />
        </div>
      </div>
      <div className="w-full h-full flex flex-col md:flex-row gap-2">
        <div className="w-full md:w-2/4 lg:w-2/5 h-fit md:mb-0 mx-auto">
          <div className="w-fit h-fit m-auto border-2 border-ochre rounded-lg">
            <canvas
              className="mx-auto"
              ref={canvasRef}
              // width={300}
              // height={300}
              // onClick={(e) => (addNew ? handleCanvasClick(e) : "")}
            />
          </div>
        </div>
        <div className="w-full md:w-2/4 lg:w-3/5 border-2 border-ochre"></div>
      </div>
    </div>
  );
};

export default PolygonDrawer;
