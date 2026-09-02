// src/Routes/Routes.tsx
import { lazy } from "react";

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import App from "./../App";

// Lazy Loaded Components
const LandingScreen = lazy(
  () => import("./../Pages/LandingScreen/LandingScreen"),
);
const UploadChoice = lazy(() => import("./../Pages/UploadData/UploadChoice"));
const UploadFromScratch = lazy(
  () => import("./../Pages/UploadData/UploadData"),
);
const UploadImport = lazy(() => import("./../Pages/UploadData/UploadImport"));
const DrawComponent = lazy(() => import("./../Pages/DrawPolygon/DrawPolygon"));
const PreviewData = lazy(() => import("./../Pages/PreviewData/PreviewData"));
const SuccessPage = lazy(() => import("../Pages/SuccessPage/SuccessPage"));
const PageNotFound = lazy(() => import("../Pages/PageNotFound/PageNotFound"));
const Settings = lazy(() => import("../Pages/Settings/Settings"));

const Router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/upload-image" element={<UploadChoice />} />
      <Route path="/upload-image/scratch" element={<UploadFromScratch />} />
      <Route path="/upload-image/import" element={<UploadImport />} />
      <Route path="*" element={<PageNotFound />} />
      <Route path="/draw" element={<DrawComponent />} />
      <Route path="/preview" element={<PreviewData />} />
      <Route path="/success" element={<SuccessPage />} />
      <Route path="/settings" element={<Settings />} />
    </Route>,
  ),
  // { basename: import.meta.env.DEV ? "/" : "/Pineapple/" }
);

export default Router;
