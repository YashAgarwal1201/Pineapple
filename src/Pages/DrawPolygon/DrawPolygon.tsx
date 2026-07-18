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
import { resetColorIndex } from "../../Services/functionServices";
import { Polygon, Rectangle } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

const DrawPolygon = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();
  const { setPolygons, setRectangles, showToast } = state;

  const [loading, setLoading] = useState<boolean>(false);
  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  // Identifies which shape (of either type) is mid-edit — a plain index
  // isn't enough now that two separate arrays share this sidebar, so the
  // key carries the shape kind too, e.g. "rectangle-2".
  const [editKey, setEditKey] = useState<string | null>(null);
  const [editedLabel, setEditedLabel] = useState<string>("");

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
  }, []);

  const handleDeleteShape = (kind: "polygon" | "rectangle", index: number) => {
    if (kind === "polygon") {
      const updated = [...state.polygons];
      updated.splice(index, 1);
      setPolygons(updated);
      // Only reset the color cycle once every shape is gone, since polygons
      // and rectangles draw from the same palette/index.
      if (updated.length === 0 && state.rectangles.length === 0) {
        resetColorIndex();
      }
    } else {
      const updated = [...state.rectangles];
      updated.splice(index, 1);
      setRectangles(updated);
      if (updated.length === 0 && state.polygons.length === 0) {
        resetColorIndex();
      }
    }
    showToast("warn", "Warning", "Shape deleted");
  };

  // Enable Edit for a shape's label
  const handleEditLabel = (kind: "polygon" | "rectangle", index: number) => {
    setEditKey(`${kind}-${index}`);
    setEditedLabel(
      kind === "polygon"
        ? state.polygons[index].label
        : state.rectangles[index].label,
    );
  };

  // Save the new label back to the correct array
  const handleSaveLabel = (kind: "polygon" | "rectangle", index: number) => {
    if (editedLabel.trim() === "") {
      setEditKey(null);
      return;
    }
    if (kind === "polygon") {
      const updated = [...state.polygons];
      updated[index] = { ...updated[index], label: editedLabel.trim() };
      setPolygons(updated);
    } else {
      const updated = [...state.rectangles];
      updated[index] = { ...updated[index], label: editedLabel.trim() };
      setRectangles(updated);
    }
    showToast("success", "Success", "Label Updated");
    setEditKey(null);
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
    image: HTMLImageElement,
  ) => {
    // const [x1, y1, x2, y2] = polygon.bbox;
    // const cropWidth = x2 - x1;
    // const cropHeight = y2 - y1;

    const [rawX1, rawY1, rawX2, rawY2] = polygon.bbox;
    // Clamp to image natural bounds to prevent black strips
    const x1 = Math.max(0, rawX1);
    const y1 = Math.max(0, rawY1);
    const x2 = Math.min(image.naturalWidth, rawX2);
    const y2 = Math.min(image.naturalHeight, rawY2);
    const cropWidth = x2 - x1;
    const cropHeight = y2 - y1;
    if (cropWidth <= 0 || cropHeight <= 0) return; // guard against degenerate bbox

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

  const drawMiniCroppedRectangle = (
    ctx: CanvasRenderingContext2D,
    rectangle: Rectangle,
    image: HTMLImageElement,
  ) => {
    // Same padding-and-clamp approach as the polygon version, just derived
    // from the rectangle's two corners instead of a stored bbox.
    const padding = 40;
    const rawX1 = Math.min(rectangle.startX, rectangle.endX) - padding;
    const rawY1 = Math.min(rectangle.startY, rectangle.endY) - padding;
    const rawX2 = Math.max(rectangle.startX, rectangle.endX) + padding;
    const rawY2 = Math.max(rectangle.startY, rectangle.endY) + padding;

    const x1 = Math.max(0, rawX1);
    const y1 = Math.max(0, rawY1);
    const x2 = Math.min(image.naturalWidth, rawX2);
    const y2 = Math.min(image.naturalHeight, rawY2);
    const cropWidth = x2 - x1;
    const cropHeight = y2 - y1;
    if (cropWidth <= 0 || cropHeight <= 0) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const scaleX = ctx.canvas.width / cropWidth;
    const scaleY = ctx.canvas.height / cropHeight;

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

    const rx = (Math.min(rectangle.startX, rectangle.endX) - x1) * scaleX;
    const ry = (Math.min(rectangle.startY, rectangle.endY) - y1) * scaleY;
    const rw = Math.abs(rectangle.endX - rectangle.startX) * scaleX;
    const rh = Math.abs(rectangle.endY - rectangle.startY) * scaleY;

    ctx.beginPath();
    ctx.rect(rx, ry, rw, rh);
    ctx.strokeStyle = rectangle.color;
    ctx.lineWidth = 1.5;
    ctx.fillStyle = `${rectangle.color}60`;
    ctx.fill();
    ctx.stroke();
  };

  const confirmDeleteShape = (kind: "polygon" | "rectangle", index: number) => {
    const label =
      kind === "polygon"
        ? state.polygons[index].label
        : state.rectangles[index].label;
    confirmDialog({
      message: `Are you sure you want to delete "${label}"? This action cannot be undone.`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      defaultFocus: "reject",
      acceptClassName: "!bg-red-600 !border-red-600 hover:!bg-red-700",
      rejectClassName:
        "!bg-transparent !border-stone-300 !text-stone-700 dark:!text-stone-300",
      accept: () => handleDeleteShape(kind, index),
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
            Shapes
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
          {state.polygons.length + state.rectangles.length > 0 ? (
            [
              ...state.polygons.map((data, index) => ({
                kind: "polygon" as const,
                index,
                data,
              })),
              ...state.rectangles.map((data, index) => ({
                kind: "rectangle" as const,
                index,
                data,
              })),
            ].map((shape, listPos, list) => {
              const { kind, index, data } = shape;
              const key = `${kind}-${index}`;
              const isEditing = editKey === key;

              return (
                <div className="mb-2" key={key}>
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
                              style={{ backgroundColor: data.color }}
                            ></span>
                            <span className="text-base sm:text-lg font-heading">
                              {data.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-700/60 text-stone-500 dark:text-stone-400">
                              {kind}
                            </span>
                          </div>

                          <div className="flex items-center gap-x-2">
                            <Button
                              aria-label="Delete Annotation"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent panel toggle
                                confirmDeleteShape(kind, index);
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
                              if (kind === "polygon") {
                                drawMiniCroppedPolygon(
                                  ctx,
                                  data as Polygon,
                                  image,
                                );
                              } else {
                                drawMiniCroppedRectangle(
                                  ctx,
                                  data as Rectangle,
                                  image,
                                );
                              }
                            }
                          }
                        }}
                      />

                      <p className="font-content text-amber-600 dark:text-amber-400">
                        {isEditing
                          ? `Enter new label for the ${kind}`
                          : `Change the label of this ${kind}`}
                      </p>
                      <div className="w-full h-fit text-sm sm:text-base flex justify-center flex-col gap-4">
                        <InputText
                          value={!isEditing ? data.label : editedLabel}
                          disabled={!isEditing}
                          className={`h-10 w-full !rounded-2xl px-4 py-2 font-content bg-naples-yellow border xs:border border-fern-green focus-visible:border-bud-green text-metallic-brown`}
                          onChange={(e) => setEditedLabel(e.target?.value)}
                        />

                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                className="px-4 py-2 flex items-center gap-x-2 !text-white !bg-lime-600 dark:!bg-lime-700 border !border-lime-600 dark:!border-lime-700 !rounded-l-2xl !rounded-r-sm"
                                onClick={() => handleSaveLabel(kind, index)}
                              >
                                <Check size={16} />
                                <span>Save Label</span>
                              </Button>
                              <Button
                                className="px-4 py-2 flex items-center gap-x-2 !bg-transparent border! !border-red-300 !text-red-500 hover:!bg-red-50 hover:!border-red-400 dark:!border-red-600 dark:!text-red-400 !rounded-r-2xl !rounded-l-sm"
                                onClick={() => setEditKey(null)}
                              >
                                <X size={16} />
                                <span>Cancel</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="px-4 py-2 flex items-center gap-x-2 !text-white !bg-amber-600 dark:!bg-amber-700 border !border-amber-600 dark:!border-amber-700 !rounded-2xl"
                              onClick={() => handleEditLabel(kind, index)}
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
                        {kind === "polygon" ? (
                          (data as Polygon).points?.map((values, key) => (
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
                          ))
                        ) : (
                          <>
                            <p className="w-full flex flex-row items-center gap-x-1 text-sm sm:text-base">
                              <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                                X1
                              </span>
                              <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                                {Math.round((data as Rectangle).startX)}
                              </span>
                              <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                                Y1
                              </span>
                              <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                                {Math.round((data as Rectangle).startY)}
                              </span>
                            </p>
                            <p className="w-full flex flex-row items-center gap-x-1 text-sm sm:text-base">
                              <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                                X2
                              </span>
                              <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                                {Math.round((data as Rectangle).endX)}
                              </span>
                              <span className="w-[20%] p-2 border border-bud-green text-metallic-brown rounded-l-lg text-right">
                                Y2
                              </span>
                              <span className="w-[30%] p-2 border border-bud-green text-metallic-brown rounded-r-lg">
                                {Math.round((data as Rectangle).endY)}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </Panel>

                  {listPos !== list.length - 1 && (
                    <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />
                  )}
                </div>
              );
            })
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
