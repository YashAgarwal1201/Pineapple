import React, { startTransition } from "react";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="w-full p-4 flex justify-between items-center bg-metallic-brown rounded-b-2xl shadow-md">
      <Button
        disabled={pathname === "/" || pathname.includes("/success")}
        icon="pi pi-angle-left"
        className={`${
          pathname === '/' || pathname.includes('/success')
            ? 'text-transparent bg-transparent'
            : 'text-naples-yellow bg-fern-green'
        } border-0 rounded-full`}
        onClick={() => {
          startTransition(() => {
            navigate('/')
          });
        }}
      />
      <h1 className="text-naples-yellow">PINEAPPLE</h1>
      <Button
      disabled={true}
        icon="pi pi-question"
        className="bg-fern-green text-naples-yellow border-0 rounded-full"
      />
    </div>
  );
};

export default Header;
