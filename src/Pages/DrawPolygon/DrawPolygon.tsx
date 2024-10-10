import { startTransition, useEffect, useState } from "react";

import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import Lottie from "react-lottie-player";
import { useNavigate } from "react-router-dom";

import PolygonDrawer from "../../Components/PolygonDrawer/PolygonDrawer";
import Layout from "../../Layout/Layout";
import { useAppContext } from "../../Services/AppContext";
import loadingDotsAnimation from "./../../assets/Lottie/loadingDotsAnimation.json";

import "./DrawPolygon.scss";

const DrawPolygon = () => {
  const navigate = useNavigate();
  // const { state } = useAppContext();
  const { state, setPolygons, showToast } = useAppContext();

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
        position="left"
        className="polygon-list-sidebar w-full sm:w-2/3"
        maskClassName="backdrop-blur"
      >
        <div className="w-full h-full rounded-lg bg-metallic-brown p-2 xs:p-3 sm:p-4">
          {state.polygons?.map((polygon, index) => (
            <div className="mb-2" key={index}>
              <Panel
                className="annotationPanel w-full mb-1"
                collapsed={true}
                header={
                  <div className="w-full h-full flex justify-between items-center">
                    <span className="text-base sm:text-lg text-metallic-brown">
                      {polygon?.label}
                    </span>
                    <Button
                      icon="pi pi-trash"
                      onClick={() => handleDeletePolygon(index)}
                      className="p-2 text-sm bg-transparent text-metallic-brown border-0 rounded-full"
                    />
                  </div>
                }
                collapseIcon={
                  <span className="pi pi-chevron-up p-2 text-sm bg-transparent text-metallic-brown border-0 rounded-full"></span>
                }
                expandIcon={
                  <span className="pi pi-chevron-down p-2 text-sm bg-transparent text-metallic-brown border-0 rounded-full"></span>
                }
                toggleable
              >
                <div className="w-full flex items-center gap-4">
                  <div className="w-full h-fit xs:h-9 sm:h-10 text-sm sm:text-base flex flex-col justify-center xs:flex-row items-end xs:items-center gap-4">
                    <InputText
                      value={editLabel !== index ? polygon?.label : editedLabel}
                      readOnly={editLabel !== index}
                      className="h-full w-full xs:w-3/4 bg-naples-yellow border-2 border-bud-green text-metallic-brown"
                      onChange={(e) => setEditedLabel(e.target?.value)}
                    />
                    {editLabel === index ? (
                      <Button
                        icon="pi pi-check"
                        label="Save Label"
                        className="w-fit xs:w-1/4 h-full bg-fern-green text-naples-yellow border-fern-green"
                        onClick={handleSaveLabel}
                      />
                    ) : (
                      <Button
                        icon="pi pi-pencil"
                        label="Edit Label"
                        className="w-fit xs:w-1/4 h-full bg-fern-green text-naples-yellow border-fern-green"
                        onClick={() => handleEditLabel(index)}
                      />
                    )}
                  </div>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </Sidebar>
    </Layout>
  );
};

export default DrawPolygon;
