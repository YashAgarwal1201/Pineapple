import React from "react";

import { useLocation } from "react-router";

import Header from "../Components/Header/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col md:flex-row bg-ochre">
      <div className="block">
        {location.pathname !== "/" &&
        !location.pathname.includes("/success") ? (
          <div className="w-full md:w-[70px] h-[60px] md:h-full">
            <Header />
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
        } p-2 md:p-3`}
      >
        {children}
      </div>
    </div>
  );
};

export default Layout;
