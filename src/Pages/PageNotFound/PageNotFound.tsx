import { startTransition } from "react";
import Lottie from "react-lottie-player";
import pageNotFoundErrorAnimation from "./../../assets/Lottie/pageNotFoundErrorAnimation.json";
import { Button } from "primereact/button";

const PageNotFound = () => {
  const goBack = () => {
    window.history.back();
  };
  return (
    <div className="w-full h-full flex flex-col justify-center items-center bg-metallic-brown">
      <Button
        className="p-3 absolute top-2 left-2 hover:bg-fern-green bg-fern-green hover:text-naples-yellow text-naples-yellow border-0 rounded-full"
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
