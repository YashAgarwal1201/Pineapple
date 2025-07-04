import { useEffect, useState } from "react";

import { ArrowUp, Trash, X } from "lucide-react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { ScrollTop } from "primereact/scrolltop";
import { Sidebar } from "primereact/sidebar";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";

import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";
import Layout from "../../Layout/Layout";
import { Polygon } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

const DrawPolygon = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();
  const { setPolygons, showToast } = state;

  const [loading, setLoading] = useState<boolean>(false);
  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  const [editLabel, setEditLabel] = useState<number | null>(null);
  const [editedLabel, setEditedLabel] = useState<string>("");

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
  }, []);

  const handleDeletePolygon = (index: number) => {
    const updatedPolygons = [...state.polygons];
    updatedPolygons.splice(index, 1);
    setPolygons(updatedPolygons);
    showToast("warn", "Warning", "Polygon deleted");
  };

  // Enable Edit for Polygon Lable
  const handleEditLabel = (index: number) => {
    setEditLabel(index);
    setEditedLabel(state.polygons[index].label);
  };

  // Save new Polygon Label
  const handleSaveLabel = () => {
    if (editLabel !== null && editedLabel.trim() !== "") {
      const updatedPolygons = [...state.polygons];
      updatedPolygons[editLabel].label = editedLabel?.trim();
      setPolygons(updatedPolygons);
      showToast("success", "Success", "Label Updated");
    }
    setEditLabel(null);
  };

  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!state.imageSelected?.url) return;

    const img = new Image();
    img.src = state.imageSelected.url;
    img.onload = () => {
      setImage(img);
      // updateCanvasSize(img);
    };
  }, [state.imageSelected?.url]);

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
        <PolygonDrawer setShowListOfPolygons={setShowListOfPolygons} />
      )}

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-naples-yellow">
            Polygons
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

                        <Button
                          onClick={() => handleDeletePolygon(index)}
                          className="p-2 text-sm flex items-center justify-center gap-2 bg-fern-green text-naples-yellow aspect-square border-0 rounded-full"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    );
                  }}
                  toggleable
                >
                  <div className="w-full flex flex-col gap-3 font-content">
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

                    {editLabel === index ? (
                      <p className="text-fern-green">
                        Enter new label for the polygon
                      </p>
                    ) : (
                      <p className="text-fern-green font-medium">
                        Change the label of polygon
                      </p>
                    )}
                    <div className="w-full h-fit text-sm sm:text-base flex flex-col justify-center xs:flex-row items-end xs:items-center gap-4">
                      <InputText
                        value={
                          editLabel !== index ? polygon?.label : editedLabel
                        }
                        readOnly={editLabel !== index}
                        className="h-10 w-full xs:w-[calc(100%-2.5rem)] rounded-full px-4 py-2 font-content bg-naples-yellow border xs:border-2 border-fern-green focus-visible:border-bud-green text-metallic-brown"
                        onChange={(e) => setEditedLabel(e.target?.value)}
                      />
                      {editLabel === index ? (
                        <Button
                          icon="pi pi-check"
                          // label="Save Label"
                          className="w-10 h-10 rounded-full bg-fern-green text-naples-yellow border-fern-green"
                          onClick={handleSaveLabel}
                        />
                      ) : (
                        <Button
                          icon="pi pi-pencil"
                          // label="Edit Label"
                          className="w-10 h-10 rounded-full bg-fern-green text-naples-yellow border-fern-green"
                          onClick={() => handleEditLabel(index)}
                        />
                      )}
                    </div>

                    <div className="w-full flex flex-col gap-y-1 font-content mt-5">
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
                  </div>
                </Panel>

                {index !== state.polygons?.length - 1 && (
                  <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-center h-[40px] text-ochre font-content text-base xs:text-lg md:text-xl  my-auto">
                No data to display
              </p>
            </div>
          )}

          <ScrollTop
            target="parent"
            threshold={100}
            className="size-8 bg-[#e0e0e0] *:text-[#000] ml-auto shadow-none "
            icon={<ArrowUp size={16} />}
          />
        </div>
      </Sidebar>
    </Layout>
  );
};

export default DrawPolygon;
