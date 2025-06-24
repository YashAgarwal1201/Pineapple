import { useEffect, useState } from "react";

import { Camera, Upload } from "lucide-react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";

import { UploadImageOptionsDialogType } from "../../Services/interfaces";
import { usePineappleStore } from "../../Services/zustand";

const UploadImageOptionsDialog = ({
  showOptions,
  setShowOptions,
  openCamera,
  setOpenCamera,
  uploadHandeler,
  onCaptureImageClick,
}: UploadImageOptionsDialogType) => {
  const { showToast } = usePineappleStore();

  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

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
        <h2 className="text-lg sm:text-xl md:text-2xl font-heading">
          Choose options
        </h2>
      }
      resizable={false}
      draggable={false}
      dismissableMask={true}
      className={`${
        openCamera ? "h-[90dvh] sm:h-auto" : "h-auto"
      } reusableDialog w-full md:w-2/3 lg:w-[500px] absolute bottom-0 md:bottom-auto !m-0`}
      position={isSmallScreen ? "bottom" : "center"}
      maskClassName="backdrop-blur"
    >
      <div className="pt-1 w-full h-full">
        <div className="w-full flex flex-row flex-wrap justify-center lg:justify-around items-center gap-x-2 gap-y-2 font-content">
          <Button
            type="button"
            icon={<Upload size={16} />}
            label="Browse System"
            title="Click to browse system"
            className="h-9 sm:h-10 px-10 text-sm sm:text-base flex items-center rounded-xl gap-2 text-naples-yellow bg-fern-green border-fern-green"
            onClick={() => uploadHandeler()}
          />
          <Button
            type="button"
            icon={<Camera size={16} />}
            label="Capture Image"
            title="Click to open camera"
            className="h-9 sm:h-10 px-10 text-sm sm:text-base flex items-center rounded-xl gap-2 text-naples-yellow bg-fern-green border-fern-green"
            onClick={() => {
              if (
                window?.location?.protocol === "https:" ||
                window?.location?.origin?.toLowerCase()?.includes("localhost")
              )
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
      </div>
    </Dialog>
  );
};

export default UploadImageOptionsDialog;
