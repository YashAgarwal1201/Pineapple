// src/Pages/LandingScreen/LandingScreen.tsx
import { useEffect, useState } from "react";

import { ChevronRight } from "lucide-react";
// import { Button } from "primereact/button";
// import { useNavigate } from "react-router-dom";

// import "./UploadData.scss";
import Layout from "../../Layout/Layout";
import { PROJECT_NAME } from "../../Services/constants";

const LandingScreen = () => {
  // const navigate = useNavigate();

  const [showContent, setShowContent] = useState<boolean>(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  return (
    <Layout>
      <div
        className={`h-full p-2 sm:p-3 grid grid-cols-1 mdl:grid-cols-2 bg-amber-50 dark:bg-stone-900 rounded-xl sm:rounded-2xl shadow-md transition-all duration-1000 transform overflow-auto ${
          showContent
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <div className="flex flex-col justify-end mdl:justify-center items-center">
          <img
            src={"./logo.svg"}
            fetchPriority="high"
            alt=""
            className="max-w-[200px] mdl:max-w-[300px] lg:max-w-max aspect-auto select-none pointer-events-none"
          />
        </div>

        <div className="w-full  h-full px-2 flex flex-col justify-start mdl:justify-center items-center gap-y-10">
          <h1 className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-lime-700 dark:text-lime-400 select-none">
            <span className="text-amber-700 dark:text-amber-300 ">
              Welcome to
            </span>{" "}
            Project {PROJECT_NAME}
          </h1>

          {/* <Link
            title="Click to proceed"
            className="w-10 xs:w-11 md:w-12 lg:w-13 h-10 xs:h-11 md:h-12 lg:h-13 rounded-full flex justify-center items-center bg-fern-green text-naples-yellow border-none"
            to={"/upload-image"}
          >
            <span className="pi pi-chevron-right"></span>
          </Link> */}

          <div className="w-full flex flex-row-reverse justify-center items-center gap-x-3 lg:gap-x-5 gap-y-2 font-content">
            {/* <Button
              title="Click to proceed"
              className="!rounded-2xl flex flex-row-reverse items-center gap-2 !bg-amber-400 hover:!bg-amber-500 !text-stone-900 dark:!bg-amber-500 dark:hover:!bg-amber-600 dark:!text-stone-900 !border-none animate-bounce-right"
              onClick={() => navigate("/upload-image")}
              
            >
              <ChevronRight size={20} />
              <span>Start</span>
            </Button> */}

            <a
              href="/upload-image"
              title="Click to proceed"
              className="p-button !rounded-2xl flex flex-row-reverse items-center gap-2 !bg-amber-400 hover:!bg-amber-500 !text-stone-900 dark:!bg-amber-500 dark:hover:!bg-amber-600 dark:!text-stone-900 !border-none animate-bounce-right"
              // onClick={() => navigate("/upload-image")}
            >
              <ChevronRight size={20} />
              <span>Start</span>
            </a>

            <a
              title="check developer profile"
              aria-label="Developer Profile"
              href={"https://yashagarwal1201.github.io/"}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="absolute bottom-4 right-4 w-12 h-12 flex justify-center items-center text-sm sm:text-base bg-lime-500 hover:bg-lime-600 dark:bg-lime-600 dark:hover:bg-lime-700 text-white border-0 rounded-full"
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
