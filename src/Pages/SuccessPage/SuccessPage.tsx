// src/Pages/SuccessPage/SuccessPage.tsx
import { startTransition, useEffect, useState } from "react";

import { Download, RefreshCcw } from "lucide-react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";

import PineappleLoader from "../../Components/Loaders/Loaders";
import Layout from "../../Layout/Layout";
import {
  AMBER_PRIMARY_BTN_STYLES,
  LIME_PRIMARY_BTN_STYLES,
} from "../../Services/constants";
import {
  downloadPolygonsData,
  getErrorMessage,
  resetColorIndex,
} from "../../Services/functionServices";
import "./SuccessPage.scss";
import { usePineappleStore } from "../../Services/zustand";

const SuccessPage = () => {
  const navigate = useNavigate();

  const {
    imageSelected,
    annotatedCanvasImage,
    polygons,
    rectangles,
    showToast,
    clearSessionDb,
    annotatorName,
  } = usePineappleStore();

  const [loader, setLoader] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [format, setFormat] = useState<"pineapple" | "coco" | "yolo">("pineapple");

  const FORMAT_OPTIONS = [
    { label: "Pineapple JSON", value: "pineapple" },
    { label: "COCO JSON", value: "coco" },
    { label: "YOLO (.txt)", value: "yolo" },
  ];

  const hasShapes = polygons.length > 0 || rectangles.length > 0;

  useEffect(() => {
    if (imageSelected.url === "" || !hasShapes) {
      setLoading(true);
      setTimeout(() => navigate("/"), 750);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSessionStorageAndNavigate = async () => {
    try {
      await clearSessionDb();
      resetColorIndex();

      showToast("info", "Info", "Redirecting you to the home page");
      setTimeout(() => {
        startTransition(() => {
        });
      }, 2000);
    } catch (error: unknown) {
      console.error("Error clearing session:", error);
      showToast("error", "Error", `Failed to clear session: ${getErrorMessage(error)}`);
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
          className={`h-full p-3 flex flex-col md:flex-row justify-center items-center gap-y-10 md:gap-y-auto text-naples-yellow bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md transition-all duration-1000 transform ${showContent
              ? "translate-y-0 md:translate-x-0 opacity-100"
              : "translate-y-0 md:-translate-x-full opacity-0"
            } relative`}
        >
          <div className="w-full md:w-1/2 h-auto md:h-full flex justify-center items-center">
            <div className="w-75 sm:w-87.5 h-75 sm:h-87.5 relative">
              <img
                src={"./logo.svg"}
                alt=""
                className="w-full h-full object-contain"
              />
              <div className="absolute! right-16 top-28 sm:top-32">
                <div className="p-5 md:p-7 bg-transparent rounded-full relative">
                  <span className="success-check pi pi-check w-12 h-12 flex justify-center items-center z-10 bg-lime-500 dark:bg-lime-400 rounded-full"></span>
                  <div className="absolute! inset-0 flex items-center justify-center">
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
            <div className="w-full flex flex-col xs:flex-row justify-center items-center gap-2 font-content">
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
      !rounded-xl
    `}
              >
                <RefreshCcw size={16} />
                <span>Start again</span>
              </Button>

              <div className="flex items-center gap-1 w-full xs:w-auto">
                <Dropdown
                  value={format}
                  options={FORMAT_OPTIONS}
                  onChange={(e) => setFormat(e.value)}
                  className="w-full xs:w-40 !rounded-xl text-sm sm:text-base border-amber-300 dark:border-amber-700"
                />
                <Button
                  disabled={!hasShapes || loader}
                  onClick={async () => {
                    setLoader(true);
                    await downloadPolygonsData(
                      format,
                      polygons,
                      rectangles,
                      annotatedCanvasImage,
                      imageSelected,
                      annotatorName,
                      showToast,
                    );
                    setLoader(false);
                  }}
                  className={`${AMBER_PRIMARY_BTN_STYLES}
        w-full xs:w-auto
        flex items-center justify-center xs:justify-start gap-x-2
        text-sm sm:text-base !font-content xs:flex-shrink-0
        !rounded-xl
      `}
                >
                  <Download size={16} />
                  <span>Download</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SuccessPage;
