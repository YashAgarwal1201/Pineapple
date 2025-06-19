// import { useCallback, useEffect, useRef, useState } from "react";

// import { Camera, Check, RotateCcw, SwitchCamera } from "lucide-react";
// import { Button } from "primereact/button";
// import { Image } from "primereact/image";
// import Webcam from "react-webcam";

// // import { useAppContext } from "../../Services/AppContext";
// import { usePineappleStore } from "../../Services/zustand";

// const CaptureImageLibrary = ({ exitCamera, onCapture }) => {
//   // const { state, showToast, setSelectedImage } = useAppContext();
//   const state = usePineappleStore();
//   const { showToast, setSelectedImage } = state;

//   const webcamRef = useRef<Webcam>(null);
//   const webcamRefParent = useRef<HTMLDivElement | null>(null);
//   const stream = useRef<MediaStream | null>(null);

//   const [videoConstraints, setVideoConstraints] = useState<
//     MediaTrackConstraints | undefined
//   >();
//   const [numberOfCameras, setNumberOfCameras] = useState<number>(0);
//   const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
//   const [selectedAspectRatio, setSelectedAspectRatio] =
//     useState<string>("16:9");
//   const [showAspectRatioMenu, setShowAspectRatioMenu] =
//     useState<boolean>(false);

//   // Define aspect ratios
//   const aspectRatios = [
//     { label: "16:9", value: "16:9", ratio: 16 / 9 },
//     { label: "4:3", value: "4:3", ratio: 4 / 3 },
//     { label: "1:1", value: "1:1", ratio: 1 },
//     { label: "3:4", value: "3:4", ratio: 3 / 4 },
//     { label: "9:16", value: "9:16", ratio: 9 / 16 },
//     { label: "Full", value: "full", ratio: null },
//   ];

//   const getCurrentAspectRatio = () => {
//     return aspectRatios.find((ar) => ar.value === selectedAspectRatio);
//   };

//   const calculateDimensions = (
//     containerWidth: number,
//     containerHeight: number,
//     aspectRatio: number | null
//   ) => {
//     if (!aspectRatio) {
//       return { width: containerWidth, height: containerHeight };
//     }

//     const containerRatio = containerWidth / containerHeight;

//     if (containerRatio > aspectRatio) {
//       // Container is wider than desired aspect ratio
//       return {
//         width: containerHeight * aspectRatio,
//         height: containerHeight,
//       };
//     } else {
//       // Container is taller than desired aspect ratio
//       return {
//         width: containerWidth,
//         height: containerWidth / aspectRatio,
//       };
//     }
//   };

//   // useEffect(() => {
//   //   // const video = document.getElementById("video");
//   //   const video = webcamRefParent.current;
//   //   // console.log(video?.clientHeight);
//   //   setVideoConstraints({
//   //     width: video?.clientWidth || 1920,
//   //     height: video?.clientHeight || 1080,
//   //     facingMode: "environment",
//   //   });
//   //   calcNumberOfCamera();

//   //   if (webcamRef.current) {
//   //     webcamRef.current.video?.play();
//   //   }
//   // }, []);

//   useEffect(() => {
//     const video = webcamRefParent.current;
//     const currentAspectRatio = getCurrentAspectRatio();

//     let width = video?.clientWidth || 1920;
//     let height = video?.clientHeight || 1080;

//     if (currentAspectRatio?.ratio) {
//       const dimensions = calculateDimensions(
//         width,
//         height,
//         currentAspectRatio.ratio
//       );
//       width = dimensions.width;
//       height = dimensions.height;
//     }

//     setVideoConstraints({
//       width: width,
//       height: height,
//       facingMode: "environment",
//     });
//     calcNumberOfCamera();

//     if (webcamRef.current) {
//       webcamRef.current.video?.play();
//     }
//   }, [selectedAspectRatio]);

//   const capture = useCallback(async () => {
//     try {
//       if (webcamRef.current) {
//         const imageSrc = webcamRef.current.getScreenshot();
//         setSelectedImage(
//           "capturedImage", //selectedFile.name,
//           imageSrc as string, //URL.createObjectURL(imageSrc),
//           webcamRef?.current?.props?.screenshotFormat //selectedFile.type
//         );
//         setShowImagePreview(true);
//         showToast("success", "Success", "Image captured");
//       }
//     } catch (error) {
//       console.log(error);
//       showToast("error", "Error", "OOPS an error has occured with this method");
//     }
//   }, [webcamRef]);

//   const retakePhoto = () => {
//     setShowImagePreview(false);
//     // Clear the selected image if you want to reset it
//     // setSelectedImage("", "", "");
//   };

//   const confirmCapture = () => {
//     onCapture(false);
//     showToast("success", "Success", "Image confirmed and added");
//     // Optionally exit camera after confirmation
//     exitCamera();
//   };

//   const onBackButtonClick = () => {
//     if (showImagePreview) {
//       // If in preview mode, go back to camera
//       retakePhoto();
//     } else {
//       // If in camera mode, exit completely
//       if (stream?.current) {
//         const videoStream = stream.current;
//         videoStream?.getTracks()?.forEach(function (track) {
//           track?.stop();
//         });
//       }
//       stream.current = null;
//       exitCamera();
//     }
//   };

//   const flipCamera = () => {
//     if (videoConstraints) {
//       if (videoConstraints?.facingMode === "user") {
//         setVideoConstraints({
//           width: videoConstraints?.width || 1920,
//           height: videoConstraints?.height || 1080,
//           facingMode: "environment",
//         });
//       } else {
//         setVideoConstraints({
//           width: videoConstraints?.width || 1920,
//           height: videoConstraints?.height || 1080,
//           facingMode: "user",
//         });
//       }
//     }
//   };

//   const calcNumberOfCamera = () => {
//     navigator?.mediaDevices
//       ?.enumerateDevices()
//       ?.then((r) =>
//         setNumberOfCameras(r?.filter((i) => i.kind === "videoinput")?.length)
//       );
//   };

//   const getWebcamStyle = () => {
//     const currentAspectRatio = getCurrentAspectRatio();
//     if (!currentAspectRatio?.ratio) {
//       return {
//         border: "3px solid #A14712",
//         borderRadius: "8px",
//         width: "100%",
//         height: "100%",
//         objectFit: "cover" as const,
//       };
//     }

//     const container = webcamRefParent.current;
//     if (!container) {
//       return {
//         border: "3px solid #A14712",
//         borderRadius: "8px",
//         width: "100%",
//         height: "100%",
//         objectFit: "cover" as const,
//       };
//     }

//     const dimensions = calculateDimensions(
//       container.clientWidth,
//       container.clientHeight,
//       currentAspectRatio.ratio
//     );

//     return {
//       border: "3px solid #A14712",
//       borderRadius: "8px",
//       width: `${dimensions.width}px`,
//       height: `${dimensions.height}px`,
//       objectFit: "cover" as const,
//       margin: "auto",
//     };
//   };

//   return (
//     <div className="w-full h-full flex flex-col items-center gap-3">
//       {!showImagePreview && (
//         <div className="w-full flex justify-between items-center px-4 py-2">
//           <div className="flex items-center gap-2">
//             <Button
//               className="border-0 bg-transparent text-white p-1"
//               icon="pi pi-cog"
//               title="Aspect ratio"
//               rounded
//               size="small"
//               onClick={() => setShowAspectRatioMenu(!showAspectRatioMenu)}
//             />
//             <span className="text-white text-sm font-medium">
//               {selectedAspectRatio}
//             </span>
//           </div>

//           {showAspectRatioMenu && (
//             <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
//               <div className="grid grid-cols-3 gap-2">
//                 {aspectRatios.map((ratio) => (
//                   <Button
//                     key={ratio.value}
//                     className={`border-0 text-xs p-2 ${
//                       selectedAspectRatio === ratio.value
//                         ? "bg-fern-green text-naples-yellow"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                     label={ratio.label}
//                     onClick={() => {
//                       setSelectedAspectRatio(ratio.value);
//                       setShowAspectRatioMenu(false);
//                     }}
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       <div
//         className="h-full flex relative w-full rounded-lg"
//         id="video"
//         ref={webcamRefParent}
//       >
//         {showImagePreview && state.imageSelected.url !== "" ? (
//           <Image
//             src={state.imageSelected.url}
//             alt={"capture"}
//             className="flex-grow rounded-lg m-auto object-contain"
//             preview
//           />
//         ) : (
//           <Webcam
//             onLoad={() =>
//               showToast(
//                 "error",
//                 "Error",
//                 "Some error has occured with this method"
//               )
//             }
//             style={getWebcamStyle()}
//             audio={false}
//             ref={webcamRef}
//             screenshotFormat="image/png"
//             videoConstraints={videoConstraints}
//             mirrored={videoConstraints?.facingMode === "user"}
//           />
//         )}
//       </div>

//       <div className="h-fit w-full flex justify-center items-center gap-x-3 md:gap-x-5">
//         <Button
//           className="border-0 bg-fern-green text-naples-yellow ml-auto"
//           icon="pi pi-arrow-left"
//           title={showImagePreview ? "Retake photo" : "Go back"}
//           id="back-button"
//           rounded
//           onClick={() => onBackButtonClick()}
//         />

//         {showImagePreview ? (
//           // Preview mode buttons
//           <>
//             <Button
//               className="border-0 bg-fern-green text-naples-yellow"
//               icon={<RotateCcw size={16} />}
//               title="Retake photo"
//               id="retake-photo"
//               rounded
//               onClick={() => retakePhoto()}
//             />
//             <Button
//               className="border-0 bg-fern-green text-naples-yellow"
//               icon={<Check size={16} />}
//               title="Confirm photo"
//               id="confirm-photo"
//               rounded
//               onClick={() => confirmCapture()}
//             />
//           </>
//         ) : (
//           // Camera mode buttons
//           <>
//             <Button
//               className="border-0 bg-fern-green text-naples-yellow"
//               icon={<Camera size={16} />}
//               title="Take photo"
//               id="click-photo"
//               rounded
//               onClick={() => capture()}
//             />
//             <Button
//               className="border-0 bg-fern-green text-naples-yellow"
//               icon={<SwitchCamera size={16} />}
//               title="Flip camera"
//               id="flip-camera"
//               rounded
//               onClick={() => flipCamera()}
//               disabled={numberOfCameras <= 1}
//             />
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CaptureImageLibrary;
import { useCallback, useEffect, useRef, useState } from "react";

import { Camera, Check, RotateCcw, SwitchCamera } from "lucide-react";
import { Button } from "primereact/button";
// import { Dropdown } from "primereact/dropdown";
import { Image as PImage } from "primereact/image";
import Webcam from "react-webcam";

// import { useAppContext } from "../../Services/AppContext";
import { usePineappleStore } from "../../Services/zustand";

const CaptureImageLibrary = ({ exitCamera, onCapture }) => {
  // const { state, showToast, setSelectedImage } = useAppContext();
  const state = usePineappleStore();
  const { showToast, setSelectedImage } = state;

  const webcamRef = useRef<Webcam>(null);
  const webcamRefParent = useRef<HTMLDivElement | null>(null);
  const stream = useRef<MediaStream | null>(null);

  const [videoConstraints, setVideoConstraints] = useState<
    MediaTrackConstraints | undefined
  >();
  const [numberOfCameras, setNumberOfCameras] = useState<number>(0);
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState<string>("9:16");
  const [showAspectRatioMenu, setShowAspectRatioMenu] =
    useState<boolean>(false);

  // Define aspect ratios
  const aspectRatios = [
    { label: "16:9", value: "16:9", ratio: 16 / 9 },
    { label: "4:3", value: "4:3", ratio: 4 / 3 },
    { label: "1:1", value: "1:1", ratio: 1 },
    { label: "3:4", value: "3:4", ratio: 3 / 4 },
    { label: "9:16", value: "9:16", ratio: 9 / 16 },
    { label: "Full", value: "full", ratio: null },
  ];

  const getCurrentAspectRatio = () => {
    return aspectRatios.find((ar) => ar.value === selectedAspectRatio);
  };

  const calculateDimensions = (
    containerWidth: number,
    containerHeight: number,
    aspectRatio: number | null
  ) => {
    if (!aspectRatio) {
      return { width: containerWidth, height: containerHeight };
    }

    const containerRatio = containerWidth / containerHeight;

    if (containerRatio > aspectRatio) {
      // Container is wider than desired aspect ratio
      return {
        width: containerHeight * aspectRatio,
        height: containerHeight,
      };
    } else {
      // Container is taller than desired aspect ratio
      return {
        width: containerWidth,
        height: containerWidth / aspectRatio,
      };
    }
  };

  useEffect(() => {
    const video = webcamRefParent.current;
    const currentAspectRatio = getCurrentAspectRatio();

    let width = video?.clientWidth || 1920;
    let height = video?.clientHeight || 1080;

    if (currentAspectRatio?.ratio) {
      const dimensions = calculateDimensions(
        width,
        height,
        currentAspectRatio.ratio
      );
      width = dimensions.width;
      height = dimensions.height;
    }

    setVideoConstraints({
      width: width,
      height: height,
      facingMode: "environment",
    });
    calcNumberOfCamera();

    if (webcamRef.current) {
      webcamRef.current.video?.play();
    }
  }, [selectedAspectRatio]);

  const cropImageToAspectRatio = (
    imageSrc: string,
    aspectRatio: number | null
  ): Promise<string> => {
    return new Promise((resolve) => {
      if (!aspectRatio) {
        resolve(imageSrc);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        const imgWidth: number = img.width;
        const imgHeight: number = img.height;
        const imgAspectRatio: number = imgWidth / imgHeight;

        let cropWidth: number, cropHeight: number, cropX: number, cropY: number;

        if (imgAspectRatio > aspectRatio) {
          // Image is wider than target aspect ratio - crop width
          cropHeight = imgHeight;
          cropWidth = cropHeight * aspectRatio;
          cropX = (imgWidth - cropWidth) / 2;
          cropY = 0;
        } else {
          // Image is taller than target aspect ratio - crop height
          cropWidth = imgWidth;
          cropHeight = cropWidth / aspectRatio;
          cropX = 0;
          cropY = (imgHeight - cropHeight) / 2;
        }

        canvas.width = cropWidth;
        canvas.height = cropHeight;

        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          cropWidth,
          cropHeight
        );

        resolve(canvas.toDataURL("image/png"));
      };

      img.onerror = () => {
        resolve(imageSrc); // Fallback to original image if loading fails
      };

      img.src = imageSrc;
    });
  };

  const capture = useCallback(async () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        const currentAspectRatio = getCurrentAspectRatio();

        // Crop the image to match selected aspect ratio
        const croppedImageSrc = await cropImageToAspectRatio(
          imageSrc ?? "",
          currentAspectRatio?.ratio || null
        );

        setSelectedImage(
          "capturedImage",
          croppedImageSrc,
          webcamRef?.current?.props?.screenshotFormat
        );
        setShowImagePreview(true);
        showToast("success", "Success", "Image captured");
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Error", "OOPS an error has occured with this method");
    }
  }, [webcamRef, setSelectedImage, showToast, selectedAspectRatio]);

  const retakePhoto = () => {
    setShowImagePreview(false);
  };

  const confirmCapture = () => {
    onCapture(false);
    showToast("success", "Success", "Image confirmed and added");

    exitCamera();
  };

  const onBackButtonClick = () => {
    if (showImagePreview) {
      retakePhoto();
    } else {
      if (stream?.current) {
        const videoStream = stream.current;
        videoStream?.getTracks()?.forEach(function (track) {
          track?.stop();
        });
      }
      stream.current = null;
      exitCamera();
    }
  };

  const flipCamera = () => {
    if (videoConstraints) {
      const newFacingMode =
        videoConstraints?.facingMode === "user" ? "environment" : "user";

      setVideoConstraints({
        width: videoConstraints?.width || 1920,
        height: videoConstraints?.height || 1080,
        facingMode: newFacingMode,
      });
    }
  };

  const calcNumberOfCamera = () => {
    navigator?.mediaDevices
      ?.enumerateDevices()
      ?.then((r) =>
        setNumberOfCameras(r?.filter((i) => i.kind === "videoinput")?.length)
      );
  };

  const getWebcamStyle = () => {
    const currentAspectRatio = getCurrentAspectRatio();
    if (!currentAspectRatio?.ratio) {
      return {
        border: "3px solid #A14712",
        borderRadius: "8px",
        width: "100%",
        height: "100%",
        objectFit: "cover" as const,
      };
    }

    const container = webcamRefParent.current;
    if (!container) {
      return {
        border: "3px solid #A14712",
        borderRadius: "8px",
        width: "100%",
        height: "100%",
        objectFit: "cover" as const,
      };
    }

    const dimensions = calculateDimensions(
      container.clientWidth,
      container.clientHeight,
      currentAspectRatio.ratio
    );

    return {
      border: "3px solid #A14712",
      borderRadius: "8px",
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      objectFit: "cover" as const,
      margin: "auto",
    };
  };

  return (
    <div className="w-full h-full flex flex-col items-center gap-3">
      {/* Aspect Ratio Selector - Only show in camera mode */}
      {!showImagePreview && (
        <div className="w-full flex justify-between items-center px-4 py-2">
          <div className="flex items-center gap-2">
            <Button
              className="border-0 bg-transparent text-white p-1"
              icon="pi pi-cog"
              title="Aspect ratio"
              rounded
              size="small"
              onClick={() => setShowAspectRatioMenu(!showAspectRatioMenu)}
            />
            <span className="text-white text-sm font-medium">
              {selectedAspectRatio}
            </span>
          </div>

          {showAspectRatioMenu && (
            <div className="absolute top-16 left-4 z-10 bg-white rounded-lg shadow-lg p-2">
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ratio) => (
                  <Button
                    key={ratio.value}
                    className={`border-0 text-xs p-2 ${
                      selectedAspectRatio === ratio.value
                        ? "bg-fern-green text-naples-yellow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    label={ratio.label}
                    onClick={() => {
                      setSelectedAspectRatio(ratio.value);
                      setShowAspectRatioMenu(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className="h-full flex relative w-full rounded-lg justify-center items-center"
        id="video"
        ref={webcamRefParent}
      >
        {showImagePreview && state.imageSelected.url !== "" ? (
          <PImage
            src={state.imageSelected.url}
            alt={"capture"}
            className="flex-grow rounded-lg m-auto object-contain max-w-full max-h-full"
            preview
          />
        ) : (
          <Webcam
            onLoad={() =>
              showToast(
                "error",
                "Error",
                "Some error has occured with this method"
              )
            }
            style={getWebcamStyle()}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/png"
            videoConstraints={videoConstraints}
            mirrored={videoConstraints?.facingMode === "user"}
          />
        )}

        {/* Aspect ratio overlay guides */}
        {!showImagePreview && selectedAspectRatio !== "full" && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="border-2 border-white border-opacity-30 rounded-lg"
                style={{
                  width: `${getWebcamStyle().width}`,
                  height: `${getWebcamStyle().height}`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="h-fit w-full flex justify-center items-center gap-x-3 md:gap-x-5">
        <Button
          className="border-0 bg-fern-green text-naples-yellow ml-auto"
          icon="pi pi-arrow-left"
          title={showImagePreview ? "Retake photo" : "Go back"}
          id="back-button"
          rounded
          onClick={() => onBackButtonClick()}
        />

        {showImagePreview ? (
          // Preview mode buttons
          <>
            <Button
              className="border-0 bg-fern-green text-naples-yellow"
              icon={<RotateCcw size={16} />}
              title="Retake photo"
              id="retake-photo"
              rounded
              onClick={() => retakePhoto()}
            />
            <Button
              className="border-0 bg-fern-green text-naples-yellow"
              icon={<Check size={16} />}
              title="Confirm photo"
              id="confirm-photo"
              rounded
              onClick={() => confirmCapture()}
            />
          </>
        ) : (
          // Camera mode buttons
          <>
            <Button
              className="border-0 bg-fern-green text-naples-yellow"
              icon={<Camera size={16} />}
              title="Take photo"
              id="click-photo"
              rounded
              onClick={() => capture()}
            />
            <Button
              className="border-0 bg-fern-green text-naples-yellow mr-auto"
              icon={<SwitchCamera size={16} />}
              title="Flip camera"
              id="flip-camera"
              rounded
              onClick={() => flipCamera()}
              disabled={numberOfCameras <= 1}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default CaptureImageLibrary;
