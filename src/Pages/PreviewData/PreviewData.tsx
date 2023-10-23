import { startTransition, useEffect, useRef } from "react";
import Header from "../../Components/Header/Header";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext/AppContext";
import "./PreviewData.scss";

const PreviewData = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // const [scaleFactor, setScaleFactor] = useState<number>(0);

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

        // Draw clicked points
        // clickedPoints.forEach((point) => {
        //   ctx.beginPath();
        //   ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        //   ctx.fillStyle = "blue";
        //   ctx.fill();
        // });
      };
    }
  }, [state.polygons, state?.imageSelected?.url]);

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <Header />

      <div className="customScrollbar h-full p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md overflow-y-auto">
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5 overflow-y-auto">
          <div className="px-2 md:px-0 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-lg md:text-xl font-medium text-naples-yellow">
                Preview Data
              </span>
              <span className="text-sm md:text-base text-bud-green">
                Preview the data before proceeding
              </span>
            </div>
            <div className="hidden md:flex flex-row gap-x-10">
              <Button
                disabled={
                  state?.imageSelected?.url?.length <= 0 ||
                  state.polygons?.length < 1
                }
                label="Continue"
                className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => {
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
                <canvas className="mx-auto rounded-lg" ref={canvasRef} />
              </div>
            </div>
            <div className="w-full md:w-2/4 lg:w-3/5">
              <div className="w-full p-3 rounded-xl bg-fern-green">
                <div className="flex justify-between items-center text-base text-blue-900 pb-2">
                  <span className="text-base sm:text-lg text-naples-yellow font-semibold">
                    Annotations (
                    {state.polygons?.length < 10
                      ? `0${state.polygons?.length}`
                      : `${state.polygons?.length}`}
                    )
                  </span>
                  <Button
                    disabled={state.imageSelected.url === ""}
                    icon="pi pi-plus"
                    label="Edit / Add Annotations"
                    className="h-10 px-2 md:px-5 text-xs sm:text-sm text-naples-yellow border-2 border-naples-yellow bg-transparent"
                    onClick={() =>
                      startTransition(() => {
                        navigate("/draw");
                      })
                    }
                  />
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
                          </div>
                        }
                        toggleable
                      >
                        <div className="w-full flex flex-col gap-y-1">
                          <p className="w-full p-2 bg-fern-green text-naples-yellow font-medium rounded-lg">
                            Coordinates -{" "}
                          </p>
                          {polygon.points?.map((values, key) => (
                            <p
                              className="w-full flex flex-row items-center gap-x-1"
                              key={key}
                            >
                              <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                                X:
                              </span>
                              <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                                {Math.round(values.x)}
                              </span>
                              <span className="w-[20%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                                Y:
                              </span>
                              <span className="w-[30%] p-2 border-2 border-bud-green text-metallic-brown rounded-lg">
                                {Math.round(values.y)}
                              </span>
                            </p>
                          ))}
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
          <Button
            disabled={
              state?.imageSelected?.url?.length <= 0 ||
              state.polygons?.length < 1
            }
            label="Continue"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => {
              startTransition(() => {
                navigate("/success");
              });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewData;
