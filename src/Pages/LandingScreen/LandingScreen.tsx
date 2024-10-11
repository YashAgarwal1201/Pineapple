import { startTransition, useEffect, useState } from "react";

import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

// import "./UploadData.scss";
import Layout from "../../Layout/Layout";
import { PROJECT_NAME } from "../../Services/constants";

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
            className="max-w-[200px] mdl:max-w-[300px] lg:max-w-max aspect-auto select-none pointer-events-none"
          />
        </div>

        <div className="w-full  h-full px-2 flex flex-col justify-start mdl:justify-center items-center gap-y-10">
          <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-naples-yellow select-none">
            <span className="text-bud-green">Welcome to</span> Project{" "}
            {PROJECT_NAME}
          </h1>

          {/* <Link
            title="Click to proceed"
            className="w-10 xs:w-11 md:w-12 lg:w-13 h-10 xs:h-11 md:h-12 lg:h-13 rounded-full flex justify-center items-center bg-fern-green text-naples-yellow border-none"
            to={"/upload-image"}
          >
            <span className="pi pi-chevron-right"></span>
          </Link> */}

          <div className="w-full flex flex-row-reverse justify-center items-center gap-x-3 lg:gap-x-5 gap-y-2 font-content">
            <Button
              title="Click to proceed"
              rounded
              className=" bg-fern-green text-naples-yellow border-none animate-bounce-right"
              onClick={() => startTransition(() => navigate("/upload-image"))}
              icon={<span className="pi pi-chevron-right"></span>}
            />

            <a
              title="check developer profile"
              href={"https://yashagarwal1201.github.io/"}
              target="_blank"
              className="w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-naples-yellow text-metallic-brown border-0 rounded-full"
            >
              <span className="pi pi-user text-sm"></span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingScreen;
