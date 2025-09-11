import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Camera,
  Check,
  FileImage,
  Image as ImageIcon,
  Sparkles,
  Trash,
  Upload,
} from "lucide-react";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";

import CaptureImageLibrary from "../../Components/CaptureImage/CaptureImage";
import UploadImageOptionsDialog from "../../Components/UploadImageOptionsDialog/UploadImageOptionsDialog";
import Layout from "../../Layout/Layout";
import "./UploadData.scss";
import { usePineappleStore } from "../../Services/zustand";

const UploadData = () => {
  const navigate = useNavigate();

  const state = usePineappleStore();
  const { showToast, setSelectedImage, setPolygons } = state;

  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [openCamera, setOpenCamera] = useState<boolean>(false);
  const [showContent, setShowContent] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);

  //   const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      if (file.size > 2048 * 2048) {
        showToast("error", "Error", "Please select an image smaller than 1MB");
        return;
      }

      if (file?.type?.includes("image")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Data = e.target?.result as string;
          setSelectedImage(file.name, base64Data, file.type);
          setImageError(false);
          showToast("success", "Success", "Rack image uploaded successfully!");
          if (state.polygons?.length > 0) setPolygons([]);
        };
        reader.readAsDataURL(file);
      } else {
        showToast("error", "Error", "Please select a valid image file");
      }
    },
    [showToast, setSelectedImage, setPolygons, state.polygons?.length]
  );

  const uploadHandeler = () => {
    const input = document.createElement("input");
    input.setAttribute("accept", "image/*");
    input.type = "file";

    input.onchange = async () => {
      if (input.files && input.files[0]) {
        await processFile(input.files[0]);
        setShowOptions(false);
      }
    };
    input.click();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const imageFile = files.find((file) => file.type.includes("image"));
        if (imageFile) {
          await processFile(imageFile);
        } else {
          showToast("error", "Error", "Please drop a valid image file");
        }
      }
    },
    [processFile, showToast]
  );

  const removeHandeler = () => {
    showToast("warn", "Warning", "Image removed");
    setSelectedImage("", "", "");
    setImageError(false);
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

  const handleImageError = () => {
    setImageError(true);
  };

  const hasImage = state.imageSelected?.url !== "";

  return (
    <Layout>
      <div
        className={`h-full p-3 sm:p-4 lg:p-6 xl:p-8 flex flex-col bg-amber-50 dark:bg-stone-900 overflow-y-auto rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        {/* Header Section */}
        <div className="flex-shrink-0 mb-6 lg:mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-heading text-amber-700 dark:text-amber-300 font-bold">
              Upload Image
            </h1>

            <p className="text-sm sm:text-base md:text-lg font-content text-amber-600 dark:text-amber-400 font-medium">
              Drag and drop your image or choose from the options below
            </p>
          </div>
        </div>

        {/* Main Content - Responsive Grid Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 min-h-0">
          {/* Upload Zone - Takes more space on large screens */}
          <div className="lg:col-span-8 xl:col-span-7 flex flex-col">
            <div
              ref={dropZoneRef}
              className={`flex-1 relative border border-dashed rounded-2xl lg:rounded-3xl cursor-pointer transition-all duration-300 min-h-[320px] sm:min-h-[400px] lg:min-h-[500px] ${
                isDragOver
                  ? "border-amber-500 bg-gradient-to-br from-amber-100/80 to-orange-100/80 dark:from-amber-900/30 dark:to-orange-900/30 scale-[1.01] shadow-2xl"
                  : hasImage
                  ? "border-amber-400 dark:border-amber-600 shadow-xl"
                  : "border-amber-300 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-lg"
              }`}
              onClick={() => {
                if (!hasImage) setShowOptions(true);
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!hasImage ? (
                // Empty state - enhanced for larger screens
                <div className="w-full h-full flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-br from-amber-50/80 via-yellow-50/80 to-orange-50/80 dark:from-amber-900/10 dark:via-yellow-900/10 dark:to-orange-900/10 rounded-2xl lg:rounded-3xl">
                  {/* Main Upload Icon */}
                  <div
                    className={`mb-8 lg:mb-12 transition-all duration-500 ${
                      isDragOver ? "scale-125 rotate-6" : "hover:scale-110"
                    }`}
                  >
                    <div className="relative">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-36 lg:h-36 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 rounded-3xl lg:rounded-4xl flex items-center justify-center shadow-2xl">
                        <Upload
                          size={40}
                          className="text-white sm:w-12 sm:h-12 lg:w-16 lg:h-16"
                        />
                      </div>
                      <div className="absolute -bottom-2 -right-2 lg:-bottom-3 lg:-right-3 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl lg:rounded-3xl flex items-center justify-center shadow-lg">
                        <FileImage
                          size={20}
                          className="text-white lg:w-6 lg:h-6"
                        />
                      </div>
                      {isDragOver && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-yellow-500 rounded-3xl lg:rounded-4xl flex items-center justify-center animate-pulse">
                          <Sparkles
                            size={40}
                            className="text-white sm:w-12 sm:h-12 lg:w-16 lg:h-16"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center space-y-4 lg:space-y-6 mb-8 lg:mb-12">
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-heading text-amber-700 dark:text-amber-300 font-bold">
                      {isDragOver ? "Drop it here!" : "Ready to Upload"}
                    </h2>
                    <p className="text-base sm:text-lg lg:text-xl text-amber-600 dark:text-amber-400 font-medium max-w-md mx-auto">
                      {isDragOver
                        ? "Release to start the magic ✨"
                        : "Drag your image here or click to browse files"}
                    </p>
                  </div>

                  {/* File Format Indicators */}
                  <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
                    {["JPG", "PNG", "WEBP"].map((format) => (
                      <div
                        key={format}
                        className="px-4 py-2 lg:px-6 lg:py-3 bg-white/90 dark:bg-black/30 rounded-2xl border border-amber-200 dark:border-amber-800 shadow-md"
                      >
                        <span className="text-sm lg:text-base text-amber-600 dark:text-amber-400 font-bold">
                          {format}
                        </span>
                      </div>
                    ))}
                    <div className="px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-800 shadow-md">
                      <span className="text-sm lg:text-base text-green-600 dark:text-green-400 font-bold">
                        Max 1MB
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Image preview state - enhanced
                <div className="w-full h-full relative bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-900/50 rounded-2xl lg:rounded-3xl overflow-hidden">
                  {!imageError ? (
                    <>
                      <Image
                        src={state.imageSelected.url}
                        alt="Selected image preview"
                        preview
                        className="w-full h-full object-cover rounded-2xl lg:rounded-3xl *:w-full *:h-full *:object-cover *:rounded-2xl lg:*:rounded-3xl"
                        onError={handleImageError}
                      />

                      {/* Enhanced overlay */}
                      <div className="absolute top-4 lg:top-6 left-4 lg:left-6 bg-black/80 backdrop-blur-md text-white px-4 py-3 lg:px-6 lg:py-4 rounded-2xl shadow-xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={16} className="text-white" />
                          </div>
                          <div>
                            <span className="text-sm lg:text-base font-bold">
                              Upload Complete
                            </span>
                            <p className="text-xs lg:text-sm text-gray-300 truncate max-w-48 lg:max-w-64">
                              {state.imageSelected.title || "Uploaded image"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Change image button */}
                      <Button
                        icon="pi pi-sync"
                        rounded
                        className="absolute top-4 lg:top-6 right-4 lg:right-6 !w-12 !h-12 lg:!w-14 lg:!h-14 bg-gradient-to-br from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border border-white/30 shadow-xl transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                        type="button"
                        title="Change image"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowOptions(true);
                        }}
                      />
                    </>
                  ) : (
                    // Error state
                    <div className="w-full h-full flex flex-col justify-center items-center gap-6 p-6">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-3xl flex items-center justify-center shadow-lg">
                        <ImageIcon
                          size={32}
                          className="text-red-500 lg:w-10 lg:h-10"
                        />
                      </div>
                      <div className="text-center">
                        <h3 className="text-xl lg:text-2xl font-heading font-bold text-red-700 dark:text-red-400 mb-2">
                          Oops! Something went wrong
                        </h3>
                        <p className="text-base lg:text-lg text-red-600 dark:text-red-500">
                          Please try uploading again
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Options and Actions */}
          <div className="lg:col-span-4 xl:col-span-5 flex flex-col gap-6 lg:gap-8">
            {/* Quick Actions - Always visible */}
            <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
              <h3 className="text-lg lg:text-xl font-heading font-bold text-amber-700 dark:text-amber-300 mb-4 lg:mb-6">
                Add Image
              </h3>
              <div className="flex flex-col gap-y-1">
                <Button
                  className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-t-2xl !rounded-b-sm text-sm lg:text-base !text-white !bg-amber-800 dark:bg-amber-900 !border-0"
                  onClick={() => setShowOptions(true)}
                >
                  <Upload size={18} />
                  <span>Browse Files</span>
                </Button>
                <Button
                  className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-b-2xl !rounded-t-sm text-sm lg:text-base !text-white !bg-amber-800 dark:bg-amber-900 !border-0"
                  onClick={onCaptureImageClick}
                >
                  <Camera size={18} />
                  <span className="font-content">Take Photo</span>
                </Button>
              </div>
            </div>

            {/* Image Actions - Show when image is uploaded */}
            {hasImage && (
              <div className="bg-gradient-to-br from-white/80 to-amber-50/80 dark:from-black/30 dark:to-amber-900/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-lg border border-amber-200/50 dark:border-amber-800/50">
                <h3 className="text-lg lg:text-xl font-heading font-bold text-amber-700 dark:text-amber-300 mb-4 lg:mb-6">
                  Image Actions
                </h3>
                <div className="flex flex-col gap-y-1">
                  <Button
                    title="Proceed to next step"
                    className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-t-2xl !rounded-b-sm text-sm lg:text-base !bg-lime-700 dark:!bg-lime-800  !text-white !border-none "
                    onClick={saveAndContinueHandeler}
                  >
                    <Check size={18} />
                    <span className="font-content">Save & Continue</span>
                  </Button>
                  <Button
                    title="Remove the selected image"
                    className="w-full h-9 lg:h-10 flex items-center justify-center gap-3 !rounded-b-2xl !rounded-t-sm text-sm lg:text-base font-semibold !bg-transparent !border !border-red-300 !text-red-500 hover:!bg-red-50 hover:!border-red-400 dark:!border-red-600 dark:!text-red-400 dark:hover:!bg-red-900/20 transition-all duration-200"
                    onClick={removeHandeler}
                  >
                    <Trash size={16} />
                    <span className="font-content">Remove Image</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-xl lg:rounded-2xl p-4 lg:p-5 xl:p-6 shadow-lg border border-blue-200/50 dark:border-blue-800/50">
              <h3 className="text-lg lg:text-xl font-heading font-bold text-blue-700 dark:text-blue-300 mb-3 lg:mb-4">
                💡 Pro Tips
              </h3>
              <ul className="space-y-2 lg:space-y-3 text-sm lg:text-base text-blue-600 dark:text-blue-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Use high-quality images for better results</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Ensure good lighting and clear focus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Keep file size under 1MB for faster upload</span>
                </li>
              </ul>
            </div>
          </div>
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

      <Sidebar
        visible={openCamera}
        onHide={() => setOpenCamera(false)}
        dismissable={true}
        maskClassName="backdrop-blur"
        position="right"
        closeIcon={
          <span className="pi pi-times text-metallic-brown bg-naples-yellow w-10 h-10 flex justify-center items-center"></span>
        }
        className="polygon-list-sidebar side-menu !rounded-none md:!rounded-r-3xl !bg-white dark:!bg-black aboutDialog !w-full md:!w-[768px]"
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
            Capture Image
          </h2>
        }
      >
        <CaptureImageLibrary
          onCapture={() => setShowOptions(true)}
          exitCamera={() => setOpenCamera(false)}
        />
      </Sidebar>
    </Layout>
  );
};

export default UploadData;
