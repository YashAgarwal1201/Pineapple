import { startTransition, useEffect, useState } from "react";

import { Trash, X } from "lucide-react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";

import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";
import Layout from "../../Layout/Layout";
// import { useAppContext } from "../../Services/AppContext";
import { usePineappleStore } from "../../Services/zustand";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

// import "./DrawPolygon.scss";

const DrawPolygon = () => {
  const navigate = useNavigate();

  // const { state, setPolygons, showToast } = useAppContext();
  const state = usePineappleStore();
  const { setPolygons, showToast } = state;

  const [loading, setLoading] = useState<boolean>(false);
  const [showListOfPolygons, setShowListOfPolygons] = useState<boolean>(false);
  const [editLabel, setEditLabel] = useState<number | null>(null);
  const [editedLabel, setEditedLabel] = useState<string>("");

  useEffect(() => {
    if (state.imageSelected.url === "") {
      setLoading(true);
      setTimeout(() => startTransition(() => navigate("/")), 750);
    } else {
      setLoading(false);
    }
  }, []);

  const handleDeletePolygon = (index: number) => {
    const updatedPolygons = [...state.polygons];
    updatedPolygons.splice(index, 1);
    setPolygons(updatedPolygons);
    showToast("warn", "Warning", "Polygon deleted");
  };

  // Enable Edit for Polygon Lable
  const handleEditLabel = (index: number) => {
    setEditLabel(index);
    setEditedLabel(state.polygons[index].label);
  };

  // Save new Polygon Label
  const handleSaveLabel = () => {
    if (editLabel !== null && editedLabel.trim() !== "") {
      const updatedPolygons = [...state.polygons];
      updatedPolygons[editLabel].label = editedLabel?.trim();
      setPolygons(updatedPolygons);
      showToast("success", "Success", "Label Updated");
    }
    setEditLabel(null);
  };

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
        <PolygonDrawer setShowListOfPolygons={setShowListOfPolygons} />
      )}

      <Sidebar
        visible={showListOfPolygons}
        onHide={() => setShowListOfPolygons(false)}
        dismissable
        header={
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-naples-yellow">
            Polygons
          </h2>
        }
        className="polygon-list-sidebar side-menu rounded-none md:rounded-r-3xl bg-metallic-brown aboutDialog w-full md:w-[768px]"
        position="left"
        closeIcon={
          <span className=" text-naples-yellow">
            <X size={16} />
          </span>
        }
        maskClassName="backdrop-blur"
      >
        <div className="w-full px-4 py-4 text-fern-green bg-naples-yellow rounded-3xl overflow-y-auto">
          {state.polygons.length > 0 ? (
            state.polygons?.map((polygon, index) => (
              <div className="mb-2" key={index}>
                <Panel
                  className="w-full bg-transparent rounded-2xl"
                  collapsed={true}
                  headerTemplate={(options) => {
                    const togglePanel = (
                      event: React.MouseEvent<HTMLElement>
                    ) => {
                      options.onTogglerClick!(event); // Trigger expand/collapse behavior
                    };

                    return (
                      <div
                        className="cursor-pointer custom-panel-header w-full flex justify-between items-center px-2 py-4 rounded-xl"
                        onClick={togglePanel}
                      >
                        <span className="text-base sm:text-lg font-heading">
                          {polygon?.label}
                        </span>
                        <Button
                          onClick={() => handleDeletePolygon(index)}
                          className="p-2 text-sm flex items-center justify-center gap-2 bg-fern-green text-naples-yellow aspect-square border-0 rounded-full"
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    );
                  }}
                  toggleable
                >
                  <div className="w-full flex flex-col gap-3 font-content">
                    {editLabel === index ? (
                      <p className="text-fern-green">
                        Enter new label for the polygon
                      </p>
                    ) : (
                      <p className="text-fern-green font-medium">
                        Change the label of polygon
                      </p>
                    )}
                    <div className="w-full h-fit text-sm sm:text-base flex flex-col justify-center xs:flex-row items-end xs:items-center gap-4">
                      <InputText
                        value={
                          editLabel !== index ? polygon?.label : editedLabel
                        }
                        readOnly={editLabel !== index}
                        className="h-10 w-full xs:w-[calc(100%-2.5rem)] rounded-full px-4 py-2 font-content bg-naples-yellow border xs:border-2 border-fern-green focus-visible:border-bud-green text-metallic-brown"
                        onChange={(e) => setEditedLabel(e.target?.value)}
                      />
                      {editLabel === index ? (
                        <Button
                          icon="pi pi-check"
                          // label="Save Label"
                          className="w-10 h-10 rounded-full bg-fern-green text-naples-yellow border-fern-green"
                          onClick={handleSaveLabel}
                        />
                      ) : (
                        <Button
                          icon="pi pi-pencil"
                          // label="Edit Label"
                          className="w-10 h-10 rounded-full bg-fern-green text-naples-yellow border-fern-green"
                          onClick={() => handleEditLabel(index)}
                        />
                      )}
                    </div>
                  </div>
                </Panel>

                {index !== state.polygons?.length - 1 && (
                  <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />
                )}
              </div>
            ))
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-center h-[40px] text-naples-yellow font-content text-base xs:text-lg md:text-xl  my-auto">
                No data to display
              </p>
            </div>
          )}
        </div>
      </Sidebar>
    </Layout>
  );
};

export default DrawPolygon;
