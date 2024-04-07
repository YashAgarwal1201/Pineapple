import { startTransition, useEffect, useState } from "react";
import { useAppContext } from "../../Services/AppContext";
import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";
import Layout from "../../Layout/Layout";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie-player";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

const DrawPolygon = () => {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => startTransition(() => navigate("/")), 750);
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <Layout>
      {loading ? (
        <div className="w-full h-full p-3 flex flex-col justify-center items-center gap-y-3">
          <Lottie
            loop
            animationData={loadingDotsAnimation}
            play
            className="w-1/2 h-fit"
          />
          <p className="font-heading text-xl sm:text-2xl text-center text-metallic-brown">
            No image found. Navigating to home page.
          </p>
        </div>
      ) : (
        <PolygonDrawer />
      )}
    </Layout>
  );
};

export default DrawPolygon;
