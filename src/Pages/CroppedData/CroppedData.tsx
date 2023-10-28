import { startTransition, useEffect, useRef, useState } from "react";
import Header from "../../Components/Header/Header";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext/AppContext";
import "./CroppedData.scss";

const CroppedData = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const [scaleFactor, setScaleFactor] = useState<number>(0);
  const [imgType, setImgType] = useState("full");

  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft -= 200;
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollLeft += 200;
    }
  };

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
      img.src = state?.imageSelected?.url;

      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const canvasWidth = canvas.width; // Get the current canvas width
        const canvasHeight = (imgHeight / imgWidth) * canvasWidth; // Calculate canvas height to maintain aspect ratio
        // console.log(canvasHeight, canvasWidth);
        canvas.width = canvasWidth; // Set canvas width
        canvas.height = canvasHeight; // Set canvas height

        // const widthScaleFactor = imgWidth / canvasWidth; //canvasWidth / imgWidth;
        // const heightScaleFactor = canvasHeight / imgHeight;
        // setScaleFactor(widthScaleFactor);
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
      };
    }
  }, [state.polygons, state?.imageSelected?.url]);

  const draw = (
    ctx: any,
    polygon: any,
    // scaleFactoX?: any,
    // scaleFactoY?: any,
    x: any,
    y: any
  ) => {
    ctx.imageSmoothingEnabled = true;

    const path = new Path2D();
    const [startPoint, ...restPoints] = polygon.points;
    path.moveTo(startPoint.x - x, startPoint.y - y);

    restPoints.forEach((point: any) => {
      path.lineTo(point.x - x, point.y - y);
    });

    path.closePath();

    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = 2.5;

    // Fill polygon with translucent color
    ctx.fillStyle = `${polygon.color}50`;
    ctx.fill(path);

    // // Draw label
    // const labelX =
    //   polygon.points.reduce((sum: any, point: any) => sum + point.x - x, 0) /
    //   polygon.points.length;
    // const labelY =
    //   polygon.points.reduce((sum: any, point: any) => sum + point.y - y, 0) /
    //     polygon.points.length +
    //   40;

    // ctx.fillStyle = "#ffffff90";
    // const padding = 4;
    // const labelWidth = ctx.measureText(polygon.label).width + 5;
    // const labelHeight = 14;

    // ctx.fillRect(
    //   labelX - labelWidth / 2 - padding,
    //   labelY - labelHeight / 2 - padding,
    //   labelWidth + 2 * padding,
    //   labelHeight + 1 * padding
    // );

    // ctx.fillStyle = "black";
    // ctx.font = "11px Arial";
    // ctx.textAlign = "center";
    // ctx.textBaseline = "middle";
    // ctx.fillText(polygon.label, labelX, labelY);

    ctx.stroke(path);
  };

  const draw2 = (ctx: any, polygon: any, scaleFacto: any) => {
    const path = new Path2D();
    const [startPoint, ...restPoints] = polygon.points;
    path.moveTo(startPoint.x * scaleFacto, startPoint.y * scaleFacto);

    restPoints.forEach((point: any) => {
      path.lineTo(point.x * scaleFacto, point.y * scaleFacto);
    });

    path.closePath();

    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = 2;

    // Fill polygon with translucent color
    ctx.fillStyle = `${polygon.color}60`;
    ctx.fill(path);

    ctx.stroke(path);
  };

  useEffect(() => {
    const waitForCanvas2 = () => {
      canvasRefs?.current?.forEach((canvas, index) => {
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            const item = state.polygons[index];

            const img = new Image();

            img.src = state.imageSelected.url;
            // img.src = cropImage(state.feedbackImage.image, item.bbox);

            // const image = new Image();
            // image.crossOrigin = "anonymous";

            img.onload = () => {
              const imgWidth = img.width;
              const imgHeight = img.height;

              const canvasWidth = canvas.width;
              const canvasHeight = (imgHeight / imgWidth) * canvasWidth;

              let width, height;

              if (item.bbox && imgType === "cropped") {
                console.log(99);
                width = item.bbox[2] - item.bbox[0];
                height = item.bbox[3] - item.bbox[1];
                canvas.width = width;
                canvas.height = height;
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(
                  img,
                  item.bbox[0],
                  item.bbox[1],
                  width,
                  height,
                  0,
                  0,
                  width,
                  height
                );
                draw(ctx, item, item?.bbox[0], item?.bbox[1]);
              } else {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                draw2(ctx, item, imgWidth / canvasWidth);
              }
            };

            img.onerror = (error) => {
              console.error("Image load error:", error);
            };
          } else {
            requestAnimationFrame(waitForCanvas2);
          }
        }
      });
    };
    waitForCanvas2();
  }, [imgType]);

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <Header />

      <div className="customScrollbar h-full py-3 px-1 sm:px-3 my-3 mx-0 sm:mx-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md overflow-y-auto">
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5 overflow-y-auto">
          <div className="px-2 md:px-0 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-lg md:text-xl font-medium text-naples-yellow">
                Annotations on Cropped Image
              </span>
              <span className="text-sm md:text-base text-bud-green font-medium">
                Individual annotations on cropped image
              </span>
            </div>
            <div className="hidden md:flex flex-row gap-x-10">
              <Button
                disabled={
                  state?.imageSelected?.url?.length <= 0 ||
                  state.polygons?.length < 1
                }
                icon="pi pi-check"
                label="Continue"
                className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => {
                  startTransition(() => {
                    navigate("/preview");
                  });
                }}
              />
            </div>
          </div>
          <div className="w-full h-full flex flex-col md:flex-row gap-2">
            <div className="w-full md:w-2/4 lg:w-2/5 h-fit md:mb-0 mx-auto">
              <div className="w-fit h-fit m-auto border-2 border-ochre rounded-lg">
                <canvas className="mx-auto rounded-lg" ref={canvasRef} />
              </div>
            </div>
            <div className="w-full md:w-2/4 lg:w-3/5">
              <div className="w-full p-3 rounded-xl bg-fern-green">
                <div className="flex justify-between items-center text-base text-blue-900 pb-2">
                  <span className="text-base sm:text-lg text-naples-yellow font-semibold">
                    Annotations on{" "}
                    {imgType === "cropped" ? "cropped image" : "full image"} (
                    {state.polygons?.length < 10
                      ? `0${state.polygons?.length}`
                      : `${state.polygons?.length}`}
                    )
                  </span>
                  <Button
                    disabled={state.imageSelected.url === ""}
                    icon="pi pi-images"
                    label={`${
                      imgType === "cropped" ? "Cropped Image" : "Full Image"
                    }`}
                    title="change orientation"
                    className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
                    onClick={() => {
                      if (imgType === "full") setImgType("cropped");
                      else setImgType("full");
                    }}
                  />
                </div>
                <div className="mt-2 relative">
                  <div
                    className="customCarouselScrollbar w-full h-full flex justify-start items-center overflow-x-auto"
                    ref={containerRef}
                  >
                    {state.polygons?.map((_item, index) => (
                      <div
                        key={index}
                        title="Click to open eedback dialog box"
                        className="w-fit h-full p-2 flex flex-col items-center justify-center gap-y-2 bg-bud-green rounded-lg mr-2"
                        // onClick={() =>
                        //   feedbackButtonHandeler(item.image, item.id)
                        // }
                      >
                        <div
                          className="w-fit flex items-center"
                          style={{ height: "calc(100% - 2.5rem)" }}
                        >
                          <canvas
                            className=" mx-auto rounded-lg"
                            ref={(canvas) => {
                              return (canvasRefs.current[index] = canvas);
                            }}
                            width={200}
                            style={{
                              maxHeight: "250px",
                              height: "250px",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    icon="pi pi-angle-left "
                    title="scroll-left"
                    className="!w-[30px] !h-[30px] rounded-full border-0 bg-naples-yellow text-fern-green absolute -left-2 top-[45%] shadow-md"
                    onClick={() => scrollLeft()}
                  />
                  <Button
                    icon="pi pi-angle-right"
                    title="scroll-right"
                    className="!w-[30px] !h-[30px] rounded-full border-0 bg-naples-yellow text-fern-green absolute -right-2 top-[45%] shadow-md"
                    onClick={() => scrollRight()}
                  />
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
          <Button
            disabled={
              state?.imageSelected?.url?.length <= 0 ||
              state.polygons?.length < 1
            }
            icon="pi pi-check"
            label="Continue"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              startTransition(() => {
                navigate("/preview");
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CroppedData;
