// src/Layout/Layout.tsx
import React from "react";

import { ConfirmDialog } from "primereact/confirmdialog";
import { useLocation } from "react-router";

import FeedbackDialog from "../Components/FeedbackDialog/FeedbackDialog";
import Navbar from "../Components/Navbar/Navbar";
import MainSidebar from "../Components/Sidebar/Sidebar";
import ThemeProvider from "../Services/ThemeProvider";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <ThemeProvider>
      <ConfirmDialog />
      <div className="w-full h-full relative flex flex-col md:flex-row bg-white dark:bg-black text-stone-700 dark:text-stone-300">
        <div className="block flex-shrink-0">
          {location.pathname !== "/" && (
            // !location.pathname.includes("/success")
            <div className="w-full md:w-16 h-14 md:h-full flex-shrink-0">
              <Navbar />
            </div>
          )}
        </div>
        <div
          // className={`w-full ${
          //   location.pathname !== "/" && !location.pathname.includes("/success")
          //     ? "md:w-[calc(100%-70px)] h-[calc(100%-60px)] md:h-full"
          //     : "w-full h-full"
          // } p-2 md:p-3 relative`}
          className={`w-full flex-grow-1 overflow-y-auto p-2 md:p-3 relative`}
        >
          {children}
        </div>
        <MainSidebar />

        <FeedbackDialog />
      </div>
    </ThemeProvider>
  );
};

export default Layout;
