import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import CaptureImageLibrary from "../CaptureImage/CaptureImage";
import { useAppContext } from "../../AppContext/AppContext";
import { UploadImageOptionsDialogType } from "../../Interface/interfaces";
import { useState, useEffect } from "react";

const UploadImageOptionsDialog = ({
  showOptions,
  setShowOptions,
  openCamera,
  setOpenCamera,
  uploadHandeler,
  onCaptureImageClick,
}: UploadImageOptionsDialogType) => {
  const { state, showToast } = useAppContext();
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768); // Adjust breakpoint as needed
    };
    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Dialog
      visible={showOptions}
      onHide={() => {
        setShowOptions(false);
        setOpenCamera(false);
      }}
      header={
        <div className="text-base md:text-lg lg:text-xl font-heading">Choose options</div>
      }
      draggable={false}
      className={`${
        openCamera ? "h-[90dvh] sm:h-auto" : "h-auto"
        } reusableDialog w-full md:w-2/3 lg:w-[500px] absolute bottom-0 md:bottom-auto !m-0`}
      position={isSmallScreen ? "bottom" : "center"}
      // contentClassName={`${openCamera ? "px-0" : "bg-black"}`}
    >
      <div className="pt-1 w-full h-full">
        {!openCamera ? (
          <div className="w-full flex flex-row flex-wrap justify-center lg:justify-around items-center gap-x-2 gap-y-2 font-content">
            <Button
              type="button"
              icon="pi pi-upload"
              label="Browse System"
              title="Click to browse system"
              className="h-9 sm:h-10 text-sm sm:text-base text-naples-yellow bg-fern-green border-fern-green"
              onClick={() => uploadHandeler()}
            />
            <Button
              type="button"
              icon="pi pi-camera"
              label="Capture Image"
              title="Click to open camera"
              className="h-9 sm:h-10 text-sm sm:text-base text-naples-yellow bg-fern-green border-fern-green"
              onClick={() => {
                if (window.location.protocol !== "https:")
                  onCaptureImageClick();
                else {
                  showToast(
                    "warn",
                    "Warning",
                    "Please use different method to attach file. Camera access is denied according to browser protocols in HTTP",
                    5000
                  );
                }
              }}
            />
          </div>
        ) : (
          <CaptureImageLibrary
            openCamera={openCamera}
            onCapture={() => setShowOptions(true)}
            exitCamera={() => setOpenCamera(false)}
            // acceptType={state?.isOptionSelected}
          />
        )}
      </div>
    </Dialog>
  );
};

export default UploadImageOptionsDialog;
