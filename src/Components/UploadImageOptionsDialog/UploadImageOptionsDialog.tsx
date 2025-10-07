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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
          Choose options
        </h2>
      }
      resizable={false}
      draggable={false}
      dismissableMask={true}
      className={`${
        openCamera ? "h-[90dvh] sm:h-auto" : "h-auto"
      } w-full max-w-sm absolute bottom-0 md:bottom-auto !m-0 !border-0 !bg-white dark:!bg-black !rounded-3xl overflow-y-auto text-stone-700 dark:text-stone-300`}
      position={isSmallScreen ? "bottom" : "center"}
      maskClassName="backdrop-blur"
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full xs:max-w-[90%] flex flex-col flex-wrap justify-center items-center gap-y-1 font-content">
          <Button
            type="button"
            title="Click to browse system"
            className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-t-2xl !rounded-b-sm text-sm lg:text-base !text-white !bg-amber-800 dark:bg-amber-900 !border-0"
            onClick={() => uploadHandeler()}
          >
            <Upload size={16} />
            <span>Browse System</span>
          </Button>
          <Button
            type="button"
            title="Click to open camera"
            className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-b-2xl !rounded-t-sm text-sm lg:text-base !text-white !bg-amber-800 dark:bg-amber-900 !border-0"
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
          >
            <Camera size={16} />
            <span>Capture Image</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

export default UploadImageOptionsDialog;
