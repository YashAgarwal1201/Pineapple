import { startTransition, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// import "./UploadData.scss";
import Layout from "../../Layout/Layout";
import { PROJECT_NAME } from "../../Services/constants";
import { Button } from "primereact/button";

const LandingScreen = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

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

          {/* <Link
            title="Click to proceed"
            className="w-10 xs:w-11 md:w-12 lg:w-13 h-10 xs:h-11 md:h-12 lg:h-13 rounded-full flex justify-center items-center bg-fern-green text-naples-yellow border-none"
            to={"/upload-image"}
          >
            <span className="pi pi-chevron-right"></span>
          </Link> */}
          <Button
            title="Click to proceed"
            className="w-10 xs:w-11 md:w-12 lg:w-13 h-10 xs:h-11 md:h-12 lg:h-13 rounded-full flex justify-center items-center bg-fern-green text-naples-yellow border-none"
            onClick={() => startTransition(() => navigate("/upload-image"))}
          >
            <span className="pi pi-chevron-right"></span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default LandingScreen;
