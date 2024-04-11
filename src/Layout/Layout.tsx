import React from "react";
import Header from "../Components/Header/Header";
import { useLocation } from "react-router";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      {location.pathname !== "/" && !location.pathname.includes("/success") ? (
        <Header />
      ) : (
        ""
      )}
      {children}
    </div>
  );
};

export default Layout;
