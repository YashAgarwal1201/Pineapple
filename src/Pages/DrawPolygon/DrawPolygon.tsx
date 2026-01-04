// src/Pages/DrawPolygon/DrawPolygon.tsx
import { useEffect, useState } from "react";

import { ArrowUp, Check, Pencil, Trash, X } from "lucide-react";
import { Button } from "primereact/button";
import { confirmDialog } from "primereact/confirmdialog";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { ScrollTop } from "primereact/scrolltop";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";

import PineappleLoader from "../../Components/Loaders/Loaders";
import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";
import Layout from "../../Layout/Layout";
import { Polygon } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

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

  // const drawMiniCroppedPolygon = (
  //   ctx: CanvasRenderingContext2D,
  //   polygon: Polygon,
  //   image: HTMLImageElement
  // ) => {
  //   const canvas = ctx.canvas;

  //   // Physical display size in CSS pixels
  //   const displayWidth = 120;
  //   const displayHeight = 120;

  //   // Get device pixel ratio (2 for Retina, 1 for standard displays)
  //   const dpr = window.devicePixelRatio || 1;

  //   // Set the canvas internal resolution (actual pixels)
  //   canvas.width = displayWidth * dpr;
  //   canvas.height = displayHeight * dpr;

  //   // Scale the canvas back down to display size via CSS
  //   canvas.style.width = `${displayWidth}px`;
  //   canvas.style.height = `${displayHeight}px`;

  //   // Scale all drawing operations by DPR
  //   ctx.scale(dpr, dpr);

  //   // Enable high-quality image smoothing
  //   ctx.imageSmoothingEnabled = true;
  //   ctx.imageSmoothingQuality = "high";

  //   const [x1, y1, x2, y2] = polygon.bbox;
  //   const cropWidth = x2 - x1;
  //   const cropHeight = y2 - y1;

  //   ctx.clearRect(0, 0, displayWidth, displayHeight);

  //   // Calculate scale ratios based on DISPLAY size (not canvas.width/height)
  //   const scaleX = displayWidth / cropWidth;
  //   const scaleY = displayHeight / cropHeight;

  //   // Draw image at display dimensions
  //   ctx.drawImage(
  //     image,
  //     x1,
  //     y1,
  //     cropWidth,
  //     cropHeight,
  //     0,
  //     0,
  //     displayWidth,
  //     displayHeight
  //   );

  //   // Transform and draw polygon
  //   const adjustedPoints = polygon.points.map((p) => ({
  //     x: (p.x - x1) * scaleX,
  //     y: (p.y - y1) * scaleY,
  //   }));

  //   ctx.beginPath();
  //   if (adjustedPoints.length > 0) {
  //     ctx.moveTo(adjustedPoints[0].x, adjustedPoints[0].y);
  //     adjustedPoints.forEach((pt) => ctx.lineTo(pt.x, pt.y));
  //     ctx.closePath();

  //     ctx.strokeStyle = polygon.color;
  //     ctx.lineWidth = 2; // Will be scaled by DPR automatically
  //     ctx.fillStyle = `${polygon.color}60`;
  //     ctx.fill();
  //     ctx.stroke();
  //   }

  //   // Draw coordinate labels
  //   ctx.font = "bold 11px Comfortaa, sans-serif";
  //   ctx.textAlign = "center";
  //   ctx.textBaseline = "middle";

  //   adjustedPoints.forEach((pt, index) => {
  //     const label = `x${index},y${index}`;
  //     const metrics = ctx.measureText(label);
  //     const padding = 4;

  //     // Background box
  //     ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  //     ctx.fillRect(
  //       pt.x - metrics.width / 2 - padding,
  //       pt.y - 9,
  //       metrics.width + padding * 2,
  //       18
  //     );

  //     // Text
  //     ctx.fillStyle = "#000";
  //     ctx.fillText(label, pt.x, pt.y);

  //     // Point circle
  //     ctx.beginPath();
  //     ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
  //     ctx.fillStyle = polygon.color;
  //     ctx.fill();
  //     ctx.strokeStyle = "#fff";
  //     ctx.lineWidth = 2;
  //     ctx.stroke();
  //   });
  // };

  const confirmDeletePolygon = (index: number) => {
    confirmDialog({
      message: `Are you sure you want to delete "${state.polygons[index].label}"? This action cannot be undone.`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "!bg-red-600 !border-red-600 hover:!bg-red-700",
      rejectClassName:
        "!bg-transparent !border-stone-300 !text-stone-700 dark:!text-stone-300",
      accept: () => handleDeletePolygon(index),
      reject: () => {
        // Optional: show cancelled toast
        showToast("info", "Info", "Deletion cancelled");
      },
    });
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
        <PolygonDrawer setShowListOfPolygons={setShowListOfPolygons} />
      )}

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
            Polygons
          </h2>
        }
        className="polygon-list-sidebar side-menu !rounded-none md:!rounded-r-3xl !bg-white dark:!bg-black aboutDialog !w-full md:!w-[768px]"
        // className=" side-menu rounded-none md:rounded-r-3xl bg-metallic-brown aboutDialog w-full md:w-[768px]"
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

                        <div className="flex items-center gap-x-2">
                          <Button
                            aria-label="Delete Annotation"
                            // onClick={() => handleDeletePolygon(index)}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent panel toggle
                              confirmDeletePolygon(index);
                            }}
                            className="p-2 text-sm flex items-center justify-center gap-2 bg-fern-green text-naples-yellow aspect-square border-0 !rounded-full"
                          >
                            <Trash size={16} />
                          </Button>

                          <div className="p-button p-2 text-sm flex items-center justify-center gap-2 bg-fern-green text-naples-yellow aspect-square border-0 !rounded-full">
                            <span
                              className={`pi ${
                                options.collapsed
                                  ? "pi-chevron-down"
                                  : "pi-chevron-up"
                              } `}
                            ></span>
                          </div>
                        </div>
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

                    <p className="font-content text-amber-600 dark:text-amber-400">
                      {editLabel === index
                        ? "Enter new label for the polygon"
                        : "Change the label of polygon"}
                    </p>
                    <div className="w-full h-fit text-sm sm:text-base flex justify-center flex-col gap-4">
                      <InputText
                        value={
                          editLabel !== index ? polygon?.label : editedLabel
                        }
                        disabled={editLabel !== index}
                        className={`h-10 w-full !rounded-2xl px-4 py-2 font-content bg-naples-yellow border xs:border border-fern-green focus-visible:border-bud-green text-metallic-brown`}
                        onChange={(e) => setEditedLabel(e.target?.value)}
                      />

                      <div className="flex items-center gap-1">
                        {editLabel === index ? (
                          <>
                            <Button
                              className="px-4 py-2 flex items-center gap-x-2 !text-white !bg-lime-600 dark:!bg-lime-700 border !border-lime-600 dark:!border-lime-700 !rounded-l-2xl !rounded-r-sm"
                              onClick={handleSaveLabel}
                            >
                              <Check size={16} />
                              <span>Save Label</span>
                            </Button>
                            <Button
                              className="px-4 py-2 flex items-center gap-x-2 !bg-transparent !border !border-red-300 !text-red-500 hover:!bg-red-50 hover:!border-red-400 dark:!border-red-600 dark:!text-red-400 !rounded-r-2xl !rounded-l-sm"
                              onClick={() => handleEditLabel(-1)}
                            >
                              <X size={16} />
                              <span>Cancel</span>
                            </Button>
                          </>
                        ) : (
                          <Button
                            className="px-4 py-2 flex items-center gap-x-2 !text-white !bg-amber-600 dark:!bg-amber-700 border !border-amber-600 dark:!border-amber-700 !rounded-2xl"
                            onClick={() => handleEditLabel(index)}
                          >
                            <Pencil size={16} />
                            <span>Edit label</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="w-full flex flex-col gap-y-1 font-content mt-5">
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
