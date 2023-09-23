// import React, { lazy } from "react";
// import {
//   Routes,
//   Route,
//   createBrowserRouter,
//   createRoutesFromChildren,
// } from "react-router-dom";
// import { App } from "./../App";

// const UploadPage = lazy(() => import("./../Pages/UploadData/UploadData"));
// const PageNotFound = lazy(() => import("./../Pages/PageNotFound/PageNotFound"));

// const RoutesComponent = createBrowserRouter(
//   createRoutesFromChildren(
//     // <Route>
//       <Route path="/" element={<App />}>
//         <Route path="/" element={<UploadPage />} />
//         <Route path="*" element={<PageNotFound />} />
//       </Route>
//     // </Route>
//   )
// );

// export default RoutesComponent;


import React, { lazy, memo } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { App } from "./../App";

const UploadPage = lazy(() => import("./../Pages/UploadData/UploadData"));
const PageNotFound = lazy(() => import("./../Pages/PageNotFound/PageNotFound"));

function RoutesComponent() {
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route path="/" element={<UploadPage />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
}

export default memo(RoutesComponent);
