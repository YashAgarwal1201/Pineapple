import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "primereact/button";
import { Image } from "primereact/image";
import Webcam from "react-webcam";

import { useAppContext } from "../../Services/AppContext";

const CaptureImageLibrary = ({
  // openCamera,
  exitCamera,
  // acceptType,
  onCapture,
}: {
  openCamera: boolean;
  exitCamera: () => void;
  acceptType?: string;
  onCapture: any;
}) => {
  const { state, showToast, setSelectedImage } = useAppContext();
  const [showImagePreview, setShowImagePreview] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const stream = useRef<MediaStream | null>(null);

  const [videoConstraints, setVideoConstraints] = useState<
    MediaTrackConstraints | undefined
  >();
  const [numberOfCameras, setNumberOfCameras] = useState<number>(0);

  useEffect(() => {
    const video = document.getElementById("video");
    // console.log(video?.clientHeight);
    setVideoConstraints({
      width: video?.clientWidth || 1920,
      height: video?.clientHeight || 1080,
      facingMode: "environment",
    });
    calcNumberOfCamera();
  }, []);

  const capture = useCallback(async () => {
    try {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        // if (acceptType === "rackImage") {
        setSelectedImage(
          "capturedImage", //selectedFile.name,
          imageSrc as string, //URL.createObjectURL(imageSrc),
          webcamRef?.current?.props?.screenshotFormat //selectedFile.type
        );
        // exitCamera();
        onCapture(false);
        showToast("success", "Success", "Image captured and added");
        // }
        setShowImagePreview(true);
      }
    } catch (error) {
      console.log(error);
      showToast("error", "Error", "OOPS an error has occured with this method");
    }
  }, [webcamRef]);

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

  const flipCamera = () => {
    // console.log(videoConstraints);
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
      <div className="h-full flex relative w-full rounded-lg" id="video">
        <Webcam
          onLoad={() =>
            showToast(
              "error",
              "Error",
              "Some error has occured with this method"
            )
          }
          style={{
            border: "3px solid #A14712",
            borderRadius: "8px",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/png"
          videoConstraints={videoConstraints}
          mirrored={videoConstraints?.facingMode === "user"}
        />
      </div>
      <div className="h-fit w-full flex justify-center items-center gap-x-3 md:gap-x-5">
        {showImagePreview || state.imageSelected.url !== "" ? (
          <Image
            src={state.imageSelected.url}
            alt={"capture"}
            className="w-12 h-12 rounded-full *:w-full *:h-full *:rounded-full mr-auto"
            preview
          />
        ) : (
          ""
        )}
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-arrow-left"
          title="Go back"
          id="back-button"
          rounded
          onClick={() => onBackButtonClick()}
        />
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-camera"
          title="Take photo"
          id="click-photo"
          rounded
          onClick={() => capture()}
        />
        <Button
          className="border-0 bg-fern-green text-naples-yellow"
          icon="pi pi-sync"
          title="Flip camera"
          id="flip-camera"
          rounded
          onClick={() => flipCamera()}
          disabled={numberOfCameras <= 1}
        />
      </div>
    </div>
  );
};

export default CaptureImageLibrary;
