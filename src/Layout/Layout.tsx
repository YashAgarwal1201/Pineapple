import React from "react";

import { useLocation } from "react-router";

import Header from "../Components/Header/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <div className="block">
        {location.pathname !== "/" &&
        !location.pathname.includes("/success") ? (
          <Header />
        ) : (
          ""
        )}
      </div>
      {/* <div className="block md:hidden">
        <Header />
      </div> */}
      {children}
    </div>
  );
};

export default Layout;
