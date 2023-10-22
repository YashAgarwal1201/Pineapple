import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useAppContext } from "./../../AppContext/AppContext";
import { Button } from "primereact/button";

export default function CaptureImageLibrary({
  openCamera,
  exitCamera,
  acceptType,
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
            "rackImage", //selectedFile.name,
            imageSrc as string, //URL.createObjectURL(imageSrc),
            webcamRef?.current?.props?.screenshotFormat //selectedFile.type
          );
          exitCamera();
          onCapture(!openCamera);
          showToast("success", "Success", "Image captured and added");
        // }
        // setShowImagePreview(true);
      }
    } catch {
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
  };

  useEffect(() => {
    const video = document.getElementById("video") as HTMLVideoElement;
    setVideoConstraints({
      width: video?.width || 1280,
      height: video?.height || 720,
      facingMode: "environment",
    });
    calcNumberOfCamera();
  }, []);

  const flipCamera = () => {
    if (videoConstraints) {
      if (videoConstraints?.facingMode === "user") {
        setVideoConstraints({
          width: videoConstraints?.width || 1280,
          height: videoConstraints?.height || 720,
          facingMode: "environment",
        });
      } else {
        setVideoConstraints({
          width: videoConstraints?.width || 1280,
          height: videoConstraints?.height || 720,
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
    <>
      {/* <Dialog visible={props?.openCamera} draggable={false} onHide={props?.exitCamera} className="h-[100vh] w-[100vw] md:w-[50vw] lg:w-[40vw]"> */}
      {
        // showImagePreview ? image &&
        //   <ImagePreview imgSrc={[image]} setShowImagePreview={() => resetPreview()}/>
        // :
        <div className="w-full h-full flex flex-col justify-center items-center gap-3">
          <div className="h-[80%] relative w-full rounded-2xl">
            <Webcam
              id="video"
              onLoad={() => showToast("error", "Error", "ERROR")}
              style={{
                border: "2px solid [#3C5164]",
                borderRadius: "16px",
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
              className="border-0 bg-[#3779B1] text-[#FFFFFF] rounded-full"
              icon="pi pi-arrow-left"
              title="Back"
              id="back-button"
              onClick={() => onBackButtonClick()}
            />
            <Button
              className="border-0 bg-[#3779B1] text-[#FFFFFF] rounded-full"
              icon="pi pi-camera"
              title="Click Photo"
              id="click-photo"
              onClick={() => capture()}
            />
            <Button
              className="border-0 bg-[#3779B1] text-[#FFFFFF] rounded-full"
              icon="pi pi-sync"
              title="Flip camera"
              id="flip-camera"
              onClick={() => flipCamera()}
              disabled={numberOfCameras <= 1}
            />
          </div>
        </div>
      }
      {/* </Dialog> */}
    </>
  );
}
