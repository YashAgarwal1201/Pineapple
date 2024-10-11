import { Button } from "primereact/button";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  const { pathname } = location;

  return (
    <div className="w-full p-4 flex justify-between items-center bg-metallic-brown rounded-b-2xl shadow-md">
      <Button
        disabled={pathname === "/"}
        icon="pi pi-angle-left"
        title="go back"
        rounded
        className={`!w-8 !h-8 ${
          pathname === "/"
            ? "text-transparent bg-transparent"
            : "text-naples-yellow bg-fern-green"
        } border-0`}
        onClick={() => window.history.go(-1)}
      />

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
