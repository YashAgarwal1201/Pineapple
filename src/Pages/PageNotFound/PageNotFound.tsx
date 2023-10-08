import { startTransition } from "react";
import Lottie from "react-lottie-player";
import pageNotFoundErrorAnimation from "./../../assets/Lottie/pageNotFoundErrorAnimation.json";
import { Button } from "primereact/button";

const PageNotFound = () => {
  const goBack = () => {
    window.history.back();
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Button
        className="p-3 absolute top-2 left-2 rounded-md hover:bg-[#3C5164] bg-[#FFFFFF] hover:text-[#FFFFFF] text-[#3C5164]"
        icon="pi pi-arrow-left"
        title="Go Back"
        onClick={() => {
          startTransition(() => {
            goBack();
          });
        }}
      />
      <Lottie
        loop
        animationData={pageNotFoundErrorAnimation}
        play
        className="w-1/2 h-1/2"
      />
    </div>
  );
};

export default PageNotFound;
