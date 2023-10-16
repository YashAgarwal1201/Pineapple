import { startTransition } from "react";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="w-full p-4 flex justify-between items-center bg-metallic-brown rounded-b-2xl shadow-md">
      <Button
        disabled={pathname === "/"}
        icon="pi pi-angle-left"
        title="go back button"
        className={`${
          pathname === "/"
            ? "text-transparent bg-transparent"
            : "text-naples-yellow bg-fern-green"
        } border-0 rounded-full`}
        onClick={() => {
          if (pathname.includes("/draw")) {
            startTransition(() => {
              navigate("/");
            });
          } else if (pathname.includes("/preview")) {
            startTransition(() => {
              navigate("/draw");
            });
          } else if (pathname.includes("/success")) {
            startTransition(() => {
              navigate("/preview");
            });
          } else {
            startTransition(() => {
              navigate("/");
            });
          }
        }}
      />
      <h1 className="text-2xl text-naples-yellow font-medium">PINEAPPLE</h1>
      <Button
        disabled={true}
        icon="pi pi-question"
        title="extra button"
        // className="bg-fern-green text-naples-yellow border-0 rounded-full"
        className={"text-transparent bg-transparent border-0 rounded-full"}
      />
    </div>
  );
};

export default Header;
