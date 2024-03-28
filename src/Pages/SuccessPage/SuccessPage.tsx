import { startTransition, useEffect, useState } from "react";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext/AppContext";
import Layout from "../../Layout/Layout";

const SuccessPage = () => {
  const navigate = useNavigate();
  const { showToast, setSelectedImage, setPolygons, dispatch } =
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
        className={`h-full p-3 m-3 flex flex-col justify-around items-center text-naples-yellow bg-metallic-brown rounded-lg shadow-md transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <span className="pi pi-check p-5 text-[80px] text-naples-yellow bg-fern-green rounded-full shadow-md"></span>
        <p className="text-center text-lg md:text-2xl font-heading">
          Thank you for using this product
        </p>
        <div className={`w-full hidden md:flex flex-col items-center`}>
          <Button
            loading={loader}
            icon="pi pi-times"
            label="Close"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={async () => {
              setLoader(true);
              await clearSessionStorageAndNavigate();
            }}
          />
        </div>
      </div>
      <div
        className={`w-full p-2 flex md:hidden flex-col items-center font-content sticky bottom-0 left-0 right-0 bg-metallic-brown rounded-t-3xl drop-shadow-top drop-shadow-right transition-all duration-1000 transform ${
          showContent
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0"
        }`}
      >
        <Button
          loading={loader}
          icon="pi pi-times"
          label="Close"
          className="h-9 sm:h-10 text-sm sm:text-base text-metallic-brown bg-naples-yellow border-naples-yellow"
          onClick={async () => {
            setLoader(true);
            await clearSessionStorageAndNavigate();
          }}
        />
      </div>
    </Layout>
  );
};

export default SuccessPage;
