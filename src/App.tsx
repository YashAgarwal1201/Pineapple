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

import React, { useRef } from "react";
// import { Outlet } from "react-router-dom";
import { Toast } from "primereact/toast";
import RoutesComponent from "./Routes/Routes";

export function App() {
  const myToast = useRef(null);

  return (
    <div className="w-screen h-screen">
      <Toast ref={myToast} />
      <RoutesComponent />
    </div>
  );
}

export default App;
