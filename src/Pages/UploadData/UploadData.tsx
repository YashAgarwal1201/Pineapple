import { startTransition, useState } from "react";
import Header from "../../Components/Header/Header";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../AppContext/AppContext";

const UploadData = () => {
  const navigate = useNavigate();
  const { state, showToast, setSelectedImage } = useAppContext();

  // const [loader, setLoader] = useState(false)

  const uploadHandeler = () => {
    const input = document.createElement("input");

    input.setAttribute("accept", "image/*");
    // input.setAttribute('capture', 'user');

    // input.setAttribute('accept', acceptType === 'rackImage' ? 'image/*' : '.csv, text/csv, application/vnd.ms-excel');
    input.type = "file";
    input.onchange = async () => {
      if (input.files && input.files[0]) {
        const selectedFile = input.files[0];

        if (selectedFile?.type?.includes("image")) {
          // await setSelectedImage(
          // 	selectedFile.name, // Set the image title to the file name
          // 	URL.createObjectURL(selectedFile),
          // 	selectedFile.type
          // );
          const reader = new FileReader();
          reader.onload = async (e) => {
            const base64Data = e.target?.result as string; // Base64-encoded image data
            await setSelectedImage(
              selectedFile.name, // Set the image title to the file name
              base64Data,
              selectedFile.type
            );
            showToast(
              "success",
              "Success",
              "Rack image uploaded successfully!"
            );
          };
          reader.readAsDataURL(selectedFile);
        } else {
          showToast(
            "error",
            "Error",
            "Either wrong file is selected or there's some issue"
          );
        }
        // onHide(!visible);
      }
    };
    input.click();
  };

  const removeHandeler = () => {
    //
    showToast("warn", "Warning", "Image removed");
    setSelectedImage("", "", "");
  };

  const saveAndContinueHandeler = () => {
    if (state.imageSelected.url !== "") {
      showToast("success", "Success", "Data saved");
      startTransition(() => {
        navigate("/draw");
      });
    }
  };

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <Header />

      <div className="h-full p-3 m-3 flex flex-col justify-around items-center bg-metallic-brown rounded-lg shadow-md">
        <div
          className="w-56 sm:w-60 aspect-square p-3 border-2 border-dashed border-naples-yellow rounded-lg cursor-pointer"
          onClick={() => state.imageSelected.url === "" && uploadHandeler()}
        >
          <div className="w-full h-full flex flex-col justify-center items-center gap-y-4 bg-naples-yellow rounded-md">
            {state.imageSelected.url === "" && (
              <span className="pi pi-image p-4 text-4xl text-metallic-brown bg-bud-green rounded-md"></span>
            )}
            <span className="text-lg text-metallic-brown font-medium">
              {state.imageSelected.url === "" ? "Upload File" : "Selected File"}
            </span>
            {state.imageSelected.url !== "" && (
              <div className="p-2 relative">
                <img
                  src={state.imageSelected.url}
                  alt="selected file"
                  className="rounded-md shadow-md"
                />
                <Button
                  icon="pi pi-minus"
                  className="absolute top-0.5 right-0.5 !w-[16px] !h-[16px] !p-[12px] bg-metallic-brown text-naples-yellow !text-xs border-2 border-naples-yellow rounded-full"
                  type="button"
                  title="Click to remove this file"
                  onClick={() => {
                    showToast("warn", "Warning", "Image removed");
                    setSelectedImage("", "", "");
                  }}
                />
              </div>
            )}
          </div>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-center items-center gap-x-5 gap-y-3">
          <Button
            disabled={state.imageSelected.url === ""}
            icon="pi pi-trash"
            label="Remove Image"
            title="Click to remove the selected image"
            // className="h-full text-metallic-brown bg-ochre border-0"
            className="h-10 text-naples-yellow bg-metallic-brown border-2 border-naples-yellow"
            onClick={() => removeHandeler()}
          />
          <Button
            disabled={state.imageSelected.url === ""}
            icon="pi pi-check"
            label="Save & Continue"
            title="Click to save and continue"
            className="h-10 text-metallic-brown bg-naples-yellow border-naples-yellow"
            onClick={() => saveAndContinueHandeler()}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadData;
