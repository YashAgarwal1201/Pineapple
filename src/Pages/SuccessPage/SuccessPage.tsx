import { useEffect, useState } from "react";

import { Button } from "primereact/button";
// import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { useAppContext } from "../../Services/AppContext";
import { downloadPolygonsData } from "../../Services/functionServices";

import "./SuccessPage.scss";

const SuccessPage = () => {
  // const navigate = useNavigate();
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
        // startTransition(() => {
        //   navigate("/");
        // });

        window.history.go(-4);
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
        } relative`}
      >
        <Button
          icon="pi pi-angle-left"
          title="go back button"
          rounded
          className={` absolute top-3 left-3 text-naples-yellow bg-fern-green border-0`}
          onClick={() => window.history.go(-1)}
        />
        <div className="w-full md:w-1/2 h-auto md:h-full flex justify-center items-center relative">
          <img src={"./logo.svg"} alt="" />
          <div className="absolute right-20">
            <div className="p-5 md:p-7 bg-transparent rounded-full relative">
              <span className="success-check pi pi-check w-12 h-12 flex justify-center items-center z-10 text-naples-yellow bg-fern-green rounded-full"></span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-dashed border-fern-green rounded-full animate-spin duration-5000"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center items-center gap-y-10">
          <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-naples-yellow select-none">
            <span className="text-bud-green">Thank you for using</span> Project
            Pineapple
          </h1>
          <div className="w-full flex flex-row justify-center items-center gap-x-3 lg:gap-x-5 gap-y-2 font-content">
            {/* <Button
              icon="pi pi-angle-left"
              title="go back button"
              rounded
              className={` text-naples-yellow bg-fern-green border-0`}
              onClick={() => window.history.go(-1)}
            /> */}
            <Button
              loading={loader}
              icon="pi pi-times"
              title="Close & Restart"
              rounded
              className=" text-sm sm:text-base text-naples-yellow bg-transparent border-2 border-naples-yellow"
              onClick={async () => {
                setLoader(true);
                await clearSessionStorageAndNavigate();
              }}
            />
            <Button
              disabled={state.polygons.length < 1 || loader}
              icon="pi pi-download"
              title="Download data"
              rounded
              className=" text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
              onClick={() => downloadPolygonsData(state.polygons)}
            />
            {!loader ? (
              <a
                title="check developer profile"
                href={"https://yashagarwal1201.github.io/"}
                target="_blank"
                className="w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-naples-yellow text-metallic-brown border-0 rounded-full"
              >
                <span className="pi pi-user text-sm"></span>
              </a>
            ) : (
              <div className="w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-naples-yellow text-metallic-brown border-0 rounded-full opacity-50 cursor-not-allowed">
                <span className="pi pi-user text-sm"></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SuccessPage;
