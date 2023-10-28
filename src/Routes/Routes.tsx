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

// import React, { lazy, memo } from "react";
// import { Routes, Route, Outlet, BrowserRouter } from "react-router-dom";
// import { App } from "./../App";

// const UploadPage = lazy(() => import("./../Pages/UploadData/UploadData"));
// const DrawComponent = lazy(() => import("./../Pages/DrawPolygon/DrawPolygon"));
// const SuccessPage = lazy(() => import('./../Pages/SuccessPage/SuccessPage'))
// const PageNotFound = lazy(() => import("./../Pages/PageNotFound/PageNotFound"));

// function RoutesComponent() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={<Outlet />}>
//           <Route path="/" element={<UploadPage />} />
//           <Route path="/draw" element={<DrawComponent />} />
//           <Route path='/success' element={<SuccessPage />} />
//           <Route path="*" element={<PageNotFound />} />
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default memo(RoutesComponent);

import { lazy } from "react";

import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import App from "./../App";

// Lazy Loaded Components
const UploadPage = lazy(() => import("./../Pages/UploadData/UploadData"));
const DrawComponent = lazy(() => import("./../Pages/DrawPolygon/DrawPolygon"));
const PreviewData = lazy(() => import("./../Pages/PreviewData/PreviewData"));
const CroppedData = lazy(() => import("./../Pages/CroppedData/CroppedData"));
const SuccessPage = lazy(() => import("../Pages/SuccessPage/SuccessPage"));
const PageNotFound = lazy(() => import("../Pages/PageNotFound/PageNotFound"));

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<UploadPage />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/draw" element={<DrawComponent />} />
      <Route path="/preview" element={<PreviewData />} />
      <Route path="/cropped-data" element={<CroppedData />} />
      <Route path="/success" element={<SuccessPage />} />
    </Route>
  ),{ basename: import.meta.env.DEV ? '/' : '/Pineapple/' }
);

export default Router;
