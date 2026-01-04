// src/Pages/SuccessPage/SuccessPage.tsx
import { startTransition, useEffect, useState } from "react";

import { Download, RefreshCcw } from "lucide-react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

import PineappleLoader from "../../Components/Loaders/Loaders";
import Layout from "../../Layout/Layout";
import {
  AMBER_PRIMARY_BTN_STYLES,
  LIME_PRIMARY_BTN_STYLES,
} from "../../Services/constants";
import { downloadPolygonsData } from "../../Services/functionServices";
import "./SuccessPage.scss";
import { usePineappleStore } from "../../Services/zustand";

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
          <PineappleLoader variant="spinner" />
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
                  <span className="success-check pi pi-check w-12 h-12 flex justify-center items-center z-10 bg-lime-500 dark:bg-lime-400 rounded-full"></span>
                  <div className="!absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border border-dashed border-lime-500 dark:border-lime-400 rounded-full animate-spin duration-5000"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 h-auto md:h-full flex flex-col justify-center items-center gap-y-10 p-2">
            <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-lime-700 dark:text-lime-400 select-none">
              <span className="text-amber-700 dark:text-amber-300 ">
                Thank you for using
              </span>{" "}
              Project Pineapple
            </h1>
            <div className="w-full flex flex-col xs:flex-row justify-center items-center gap-1 font-content">
              <Button
                loading={loader}
                onClick={async () => {
                  setLoader(true);
                  await clearSessionStorageAndNavigate();
                }}
                className={`${LIME_PRIMARY_BTN_STYLES}
      w-full xs:w-auto
      flex items-center justify-center xs:justify-start gap-x-2
      text-sm sm:text-base !font-content xs:flex-shrink-0
  
      !rounded-tl-2xl !rounded-tr-2xl !rounded-bl-sm !rounded-br-sm
     
      xs:!rounded-tl-2xl xs:!rounded-bl-2xl xs:!rounded-tr-sm xs:!rounded-br-sm
    `}
              >
                <RefreshCcw size={16} />
                <span>Start again</span>
              </Button>

              <Button
                disabled={polygons.length < 1 || loader}
                onClick={() => {
                  console.log("Download data", polygons, annotatedCanvasImage);
                  downloadPolygonsData(
                    polygons,
                    annotatedCanvasImage,
                    showToast
                  );
                }}
                className={`${AMBER_PRIMARY_BTN_STYLES}
      w-full xs:w-auto
      flex items-center justify-center xs:justify-start gap-x-2
      text-sm sm:text-base !font-content xs:flex-shrink-0
      
      !rounded-bl-2xl !rounded-br-2xl !rounded-tl-sm !rounded-tr-sm      
      xs:!rounded-tr-2xl xs:!rounded-br-2xl xs:!rounded-tl-sm xs:!rounded-bl-sm
    `}
              >
                <Download size={16} />
                <span>Download data</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuccessPage;
