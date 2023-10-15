// import React from "react";
import Header from "../../Components/Header/Header";
// import { Button } from "primereact/button";
import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";

const DrawPolygon = () => {
  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <Header />

      {/* <div className="h-full p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md relative"> */}
      <PolygonDrawer />
      {/* </div> */}
    </div>
  );
};

export default DrawPolygon;
