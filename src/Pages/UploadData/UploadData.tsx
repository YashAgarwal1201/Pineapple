import { startTransition, useEffect, useState } from "react";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import UploadImageOptionsDialog from "../../Components/UploadImageOptionsDialog/UploadImageOptionsDialog";
import Layout from "../../Layout/Layout";
import { useAppContext } from "../../Services/AppContext";
import "./UploadData.scss";

const UploadData = () => {
  const navigate = useNavigate();
  const { state, showToast, setSelectedImage, setPolygons } = useAppContext();
  const [showOptions, setShowOptions] = useState(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [showContent, setShowContent] = useState(false);

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

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Layout>
      <div
        className={`h-full p-2 sm:p-3 my-3 mx-0 sm:mx-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="w-full h-full flex flex-col gap-y-3 md:gap-y-5">
          <div className="px-2 md:px-0 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <span className="text-lg md:text-xl font-heading text-naples-yellow">
                Upload an image
              </span>
              <span className="text-sm md:text-base text-bud-green font-content font-medium">
                Choose an image of size less than 1MB
              </span>
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-y-10 my-auto">
            <div
              className="w-60 sm:w-64 md:w-72 lg:w-96 aspect-square p-3 border-2 border-dashed border-naples-yellow rounded-lg cursor-pointer"
              onClick={() => {
                if (state.imageSelected?.url === "") setShowOptions(true);
              }}
            >
              <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 bg-naples-yellow rounded-md">
                <div className="h-2/5 flex flex-col justify-center items-center">
                  {state.imageSelected.url === "" && (
                    <span className="w-fit pi pi-image p-4 text-4xl text-metallic-brown bg-bud-green rounded-md"></span>
                  )}
                  <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-metallic-brown font-heading">
                    {state.imageSelected?.url === ""
                      ? "Upload Image"
                      : "Selected Image"}
                  </span>
                </div>
                {state.imageSelected?.url !== "" && (
                  <div className="h-3/5 p-2 relative">
                    <img
                      src={state.imageSelected.url}
                      alt="selected file"
                      className="max-h-[200px] h-full object-cover rounded-md shadow-md"
                    />
                    <Button
                      icon="pi pi-sync"
                      rounded
                      className="absolute top-0.5 right-0.5 !w-[16px] !h-[16px] !p-[12px] bg-metallic-brown text-naples-yellow !text-xs border-2 border-naples-yellow font-content"
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
                icon="pi pi-trash"
                label="Remove Image"
                title="Click to remove the selected image"
                className="w-full sm:w-auto h-9 sm:h-10 px-10 text-sm sm:text-base text-naples-yellow bg-metallic-brown border-2 border-naples-yellow"
                onClick={() => removeHandeler()}
              />
              <Button
                disabled={state.imageSelected?.url === ""}
                icon="pi pi-check"
                label="Save & Continue"
                title="Click to save and continue"
                className="w-full sm:w-auto h-9 sm:h-10 px-10 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
                onClick={() => saveAndContinueHandeler()}
              />
            </div>
          </div>
        </div>

        {/* <div className="w-full mdl:w-1/2 h-1/3 mdl:h-full px-2 flex flex-col justify-center items-center gap-y-10">
          <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-naples-yellow select-none">
            Welcome to Project {PROJECT_NAME}
          </h1>
        </div> */}
      </div>

      <UploadImageOptionsDialog
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        openCamera={openCamera}
        setOpenCamera={setOpenCamera}
        uploadHandeler={uploadHandeler}
        onCaptureImageClick={onCaptureImageClick}
      />
    </Layout>
  );
};

export default UploadData;
