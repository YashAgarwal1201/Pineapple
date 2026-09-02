// src/Pages/UploadData/UploadChoice.tsx
//
// Entry point for /upload-image. Two big pressable panels, not two small
// buttons floating in empty space — same card-shell and gradient-icon
// language as UploadData.tsx, so this reads as part of the same app.

import { useEffect, useState } from "react";

import { FileJson, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Layout from "../../Layout/Layout";

const UploadChoice = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Layout>
      <div
        className={`h-full p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto flex flex-col bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Header Section — same pattern as UploadData */}
        <div className="shrink-0 mb-6 lg:mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
              Upload Image / Data
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
              Start a new annotation session, or bring in one you already have.
            </p>
          </div>
        </div>

        {/* Two options, equal weight, stack on small screens */}
        <div className="grow w-full h-full flex flex-col lg:flex-row gap-4 sm:gap-5 lg:gap-6 min-h-0">
          <button
            type="button"
            onClick={() => navigate("/upload-image/scratch")}
            className="group flex-1 min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-linear-to-br from-amber-400 via-orange-400 to-yellow-500 hover:from-amber-500 hover:via-orange-500 hover:to-yellow-600 shadow-xl transition-all duration-300 hover:scale-[1.01] px-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-white/25 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Sparkles
                size={28}
                className="text-white sm:w-8 sm:h-8 lg:w-9 lg:h-9"
              />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-white">
              Start from Scratch
            </span>
            <span className="text-xs sm:text-sm font-content text-white/85 text-center max-w-xs">
              Upload or capture an image and draw new annotations
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/upload-image/import")}
            className="group flex-1 min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-amber-300 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 shadow-lg transition-all duration-300 hover:scale-[1.01] px-6"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-lime-500 dark:bg-lime-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <FileJson
                size={28}
                className="text-white sm:w-8 sm:h-8 lg:w-9 lg:h-9"
              />
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-heading font-bold text-amber-700 dark:text-amber-300">
              Import Existing Data
            </span>
            <span className="text-xs sm:text-sm font-content text-amber-600 dark:text-amber-400 text-center max-w-xs">
              Bring in an image plus annotations you already have
            </span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default UploadChoice;
