// src/App.tsx
import { useEffect, useRef } from "react";

import { Toast } from "primereact/toast";
import { Outlet } from "react-router-dom";

import "./App.css";
import { usePineappleStore } from "./Services/zustand";

export function App() {
  const toastRef = useRef<Toast>(null);

  const setToastRef = usePineappleStore((state) => state.setToastRef);
  const loadSessionFromDb = usePineappleStore((state) => state.loadSessionFromDb);

  useEffect(() => {
    if (toastRef.current) {
      setToastRef(toastRef.current);
    }
    loadSessionFromDb();
  }, [setToastRef, loadSessionFromDb]);

  return (
    <div className="w-screen h-dvh bg-white dark:bg-black text-stone-700 dark:text-stone-300">
      <Toast ref={toastRef} position="top-left" />
      <Outlet />
    </div>
  );
}

export default App;
