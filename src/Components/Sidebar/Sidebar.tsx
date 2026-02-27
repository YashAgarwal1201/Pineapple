import React, { startTransition } from "react";

import { MessageCircleHeart, Palette, Share2, Trash } from "lucide-react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
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
import { useThemeStore } from "../../Services/themeStore";
import { usePineappleStore } from "../../Services/zustand";

const MainSidebar = () => {
  const navigate = useNavigate();

  const {
    setAnnotatedCanvasImage,
    setPolygons,
    setRectangles,
    setSelectedImage,
    showToast,
    isSideMenuOpen,
    closeSideMenu,
    openFeedbackDialog,
  } = usePineappleStore();

  const { theme, setTheme } = useThemeStore();

  const themeOptions = [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
  ];

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
        "Failed to delete data. See console for details",
      );
    }
  };

  return (
    <Sidebar
      visible={isSideMenuOpen}
      onHide={() => {
        closeSideMenu();
        // setOpenMenuPanel(-1); // Reset open panel on close
      }}
      dismissable
      draggable={false}
      header={
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-normal text-lime-700 dark:text-lime-400">
          More Options
        </h2>
      }
      className="side-menu !rounded-none md:!rounded-l-3xl !bg-white dark:!bg-black aboutDialog !w-full md:!w-[768px]"
      // class="!w-full md:!w-[768px] rounded-none md:!rounded-l-xl bg-stone-50 dark:bg-stone-900 font-content !text-green-700 dark:!text-green-300"
      position="right"
      maskClassName="backdrop-blur"
    >
      <div className="w-full px-4 py-4 bg-amber-50 dark:bg-stone-900 rounded-3xl overflow-y-auto text-stone-700 dark:text-stone-300 font-content">
        <div className="bg-transparent rounded-2xl py-4 px-2 flex items-center justify-between">
          <div className="cursor-pointer custom-panel-header w-full flex justify-between items-center rounded-xl">
            <h3 className="font-content font-medium text-base sm:text-lg text-stone-900 dark:text-white flex items-center">
              <Palette
                size={20}
                className="mr-4 text-lime-500 dark:text-lime-600"
              />
              Theme
            </h3>
          </div>
          <Dropdown
            value={theme}
            options={themeOptions}
            onChange={(e) => setTheme(e.value)}
            className="w-40 font-content py-1 px-2 !bg-transparent border !border-stone-200 dark:!border-stone-700 *:!text-gray-600 dark:*:!text-white *:text-sm !rounded-lg"
            panelClassName="p-2 mt-2 flex flex-col gap-y-2 !rounded-lg *:!rounded-lg *:font-content"
          />
        </div>

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-amber-200 dark:bg-amber-700" />

        <Button
          className="w-full !py-4 !px-2 !bg-transparent font-subcontent  text-base sm:text-lg !rounded-xl !border-none"
          onClick={() => {
            closeSideMenu();
            openFeedbackDialog();
          }}
        >
          <h3 className="font-content font-medium text-stone-900 dark:text-white flex items-center">
            <MessageCircleHeart
              size={20}
              className="mr-4 text-lime-500 dark:text-lime-600"
            />
            Feedback
          </h3>
        </Button>
        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-amber-200 dark:bg-amber-700" />
        <a
          href={import.meta.env.VITE_DEVELOPER_PROFILE ?? ""}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="w-full! block py-4 px-2 bg-transparent font-subcontent  text-base sm:text-lg text-color6 rounded-xl not-italic"
        >
          <h3 className="font-content font-medium flex items-center">
            <span className="pi pi-github mr-4 text-lime-500 dark:text-lime-600"></span>
            Developer Profile
          </h3>
        </a>

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-amber-200 dark:bg-amber-700" />

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
                  <Share2
                    size={20}
                    className="mr-4 text-lime-500 dark:text-lime-600"
                  />
                  Share
                </h3>

                <span
                  className={`pi ${
                    options.collapsed ? "pi-chevron-down" : "pi-chevron-up"
                  } text-amber-700 dark:text-amber-300 mr-1`}
                ></span>
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

        <div className="mx-2 my-1 p-0 max-w-full h-[1.5px] bg-amber-200 dark:bg-amber-700" />

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
                  <Trash
                    size={20}
                    className="mr-4 text-lime-500 dark:text-lime-600"
                  />
                  Clear Data
                </h3>

                <span
                  className={`pi ${
                    options.collapsed ? "pi-chevron-down" : "pi-chevron-up"
                  } text-amber-700 dark:text-amber-300 mr-1`}
                ></span>
              </div>
            );
          }}
          className="bg-transparent rounded-2xl"
          toggleable
          collapsed
        >
          <div className="flex justify-between flex-wrap items-center gap-3 font-content">
            <p>Do you want to clear your data? This action is irreversible</p>
            <Button
              className="!rounded-2xl py-2 px-4 flex justify-center items-center gap-x-2 bg-ochre text-naples-yellow"
              onClick={() => {
                deleteAllData();
              }}
            >
              <Trash size={16} />
              <span>Clear data</span>
            </Button>
          </div>
        </Panel>
      </div>
    </Sidebar>
  );
};

export default MainSidebar;
