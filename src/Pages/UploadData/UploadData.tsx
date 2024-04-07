import { startTransition, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../Services/AppContext";
import "./UploadData.scss";
import Layout from "../../Layout/Layout";
import UploadImageOptionsDialog from "../../Components/UploadImageOptionsDialog/UploadImageOptionsDialog";

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

        if (selectedFile.size > 1024 * 1024) {
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
            await setSelectedImage(
              selectedFile.name,
              base64Data,
              selectedFile.type
            );
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
        className={`h-full p-2 sm:p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
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
              <span className="text-lg sm:text-xl lg:text-2xl text-metallic-brown font-heading">
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
                  className="h-full w-auto rounded-md shadow-md"
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
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-x-5 gap-y-2 sm:gap-y-3 font-content">
          <Button
            disabled={state.imageSelected?.url === ""}
            icon="pi pi-trash"
            label="Remove Image"
            title="Click to remove the selected image"
            className="h-9 sm:h-10 text-sm sm:text-base text-naples-yellow bg-metallic-brown border-2 border-naples-yellow"
            onClick={() => removeHandeler()}
          />
          <Button
            disabled={state.imageSelected?.url === ""}
            icon="pi pi-check"
            label="Save & Continue"
            title="Click to save and continue"
            className="h-9 sm:h-10 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => saveAndContinueHandeler()}
          />
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
    </Layout>
  );
};

export default UploadData;
