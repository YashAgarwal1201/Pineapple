import { startTransition } from "react";

import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

const Header = ({
  setShowSidebar,
}: {
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();

  // const location = useLocation();
  const { pathname } = useLocation();

  return (
    <div className="w-full h-full p-1 flex flex-row md:flex-col justify-between items-center bg-metallic-brown rounded-br-2xl rounded-bl-2xl md:rounded-bl-none rounded-tr-none md:rounded-tr-2xl shadow-md">
      <Button
        disabled={pathname === "/"}
        icon={<ArrowLeft size={20} />}
        title="go back"
        className={`w-auto md:w-full h-full md:h-auto aspect-square rounded-2xl md:rounded-3xl ${
          pathname === "/"
            ? "text-transparent bg-transparent"
            : "text-naples-yellow "
        } border-0`}
        onClick={() => {
          if (pathname.includes("/upload-image")) {
            startTransition(() => {
              navigate("/");
            });
          } else if (pathname.includes("/draw")) {
            startTransition(() => {
              navigate("/upload-image");
            });
          } else if (pathname.includes("/preview")) {
            startTransition(() => {
              navigate("/draw");
            });
          } else if (pathname.includes("/cropped-data")) {
            startTransition(() => {
              navigate("/preview");
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
        // onClick={() => startTransition(() => navigate("./../"))}
      />

      <Button
        icon={<Menu size={20} />}
        className="w-auto md:w-full h-full md:h-auto aspect-square rounded-2xl md:rounded-3xl text-naples-yellow "
        onClick={() => setShowSidebar(true)}
      />
      {/* <a
        title="check developer profile"
        href={"https://yashagarwal1201.github.io/"}
        target="_blank"
        className="!h-8 !w-8 flex justify-center items-center bg-fern-green text-naples-yellow border-0 rounded-full"
      >
        <span className="pi pi-user text-sm"></span>
      </a> */}
    </div>
  );
};

export default Header;
