import React from "react";
import Header from "../../Components/Header/Header";
import { Button } from "primereact/button";

const UploadData = () => {
  return (
    <div className="h-screen bg-ochre">
      <Header />

      <div className="h-full p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md">
        <div className="w-2/3 sm:w-1/3 aspect-square p-3 border-2 border-dashed border-naples-yellow rounded-lg cursor-pointer">
          <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 bg-naples-yellow rounded-md">
            <span className="pi pi-image p-4 text-4xl text-metallic-brown bg-bud-green rounded-md"></span>
            <span className="text-lg text-metallic-brown font-medium">Upload File</span>
          </div>
        </div>
        <div className="w-full h-10 flex justify-center items-center gap-x-5">
          <Button
            icon="pi pi-trash"
            label="Remove Image"
            title="Click to remove the selected image"
            // className="h-full text-metallic-brown bg-ochre border-0"
            className="h-full text-naples-yellow bg-metallic-brown border-naples-yellow"
          />
          <Button
            icon="pi pi-upload"
            label="Upload & Continue"
            title="Click to upload and continue"
            className="h-full text-metallic-brown bg-naples-yellow border-naples-yellow"
          />
        </div>
      </div>
    </div>
  );
};

export default UploadData;
