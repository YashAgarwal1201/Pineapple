import { startTransition, useEffect, useState } from "react";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { useAppContext } from "../../Services/AppContext";
import { downloadPolygonsData } from "../../Services/functionServices";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { state, showToast, setSelectedImage, setPolygons, dispatch } =
    useAppContext();

  const [loader, setLoader] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const clearSessionStorageAndNavigate = async () => {
    try {
      setPolygons([]);
      setSelectedImage("", "", "");
      dispatch({ type: "SET_CHANGE_ANNOTATION_OPTION", payload: "" });
      dispatch({ type: "SET_APPROVED_IMAGE_URL", payload: "" });
      dispatch({ type: "SET_PROCESSED_IMAGE_URL", payload: "" });
      dispatch({ type: "SET_JSON_FILE_DOWNLOAD_URL", payload: "" });

      sessionStorage.removeItem("pineappleState");
      showToast("info", "Info", "Redirecting you to the home page");
      setTimeout(() => {
        startTransition(() => {
          navigate("/");
        });
      }, 2000);
    } catch (error) {
      console.error("Error clearing sessionStorage:", error);
    }
  };

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Layout>
      <div
        className={`h-full p-3 m-3 flex flex-col md:flex-row justify-center items-center gap-y-10 md:gap-y-auto text-naples-yellow bg-metallic-brown rounded-lg shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 md:translate-x-0 opacity-100"
            : "-translate-y-0 md:-translate-x-full opacity-0"
        }`}
      >
        <div className="w-full md:w-1/2 h-auto md:h-full flex justify-center items-center">
          <div className="p-5 md:p-7 bg-transparent border-2 border-dashed border-fern-green rounded-full">
            <span className="pi pi-check p-7 md:p-10 text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-naples-yellow bg-fern-green rounded-full"></span>
          </div>
        </div>
        <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center items-center gap-y-10">
          <p className="text-center text-lg md:text-2xl lg:text-3xl font-heading">
            Thank you for using this product
          </p>
          <div
            className={`w-full hidden md:flex flex-row justify-center items-center gap-x-4`}
          >
            <Button
              loading={loader}
              icon="pi pi-times"
              label="Close"
              className="h-10 text-naples-yellow bg-transparent border-2 border-naples-yellow"
              onClick={async () => {
                setLoader(true);
                await clearSessionStorageAndNavigate();
              }}
            />
            <Button
              disabled={state.polygons.length < 1}
              icon="pi pi-download"
              label="Download data"
              className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
              onClick={() => downloadPolygonsData(state.polygons)}
            />
          </div>
        </div>
      </div>
      <div
        className={`w-full p-2 flex md:hidden justify-center items-center gap-x-4 font-content sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl drop-shadow-top drop-shadow-right transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <Button
          loading={loader}
          icon="pi pi-times"
          label="Close"
          className="h-9 sm:h-10 text-sm sm:text-base text-naples-yellow bg-transparent border-2 border-naples-yellow"
          onClick={async () => {
            setLoader(true);
            await clearSessionStorageAndNavigate();
          }}
        />
        <Button
          disabled={state.polygons.length < 1}
          icon="pi pi-download"
          label="Download data"
          className="h-9 sm:h-10 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
          onClick={() => downloadPolygonsData(state.polygons)}
        />
      </div>
    </Layout>
  );
};

export default SuccessPage;
