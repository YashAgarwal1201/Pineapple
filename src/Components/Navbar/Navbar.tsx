import { startTransition } from "react";

import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";

import { usePineappleStore } from "../../Services/zustand";

const Navbar = () => {
  const navigate = useNavigate();
  const { toggleSideMenu } = usePineappleStore();

  // const location = useLocation();
  const { pathname } = useLocation();

  return (
    <div className="w-full h-full p-1 flex flex-row md:flex-col justify-between items-center">
      <Button
        disabled={pathname === "/"}
        icon={<ArrowLeft size={20} />}
        title="go back"
        className={`!w-auto md:!w-full h-full md:h-auto aspect-square !rounded-2xl !border-none ${
          pathname === "/"
            ? "text-transparent bg-transparent"
            : "!bg-amber-400 hover:!bg-amber-500 !text-stone-900 dark:!bg-amber-500 dark:hover:!bg-amber-600 dark:!text-stone-900"
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
        className="!w-auto md:!w-full h-full md:h-auto aspect-square !border-none !rounded-2xl !bg-lime-500 hover:!bg-lime-600 !text-white dark:!bg-lime-600 dark:hover:!bg-lime-700 "
        onClick={() => toggleSideMenu()}
      />
    </div>
  );
};

export default Navbar;
