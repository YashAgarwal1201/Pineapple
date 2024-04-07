import { useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import { useAppContext } from "./Services/AppContext";
import { Outlet } from "react-router-dom";
import "./App.scss";

export function App() {
  const { state, dispatch } = useAppContext();
  const myToast = useRef<Toast>(null);

  useEffect(() => {
    dispatch?.({
      type: "SET_TOAST_REF",
      payload: myToast.current as Toast,
    });
  }, []);

  useEffect(() => {
    sessionStorage.setItem("pineappleState", JSON.stringify(state));
  }, [state]);

  return (
    <div className="w-screen h-[100dvh]">
      <Toast ref={myToast} />
      <Outlet />
    </div>
  );
}

export default App;
