import React from "react";
import Header from "../Components/Header/Header";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-[100dvh] relative flex flex-col bg-ochre">
      <Header />
      {children}
    </div>
  );
};

export default Layout;
