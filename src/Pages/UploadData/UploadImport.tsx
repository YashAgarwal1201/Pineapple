// src/Pages/UploadData/UploadImport.tsx
import { useCallback, useEffect, useRef, useState } from "react";

import {
  AlertTriangle,
  Check,
  CircleCheck,
  FileJson,
  Image as ImageIcon,
  Info,
  RefreshCcw,
  X,
} from "lucide-react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useNavigate } from "react-router-dom";

import FormatGuide from "../../Components/FormatGuide/FormatGuide";
import Layout from "../../Layout/Layout";
import { RED_SECONDARY_BTN_STYLES } from "../../Services/constants";
import {
  detectFormat,
  ImageDimensions,
  parseAnnotationFile,
  SupportedFormat,
} from "../../Services/importAdapters";
import { usePineappleStore } from "../../Services/zustand";

const FORMAT_OPTIONS: { label: string; value: SupportedFormat }[] = [
  { label: "Pineapple JSON", value: "pineapple" },
  { label: "COCO JSON", value: "coco" },
];

const SUPPORTED_FORMATS: { name: string; available: boolean; note?: string }[] =
  [
    { name: "Pineapple JSON", available: true },
    { name: "COCO JSON", available: true },
    { name: "Pascal VOC", available: false, note: "planned" },
    { name: "YOLO", available: false, note: "planned — needs a classes file" },
  ];

const TEN_MB = 10 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });



const getImageDimensions = (dataUrl: string): Promise<ImageDimensions> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Couldn't read image dimensions"));
    img.src = dataUrl;
  });

const UploadImport = () => {
  const navigate = useNavigate();
  const { showToast, setImageFileToDb, setPolygons, setRectangles } =
    usePineappleStore();

  const [showContent, setShowContent] = useState<boolean>(false);
  const [showFormatGuide, setShowFormatGuide] = useState<boolean>(false);
  
  useEffect(() => {
    setShowContent(true);
  }, []);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const annotationInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const [annotationFile, setAnnotationFile] = useState<File | null>(null);
  const [annotationText, setAnnotationText] = useState<string | null>(null);
  const [format, setFormat] = useState<SupportedFormat | null>(null);
  const [wasDetected, setWasDetected] = useState<boolean>(false);

  const [warnings, setWarnings] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleImagePick = useCallback(
    async (file: File) => {
      if (file.size > TEN_MB) {
        showToast("error", "Error", "Please select an image smaller than 10MB");
        return;
      }
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        showToast("error", "Error", "Please select a valid image file");
        return;
      }
      const dataUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImageDataUrl(dataUrl);
    },
    [showToast],
  );

  const handleAnnotationPick = useCallback(async (file: File) => {
    const text = await readFileAsText(file);
    const guess = detectFormat(text);
    setAnnotationFile(file);
    setAnnotationText(text);
    setFormat(guess === "unknown" ? null : guess);
    setWasDetected(guess !== "unknown");
    setWarnings([]);
  }, []);

  const canImport = !!imageFile && !!annotationText && !!format && !isImporting;

  const handleImport = useCallback(async () => {
    if (!imageFile || !imageDataUrl || !annotationText || !format) return;

    setIsImporting(true);
    try {
      const targetDims = await getImageDimensions(imageDataUrl);
      const result = parseAnnotationFile(
        format,
        annotationText,
        targetDims,
        annotationFile?.name,
      );

      await setImageFileToDb(imageFile, imageFile.name, imageFile.type);
      setPolygons(result.polygons);
      setRectangles(result.rectangles);
      setWarnings(result.warnings);

      const total = result.polygons.length + result.rectangles.length;
      if (total === 0) {
        showToast(
          "warn",
          "Warning",
          "No shapes were imported — check the format and try again",
        );
        setIsImporting(false);
        return;
      }

      showToast(
        "success",
        "Success",
        `Imported ${total} shape${total === 1 ? "" : "s"}`,
      );
      navigate("/draw");
    } catch {
      showToast("error", "Error", "Couldn't read that annotation file");
      setIsImporting(false);
    }
  }, [
    imageFile,
    imageDataUrl,
    annotationText,
    annotationFile,
    format,
    setImageFileToDb,
    setPolygons,
    setRectangles,
    showToast,
    navigate,
  ]);

  return (
    <Layout>
      <FormatGuide visible={showFormatGuide} onHide={() => setShowFormatGuide(false)} />
      <div
        className={`h-full p-3 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto flex flex-col bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Header Section */}
        <div className="shrink-0 mb-6 lg:mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
              Import Existing Data
            </h1>
            <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
              Bring in an image and its matching annotation file
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full grow h-full flex flex-col lg:flex-row gap-5 min-h-0">
          {/* Left column — the two file steps */}
          <div className="grow max-h-full w-full lg:w-4/6 flex flex-col gap-4 sm:gap-5 overflow-y-auto">
            {/* Step 1 — Image */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
              <span className="text-xs sm:text-sm font-heading font-bold tracking-wide text-amber-500 dark:text-amber-500/80 uppercase">
                1 — Image
              </span>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImagePick(e.target.files[0]);
                }}
              />

              {!imageFile ? (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="mt-3 w-full flex items-center justify-center gap-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 px-4 py-6 sm:py-7 transition-colors"
                >
                  <ImageIcon
                    size={20}
                    className="text-amber-500 dark:text-amber-400 shrink-0"
                  />
                  <span className="font-content text-sm sm:text-base text-amber-600 dark:text-amber-400">
                    Choose an image
                  </span>
                </button>
              ) : (
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-black/5 dark:bg-white/5 px-4 py-3">
                  <div className="min-w-0 flex items-center gap-3">
                    <ImageIcon
                      size={20}
                      className="text-amber-500 dark:text-amber-400 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-content text-sm sm:text-base text-amber-800 dark:text-amber-200 truncate">
                        {imageFile.name}
                      </p>
                      <p className="font-content text-xs text-amber-600/70 dark:text-amber-400/70">
                        {(imageFile.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    className="!w-9 !h-9 shrink-0 !rounded-full !bg-amber-800 dark:!bg-amber-900 !text-white !border-0"
                    title="Change image"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <RefreshCcw size={14} />
                  </Button>
                </div>
              )}
            </div>

            {/* Step 2 — Annotation file */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
              <span className="text-xs sm:text-sm font-heading font-bold tracking-wide text-amber-500 dark:text-amber-500/80 uppercase">
                2 — Annotation file
              </span>

              <input
                ref={annotationInputRef}
                type="file"
                accept=".json,.txt,.xml"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0])
                    handleAnnotationPick(e.target.files[0]);
                }}
              />

              {!annotationFile ? (
                <button
                  type="button"
                  onClick={() => annotationInputRef.current?.click()}
                  className="mt-3 w-full flex items-center justify-center gap-3 rounded-xl border border-dashed border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 px-4 py-6 sm:py-7 transition-colors"
                >
                  <FileJson
                    size={20}
                    className="text-amber-500 dark:text-amber-400 shrink-0"
                  />
                  <span className="font-content text-sm sm:text-base text-amber-600 dark:text-amber-400">
                    Choose an annotation file
                  </span>
                </button>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-black/5 dark:bg-white/5 px-4 py-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <FileJson
                        size={20}
                        className="text-amber-500 dark:text-amber-400 shrink-0"
                      />
                      <p className="font-content text-sm sm:text-base text-amber-800 dark:text-amber-200 truncate">
                        {annotationFile.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {wasDetected && format && (
                        <span className="flex items-center gap-1 text-xs font-content px-2.5 py-1 rounded-full bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 border border-lime-300 dark:border-lime-700">
                          <CircleCheck size={12} />
                          detected:{" "}
                          {
                            FORMAT_OPTIONS.find((f) => f.value === format)
                              ?.label
                          }
                        </span>
                      )}
                      <Button
                        className="!w-9 !h-9 shrink-0 !rounded-full !bg-amber-800 dark:!bg-amber-900 !text-white !border-0"
                        title="Change annotation file"
                        onClick={() => annotationInputRef.current?.click()}
                      >
                        <RefreshCcw size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5">
                    <span className="text-xs font-content text-amber-600/80 dark:text-amber-400/80 px-1">
                      Format{" "}
                      {wasDetected
                        ? "(editable)"
                        : "— not recognized, pick one"}
                    </span>
                    <Dropdown
                      value={format}
                      options={FORMAT_OPTIONS}
                      onChange={(e) => setFormat(e.value)}
                      placeholder="Select format"
                      className="w-full !rounded-xl text-sm sm:text-base"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Result summary */}
            {warnings.length > 0 && (
              <div className="rounded-xl lg:rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-100/60 dark:bg-amber-900/10 p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle
                    size={16}
                    className="text-amber-600 dark:text-amber-400 shrink-0"
                  />
                  <span className="text-xs sm:text-sm font-heading font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">
                    Import summary
                  </span>
                </div>
                <ul className="flex flex-col gap-1.5">
                  {warnings.map((w, i) => (
                    <li
                      key={i}
                      className="text-xs sm:text-sm font-content text-amber-700/90 dark:text-amber-300/80"
                    >
                      • {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="h-full w-full lg:w-2/6 flex flex-col gap-5">
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
              <h3 className="text-lg lg:text-xl font-heading font-bold text-amber-700 dark:text-amber-300 mb-4 lg:mb-6">
                Import Actions
              </h3>
              <div className="flex flex-col gap-y-1">
                <Button
                  disabled={!canImport}
                  className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 rounded-t-2xl! rounded-b-sm! text-sm lg:text-base bg-lime-700! dark:bg-lime-800! text-white! border-none! disabled:opacity-50!"
                  onClick={handleImport}
                >
                  <Check size={18} />
                  <span className="font-content">
                    {isImporting ? "Importing..." : "Import & Continue"}
                  </span>
                </Button>
                <Button
                  title="Back to upload options"
                  className={`w-full h-9 lg:h-10 flex items-center justify-center gap-3 rounded-b-2xl! rounded-t-sm! text-sm lg:text-base ${RED_SECONDARY_BTN_STYLES}`}
                  onClick={() => navigate("/upload-image")}
                >
                  <X size={16} />
                  <span className="font-content">Cancel</span>
                </Button>
              </div>
            </div>

            <div className="bg-linear-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-lg border border-blue-200/50 dark:border-blue-800/50">
              <h3 className="flex items-center gap-2 text-lg lg:text-xl font-heading font-bold text-blue-700 dark:text-blue-300 mb-3 lg:mb-4">
                <Info size={18} />
                Supported Formats
              </h3>
              <ul className="space-y-2 lg:space-y-3 text-sm lg:text-base">
                {SUPPORTED_FORMATS.map((f) => (
                  <li key={f.name} className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        f.available
                          ? "bg-lime-500"
                          : "bg-blue-300 dark:bg-blue-700"
                      }`}
                    />
                    <span
                      className={
                        f.available
                          ? "text-blue-700 dark:text-blue-300 font-medium"
                          : "text-blue-500/70 dark:text-blue-400/60"
                      }
                    >
                      {f.name}
                      {f.note && <span className="text-xs"> — {f.note}</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setShowFormatGuide(true)}
                className="mt-4 w-full p-button-outlined p-button-secondary !border-blue-300 dark:!border-blue-700 !text-blue-700 dark:!text-blue-300 font-content text-sm !rounded-xl"
              >
                View Format Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UploadImport;
