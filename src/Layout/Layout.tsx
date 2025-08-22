import React, { useState } from "react";

import { useLocation } from "react-router";

import Header from "../Components/Header/Header";
import MainSidebar from "../Components/Sidebar/Sidebar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="w-full h-full relative flex flex-col md:flex-row bg-ochre">
      <div className="block">
        {location.pathname !== "/" &&
        !location.pathname.includes("/success") ? (
          <div className="w-full md:w-[70px] h-[60px] md:h-full">
            <Header setShowSidebar={setShowSidebar} />
          </div>
        ) : (
          ""
        )}
      </div>
      <div
        className={`w-full ${
          location.pathname !== "/" && !location.pathname.includes("/success")
            ? "md:w-[calc(100%-70px)] h-[calc(100%-60px)] md:h-full"
            : "w-full h-full"
        } p-2 md:p-3 relative`}
      >
        {children}
      </div>
      <MainSidebar
        showMenuDialog={showSidebar}
        setShowMenuDialog={setShowSidebar}
      />
    </div>
  );
};

export default Layout;
