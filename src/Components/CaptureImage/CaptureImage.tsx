import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAppContext } from "../../Services/AppContext";
import { Button } from "primereact/button";

export default function CaptureImageLibrary({
  // openCamera,
  exitCamera,
  // acceptType,
  onCapture,
}: {
  openCamera: boolean;
  exitCamera: () => void;
  acceptType?: string;
  onCapture: any;
}) {
  const { showToast, setSelectedImage } = useAppContext();
  // const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const capture = React.useCallback(async () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        // if (acceptType === "rackImage") {
        setSelectedImage(
          "capturedImage", //selectedFile.name,
          imageSrc as string, //URL.createObjectURL(imageSrc),
          webcamRef?.current?.props?.screenshotFormat //selectedFile.type
        );
        exitCamera();
        onCapture(false);
        showToast("success", "Success", "Image captured and added");
        // }
        // setShowImagePreview(true);
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Error", "OOPS an error has occured with this method");
    }
  }, [webcamRef]);

  const stream = useRef<MediaStream | null>(null);

  const [videoConstraints, setVideoConstraints] = useState<
    MediaTrackConstraints | undefined
  >();
  const [numberOfCameras, setNumberOfCameras] = useState<number>(0);

  const onBackButtonClick = () => {
    if (stream?.current) {
      const videoStream = stream.current;
      videoStream?.getTracks()?.forEach(function (track) {
        track?.stop();
      });
    }
    stream.current = null;
    exitCamera();
    // onCapture();
  };

  useEffect(() => {
    const video = document.getElementById("video");
    console.log(video?.clientWidth)
    setVideoConstraints({
      width: video?.clientWidth || 1920,
      height: video?.clientHeight || 1080,
      facingMode: "environment",
    });
    calcNumberOfCamera();
  }, []);

  const flipCamera = () => {
    console.log(videoConstraints);
    if (videoConstraints) {
      if (videoConstraints?.facingMode === "user") {
        setVideoConstraints({
          width: videoConstraints?.width || 1920,
          height: videoConstraints?.height || 1080,
          facingMode: "environment",
        });
      } else {
        setVideoConstraints({
          width: videoConstraints?.width || 1920,
          height: videoConstraints?.height || 1080,
          facingMode: "user",
        });
      }
    }
  };

  const calcNumberOfCamera = () => {
    navigator?.mediaDevices
      ?.enumerateDevices()
      ?.then((r) =>
        setNumberOfCameras(r?.filter((i) => i.kind === "videoinput")?.length)
      );
  };
  return (
    <div className="w-full h-full flex flex-col items-center gap-3">
      <div className="h-[80%] flex relative w-full rounded-lg" id="video">
        <Webcam
          
          onLoad={() =>
            showToast(
              "error",
              "Error",
              "Some error has occured with this method"
            )
          }
          style={{
            // border: "2px solid #3C5164",
            borderRadius: "8px",
            width: "100%",
            height: "100%",
          }}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          mirrored={videoConstraints?.facingMode === "user"}
        />
      </div>
      <div className="h-[20%] w-full flex justify-center items-center gap-10">
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-arrow-left"
          title="Go back"
          id="back-button"
          onClick={() => onBackButtonClick()}
        />
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-camera"
          title="Take photo"
          id="click-photo"
          onClick={() => capture()}
        />
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-sync"
          title="Flip camera"
          id="flip-camera"
          onClick={() => flipCamera()}
          disabled={numberOfCameras <= 1}
        />
      </div>
    </div>
  );
}
