import { startTransition, useEffect, useState } from "react";

import { Download, RefreshCcw } from "lucide-react";
import { Button } from "primereact/button";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";
import { downloadPolygonsData } from "../../Services/functionServices";
import "./SuccessPage.scss";
import { usePineappleStore } from "../../Services/zustand";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

const SuccessPage = () => {
  const navigate = useNavigate();

  const {
    imageSelected,
    annotatedCanvasImage,
    polygons,
    setAnnotatedCanvasImage,
    setPolygons,
    setSelectedImage,
    showToast,
  } = usePineappleStore();

  const [loader, setLoader] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    if (imageSelected.url === "" || polygons.length < 1) {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
  }, []);

  const clearSessionStorageAndNavigate = async () => {
    try {
      setPolygons([]);
      setAnnotatedCanvasImage(null);
      setSelectedImage("", "", "");
      setPolygons([]);

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
      {loading ? (
        <div className="w-full h-full p-3 flex flex-col justify-center items-center gap-y-3">
          <Lottie
            loop
            animationData={loadingDotsAnimation}
            play
            className="w-1/2 h-fit"
          />
          <p className="font-heading text-xl sm:text-2xl text-center text-metallic-brown">
            No data found. Navigating to home page.
          </p>
        </div>
      ) : (
        <div
          className={`h-full p-3 flex flex-col md:flex-row justify-center items-center gap-y-10 md:gap-y-auto text-naples-yellow bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md transition-all duration-1000 transform ${
            showContent
              ? "translate-y-0 md:translate-x-0 opacity-100"
              : "-translate-y-0 md:-translate-x-full opacity-0"
          } relative`}
        >
          {/* <Button
            icon={<ArrowLeft size={20} />}
            title="go back button"
            className={`aspect-square !absolute top-3 left-3 !bg-amber-400 hover:!bg-amber-500 !text-stone-900 dark:!bg-amber-500 dark:hover:!bg-amber-600 dark:!text-stone-900 !border-0 !rounded-full`}
            onClick={() => window.history.go(-1)}
          /> */}
          <div className="w-full md:w-1/2 h-auto md:h-full flex justify-center items-center">
            <div className="w-[300px] sm:w-[350px] h-[300px] sm:h-[350px] relative">
              <img
                src={"./logo.svg"}
                alt=""
                className="w-full h-full object-contain"
              />
              <div className="!absolute right-16 top-28 sm:top-32">
                <div className="p-5 md:p-7 bg-transparent rounded-full relative">
                  <span className="success-check pi pi-check w-12 h-12 flex justify-center items-center z-10 text-naples-yellow bg-fern-green rounded-full"></span>
                  <div className="!absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border border-dashed border-fern-green rounded-full animate-spin duration-5000"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center items-center gap-y-10">
            <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-naples-yellow select-none">
              <span className="text-bud-green">Thank you for using</span>{" "}
              Project Pineapple
            </h1>
            <div className="w-full flex flex-row flex-wrap justify-center items-center gap-x-3 lg:gap-x-5 gap-y-2 font-content">
              {/* <Button
              icon="pi pi-angle-left"
              title="go back button"
              rounded
              className={` text-naples-yellow bg-fern-green border-0`}
              onClick={() => window.history.go(-1)}
            /> */}
              <Button
                loading={loader}
                // icon="pi pi-times"
                // title="Close & Restart"
                rounded
                className="flex-shrink-0 text-sm sm:text-base text-naples-yellow bg-transparent border xs:border flex items-center gap-x-2 border-naples-yellow !font-content"
                onClick={async () => {
                  setLoader(true);
                  await clearSessionStorageAndNavigate();
                }}
              >
                <RefreshCcw size={20} />
                <span>Start again</span>
              </Button>
              <Button
                disabled={polygons.length < 1 || loader}
                rounded
                className="flex-shrink-0 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow flex items-center gap-x-2  !font-content"
                onClick={() => {
                  console.log("Download data", polygons, annotatedCanvasImage);
                  downloadPolygonsData(
                    polygons,
                    annotatedCanvasImage,
                    showToast
                  );
                }}
              >
                <Download size={20} />
                <span>Download data</span>
              </Button>
              {/* {!loader ? (
                <a
                  title="check developer profile"
                  href={"https://yashagarwal1201.github.io/"}
                  rel="noopener noreferrer nofollow"
                  target="_blank"
                  className="w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-naples-yellow text-metallic-brown border-0 rounded-full"
                >
                  <span className="pi pi-user text-sm"></span>
                </a>
              ) : (
                <div className="w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-naples-yellow text-metallic-brown border-0 rounded-full opacity-50 cursor-not-allowed">
                  <span className="pi pi-user text-sm"></span>
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuccessPage;
