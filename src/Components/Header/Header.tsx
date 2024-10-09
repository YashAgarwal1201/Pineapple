import { startTransition } from "react";
import { Button } from "primereact/button";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
        rounded
        className={`!w-8 !h-8 ${
          pathname === "/"
            ? "text-transparent bg-transparent"
            : "text-naples-yellow bg-fern-green"
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
      />
      {/* <h1 className="text-2xl text-naples-yellow font-heading">PINEAPPLE</h1> */}

      <Link
        title="check my profile"
        to={"https://yashagarwal1201.github.io/"}
        target="_blank"
        className="!h-8 !w-8 flex justify-center items-center bg-fern-green text-naples-yellow border-0 rounded-full"
      >
        <span className="pi pi-user text-sm"></span>
      </Link>
    </div>
  );
};

export default Header;
