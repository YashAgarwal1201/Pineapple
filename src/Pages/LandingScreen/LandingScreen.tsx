import { startTransition, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from "../../Services/AppContext";
// import "./UploadData.scss";
import Layout from "../../Layout/Layout";
import UploadImageOptionsDialog from "../../Components/UploadImageOptionsDialog/UploadImageOptionsDialog";
import { PROJECT_NAME } from "../../Services/constants";

const LandingScreen = () => {
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
        className={`h-full p-2 sm:p-3 m-3 grid grid-cols-1 mdl:grid-cols-2 bg-metallic-brown rounded-lg shadow-md transition-all duration-1000 transform overflow-auto ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col justify-end mdl:justify-center items-center">
          <img
            src={"./logo.svg"}
            alt=""
            className="max-w-[200px] mdl:max-w-[300px] lg:max-w-max aspect-auto"
          />
        </div>

        <div className="w-full  h-full px-2 flex flex-col justify-start mdl:justify-center items-center gap-y-10">
          <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-naples-yellow select-none">
            Welcome to Project {PROJECT_NAME}
          </h1>

          <Link
            title="Click to proceed"
            className="w-10 xs:w-11 md:w-12 lg:w-13 h-10 xs:h-11 md:h-12 lg:h-13 rounded-full flex justify-center items-center bg-fern-green text-naples-yellow border-none"
            to={"/upload-image"}
          >
            <span className="pi pi-chevron-right"></span>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default LandingScreen;
