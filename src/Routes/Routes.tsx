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
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import App from "./../App";

// Lazy Loaded Components
const LandingScreen = lazy(
  () => import("./../Pages/LandingScreen/LandingScreen")
);
const UploadPage = lazy(() => import("./../Pages/UploadData/UploadData"));
const DrawComponent = lazy(() => import("./../Pages/DrawPolygon/DrawPolygon"));
const PreviewData = lazy(() => import("./../Pages/PreviewData/PreviewData"));
const SuccessPage = lazy(() => import("../Pages/SuccessPage/SuccessPage"));
const PageNotFound = lazy(() => import("../Pages/PageNotFound/PageNotFound"));

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/upload-image" element={<UploadPage />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/draw" element={<DrawComponent />} />
      <Route path="/preview" element={<PreviewData />} />
      <Route path="/success" element={<SuccessPage />} />
    </Route>
  )
  // { basename: import.meta.env.DEV ? "/" : "/Pineapple/" }
);

export default Router;
