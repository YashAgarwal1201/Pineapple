// import React, { useState, useRef } from "react";
// import { Outlet } from "react-router-dom";
// import { Toast } from "primereact/toast";
// // import './App.css'
// import RoutesComponent from "./Routes/Routes";

// export function App() {
//   const myToast = useRef<Toast>(null);

//   return (
//     <div className="bg-red-500">
//       <RoutesComponent>
//         <Toast ref={myToast} />
//         <Outlet />
//       </RoutesComponent>
//     </div>
//   );
// }

// export default App;

import React, { useEffect, useRef } from "react";
// import { Outlet } from "react-router-dom";
import { Toast } from "primereact/toast";
import RoutesComponent from "./Routes/Routes";
import { useAppContext } from "./AppContext/AppContext";

export function App() {
  const myToast = useRef<Toast>(null);

  const { state, dispatch } = useAppContext();

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
      <RoutesComponent />
    </div>
  );
}

export default App;
