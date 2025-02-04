import React from "react";

import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { Sidebar } from "primereact/sidebar";
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

// import { themes } from "../../Data/Data";
import { useAppContext } from "../../Services/AppContext";
// import { useMsgAppContext } from "../../Services/MessagesContextAndInterfaces/MessagesContext";
// import KeyboardShortcuts from "../KeyboardShortcuts/KeyboardShortcuts";
import "./Sidebar.scss";

type MenuDialogProps = {
  // openMenuPanel: number;
  // setOpenMenuPanel: React.Dispatch<React.SetStateAction<number>>;
  showMenuDialog: boolean;
  setShowMenuDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

const MainSidebar = ({
  showMenuDialog,
  // openMenuPanel,
  // setOpenMenuPanel,
  setShowMenuDialog,
}: MenuDialogProps) => {
  const { showToast } = useAppContext();

  const shareUrl = window.location.href;
  const shareText = "Check out this website!";

  // const handlePanelToggle = (index: number) => {
  //   setOpenMenuPanel((prevIndex) => (prevIndex === index ? -1 : index));
  // };

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
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal">
          More Options
        </h2>
      }
      className="side-menu aboutDialog min-w-fit w-full lg:w-1/2 h-full"
      position="right"
    >
      <div className="w-full px-4 py-4 text-color5 bg-color2 rounded-3xl overflow-y-auto">
        {/* Resume Download Panel */}
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
                <h3 className="font-subheading font-medium text-lg sm:text-xl text-color5 flex items-center">
                  <span className="pi pi-id-card mr-4"></span>
                  View My Resume
                </h3>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          // collapsed={openMenuPanel !== 3}
          // onToggle={() => handlePanelToggle(3)}
        >
          <div className="flex justify-between">
            <span>Download my resume:</span>
            <Button icon="pi pi-download" label="Download" />
          </div>
        </Panel>

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-color4" />

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
                <h3 className="font-subheading font-medium text-lg sm:text-xl text-color5 flex items-center">
                  <span className="pi pi-share-alt mr-4"></span>
                  Share
                </h3>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          // collapsed={openMenuPanel !== 5}
          // onToggle={() => handlePanelToggle(5)}
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

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-color4" />

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
                <h3 className="font-subheading font-medium text-lg sm:text-xl text-color5 flex items-center">
                  <span className="pi pi-trash mr-4"></span>
                  Clear Data
                </h3>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          // collapsed={openMenuPanel !== 5}
          // onToggle={() => handlePanelToggle(5)}
        >
          <Button
            icon="pi pi-trash"
            label="Clear Data"
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              showToast("info", "Info", "All data has been cleared");
            }}
          />
        </Panel>
      </div>
    </Sidebar>
  );
};

export default MainSidebar;
