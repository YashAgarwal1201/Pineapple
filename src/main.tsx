import ReactDOM from "react-dom/client";
import { AppContextProvider } from "./AppContext/AppContext.tsx";
import { RouterProvider } from "react-router-dom";
import Router from "./Routes/Routes.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <RouterProvider router={Router} />
  </AppContextProvider>
);
