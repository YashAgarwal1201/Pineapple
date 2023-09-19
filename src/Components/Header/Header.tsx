import React from "react";
import { Button } from "primereact/button";

const Header = () => {
  return (
    <div className="w-full p-4 flex justify-between items-center bg-metallic-brown rounded-b-2xl">
      <Button icon='pi pi-angle-left' className="bg-fern-green text-naples-yellow border-0 rounded-full" />
      <h1 className="text-naples-yellow">PINEAPPLE</h1>
      <Button icon='pi pi-question' className="bg-fern-green text-naples-yellow border-0 rounded-full" />
    </div>
  );
};

export default Header;
