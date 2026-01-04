// src/Pages/UploadData/UploadData.tsx
import { startTransition, useEffect, useState } from "react";

import { Check, Trash } from "lucide-react";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";

import CaptureImageLibrary from "../../Components/CaptureImage/CaptureImage";
import UploadImageOptionsDialog from "../../Components/UploadImageOptionsDialog/UploadImageOptionsDialog";
import Layout from "../../Layout/Layout";
import { usePineappleStore } from "../../Services/zustand";

const UploadData = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();
  const { showToast, setSelectedImage, setPolygons } = state;

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const uploadHandeler = () => {
    const input = document.createElement("input");

    input.setAttribute("accept", "image/*");
    input.type = "file";

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const selectedFile = input.files[0];

        if (selectedFile.size > 2048 * 2048) {
          showToast(
            "error",
            "Error",
            "Please select an image smaller than 1MB"
          );
          return;
        }

        if (selectedFile?.type?.includes("image")) {
          // await setSelectedImage(
          // 	selectedFile.name, // Set the image title to the file name
          // 	URL.createObjectURL(selectedFile),
          // 	selectedFile.type
          // );
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Data = e.target?.result as string; // Base64-encoded image data
            setSelectedImage(selectedFile.name, base64Data, selectedFile.type);
            showToast(
              "success",
              "Success",
              "Rack image uploaded successfully!"
            );
            if (state.polygons?.length > 0) setPolygons([]);
          };
          reader.readAsDataURL(selectedFile);
        } else {
          showToast(
            "error",
            "Error",
            "Either wrong file is selected or there's some issue"
          );
        }
        setShowOptions(false);
      }
    };
    input.click();
  };

  const removeHandeler = () => {
    showToast("warn", "Warning", "Image removed");
    setSelectedImage("", "", "");
    if (state.polygons?.length > 0) setPolygons([]);
  };

  const saveAndContinueHandeler = () => {
    if (state.imageSelected?.url !== "") {
      showToast("success", "Success", "Data saved");
      startTransition(() => {
        navigate("/draw");
      });
    }
  };

  const onCaptureImageClick = () => {
    setOpenCamera(true);
  };

  return (
    <Layout>
      <div
        className={`h-full p-2 sm:p-4 flex flex-col justify-around items-center bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5">
          <div className="px-2 md:px-0 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
                Upload an image
              </h1>
              <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
                Choose an image of size less than 1MB
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-y-10 my-auto">
            <div
              className="w-60 sm:w-64 md:w-72 lg:w-96 aspect-square p-3 border border-dashed border-stone-200 dark:border-stone-700 rounded-3xl cursor-pointer"
              onClick={() => {
                if (state.imageSelected?.url === "") setShowOptions(true);
              }}
            >
              <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 bg-naples-yellow rounded-2xl">
                <div className="h-2/5 flex flex-col justify-center items-center gap-y-2">
                  {state.imageSelected.url === "" && (
                    <span className="w-fit pi pi-image p-4 text-4xl text-metallic-brown bg-bud-green rounded-md"></span>
                  )}
                  <h2 className="text-lg sm:text-xl md:text-2xl text-metallic-brown font-heading">
                    {state.imageSelected?.url === ""
                      ? "Upload Image"
                      : "Selected Image"}
                  </h2>
                </div>
                {state.imageSelected?.url !== "" && (
                  <div className="h-3/5 p-2 relative">
                    <Image
                      src={state.imageSelected.url}
                      alt="selected file"
                      preview
                      className="max-h-[200px] h-full object-cover rounded-md shadow-md *:h-full"
                    />
                    <Button
                      icon="pi pi-sync"
                      rounded
                      className="absolute top-0.5 right-0.5 !w-[16px] !h-[16px] !p-[12px] bg-metallic-brown text-naples-yellow !text-xs border xs:border border-naples-yellow font-content"
                      type="button"
                      title="Click to change the image"
                      onClick={() => {
                        if (state.imageSelected.url) setShowOptions(true);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="w-full grid sm:flex flex-col xs:flex-row flex-wrap justify-center items-center gap-x-0 xs:gap-x-3 lg:gap-x-5 gap-y-2 font-content">
              <Button
                disabled={state.imageSelected?.url === ""}
                icon={<Trash size={16} />}
                label="Remove Image"
                title="Click to remove the selected image"
                className="w-full sm:w-auto h-9 sm:h-10 px-10 flex items-center gap-2 !rounded-2xl text-sm sm:text-base !bg-transparent !border-amber-400 !text-amber-400 hover:!bg-amber-100 dark:!border-amber-500 dark:!text-amber-500 dark:hover:!bg-amber-900"
                onClick={() => removeHandeler()}
              />
              <Button
                disabled={state.imageSelected?.url === ""}
                icon={<Check size={16} />}
                label="Save & Continue"
                title="Click to save and continue"
                className="w-full sm:w-auto h-9 sm:h-10 px-10 flex items-center gap-2 !border-none !rounded-2xl text-sm sm:text-base !bg-amber-400 hover:!bg-amber-500 !text-stone-900 dark:!bg-amber-500 dark:hover:!bg-amber-600 dark:!text-stone-900"
                onClick={() => saveAndContinueHandeler()}
              />
            </div>
          </div>
        </div>
      </div>

      <UploadImageOptionsDialog
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        openCamera={openCamera}
        setOpenCamera={setOpenCamera}
        uploadHandeler={uploadHandeler}
        onCaptureImageClick={onCaptureImageClick}
      />

      <Sidebar
        visible={openCamera}
        onHide={() => setOpenCamera(false)}
        dismissable={true}
        maskClassName="backdrop-blur"
        position="right"
        closeIcon={
          <span className="pi pi-times text-metallic-brown bg-naples-yellow w-10 h-10 flex justify-center items-center"></span>
        }
        className="polygon-list-sidebar side-menu !rounded-none md:!rounded-l-3xl !bg-white dark:!bg-black aboutDialog !w-full md:!w-[768px]"
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
            Capture Image
          </h2>
        }
      >
        <CaptureImageLibrary
          onCapture={() => setShowOptions(true)}
          exitCamera={() => setOpenCamera(false)}
        />
      </Sidebar>
    </Layout>
  );
};

export default UploadData;
