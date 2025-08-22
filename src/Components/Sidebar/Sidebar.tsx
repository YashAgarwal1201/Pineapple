import React, { startTransition } from "react";

import { X } from "lucide-react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
import { useNavigate } from "react-router-dom";
import {
  EmailIcon,
  EmailShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";

import "./Sidebar.scss";
import { usePineappleStore } from "../../Services/zustand";

type MenuDialogProps = {
  showMenuDialog: boolean;
  setShowMenuDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

const MainSidebar = ({
  showMenuDialog,
  setShowMenuDialog,
}: MenuDialogProps) => {
  const navigate = useNavigate();

  const {
    setAnnotatedCanvasImage,
    setPolygons,
    setRectangles,
    setSelectedImage,
    showToast,
  } = usePineappleStore();

  const shareUrl = window.location.href;
  const shareText = "Check out this website!";

  const deleteAllData = () => {
    try {
      // Clear session storage
      sessionStorage.removeItem("pineapple-storage");

      // Reset all states to their initial values
      setSelectedImage("", "", "");
      setRectangles([]);
      setPolygons([]);
      setAnnotatedCanvasImage(null);

      // Show success toast
      showToast("success", "Success", "All data has been deleted successfully");

      startTransition(() => {
        navigate("/");
      });

      console.log("All application data has been deleted");
    } catch (error) {
      console.error("Error deleting data:", error);
      showToast(
        "error",
        "Error",
        "Failed to delete data. See console for details"
      );
    }
  };

  return (
    <Sidebar
      visible={showMenuDialog}
      onHide={() => {
        setShowMenuDialog(false);
        // setOpenMenuPanel(-1); // Reset open panel on close
      }}
      dismissable
      draggable={false}
      header={
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-naples-yellow">
          More Options
        </h2>
      }
      className="side-menu rounded-none md:rounded-l-3xl bg-metallic-brown aboutDialog !w-full md:!w-[768px]"
      // class="!w-full md:!w-[768px] rounded-none md:!rounded-l-xl bg-stone-50 dark:bg-stone-900 font-content !text-green-700 dark:!text-green-300"
      position="right"
      closeIcon={
        <span className=" text-naples-yellow">
          <X size={16} />
        </span>
      }
      maskClassName="backdrop-blur"
    >
      <div className="w-full px-4 py-4 text-fern-green bg-naples-yellow rounded-3xl overflow-y-auto">
        <a
          href="https://yashagarwal1201.github.io/"
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="!w-full block py-4 px-2 bg-transparent font-subcontent  text-base sm:text-lg text-color6 rounded-xl not-italic"
        >
          <h3 className="font-content font-medium flex items-center">
            <span className="pi pi-github mr-4"></span>
            Developer Profile
          </h3>
        </a>

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />

        {/* Share Page Panel */}
        <Panel
          headerTemplate={(options) => {
            const togglePanel = (event: React.MouseEvent<HTMLElement>) => {
              options.onTogglerClick!(event); // Trigger expand/collapse behavior
            };

            return (
              <div
                className="cursor-pointer custom-panel-header w-full flex justify-between items-center px-2 py-4 rounded-xl"
                onClick={togglePanel}
              >
                <h3 className="font-content font-medium text-color5 flex items-center">
                  <span className="pi pi-share-alt mr-4"></span>
                  Share
                </h3>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          collapsed
        >
          <div className="flex justify-center items-center gap-4">
            {/* WhatsApp */}
            <WhatsappShareButton url={shareUrl} title={shareText}>
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>

            {/* LinkedIn */}
            <LinkedinShareButton url={shareUrl}>
              <LinkedinIcon size={40} round />
            </LinkedinShareButton>

            {/* Reddit */}
            <RedditShareButton url={shareUrl} title={shareText}>
              <RedditIcon size={40} round />
            </RedditShareButton>

            {/* Telegram */}
            <TelegramShareButton url={shareUrl} title={shareText}>
              <TelegramIcon size={40} round />
            </TelegramShareButton>

            {/* Email */}
            <EmailShareButton
              url={shareUrl}
              subject="Check out this site"
              body={shareText}
            >
              <EmailIcon size={40} round />
            </EmailShareButton>
          </div>
        </Panel>

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-ochre" />

        {/* Clear Data Panel */}
        <Panel
          headerTemplate={(options) => {
            const togglePanel = (event: React.MouseEvent<HTMLElement>) => {
              options.onTogglerClick!(event); // Trigger expand/collapse behavior
            };

            return (
              <div
                className="cursor-pointer custom-panel-header w-full flex justify-between items-center px-2 py-4 rounded-xl"
                onClick={togglePanel}
              >
                <h3 className="font-content font-medium text-color5 flex items-center">
                  <span className="pi pi-trash mr-4"></span>
                  Clear Data
                </h3>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          collapsed
        >
          <div className="flex justify-between flex-wrap items-center gap-3">
            <p>Do you want to clear your data?</p>
            <Button
              icon="pi pi-trash"
              label="Clear Data"
              className="rounded-full py-2 px-4 flex justify-center items-center gap-x-2 bg-ochre text-naples-yellow"
              onClick={() => {
                deleteAllData();
              }}
            />
          </div>
        </Panel>
      </div>
    </Sidebar>
  );
};

export default MainSidebar;
