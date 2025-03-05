import { useEffect, useRef } from "react";

import { Toast } from "primereact/toast";
import { Outlet } from "react-router-dom";

// import { useAppContext } from "./Services/AppContext";
import "./App.scss";
import { usePineappleStore } from "./Services/zustand";

export function App() {
  const toastRef = useRef<Toast>(null);

  const setToastRef = usePineappleStore((state) => state.setToastRef);

  useEffect(() => {
    if (toastRef.current) {
      setToastRef(toastRef.current);
    }
  }, [setToastRef]);

  return (
    <div className="w-screen h-[100dvh]">
      <Toast ref={toastRef} />
      <Outlet />
    </div>
  );
}

export default App;
