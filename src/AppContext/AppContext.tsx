import React, { createContext, useReducer } from "react";

import { Toast } from "primereact/toast/toast";

import {
  Action,
  ActionType,
  AppContextType,
  State,
  Rectangle,
  Polygon,
} from "./../Interface/interfaces";

const initialState: State = sessionStorage.getItem("pineappleState")
  ? JSON.parse(sessionStorage.getItem("pineappleState") as string)
  : {
      isOptionSelected: null,
    //   client_id: "",
      imageSelected: {
        title: "",
        url: "",
        type: "",
      },
    //   csvSelected: {
    //     title: "",
    //     url: "",
    //   },
      toast: null,
      rectangles: [],
      polygons: [],
    };

const reducer = (state: State, action: Action<ActionType> | any): State => {
  // const { contextStateKey, payload } = (action?.payload as 'contextStateKey' | 'payload') ?? {};

  switch (action.type) {
    case "SET_TOAST_REF": {
      return { ...state, toast: action.payload as Toast };
    }

    // case "SET_CLIENT_ID": {
    //   return {
    //     ...state,
    //     client_id: action.payload as string,
    //   };
    // }

    case "SET_IS_OPTION_SELECTED": {
      return {
        ...state,
        isOptionSelected: action.payload as string,
      };
    }

    case "SET_SELECTED_IMAGE": {
      return {
        ...state,
        imageSelected: {
          ...state.imageSelected,
          title: action?.payload?.title,
          url: action?.payload?.url,
          type: action?.payload?.type,
        },
      };
    }

    // case "SET_SELECTED_CSV": {
    //   return {
    //     ...state,
    //     csvSelected: {
    //       ...state.csvSelected,
    //       title: action?.payload?.title,
    //       url: action?.payload?.url,
    //     },
    //   };
    // }

    case "SET_RECTANGLES": {
      return {
        ...state,
        rectangles: action.payload,
      };
    }

    case "SET_POLYGONS": {
      return {
        ...state,
        polygons: action.payload,
      };
    }

    default:
      return state;
  }
};

const AppContext = createContext<AppContextType>({
  state: initialState,
  dispatch: () => null,
  setRectangles: () => null,
  setPolygons: () => null,
//   setClientId: () => null,
  setSelectedImage: () => null,
//   setSelectedCSV: () => null,
  showToast: () => null,
});

const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

//   const setClientId = (client_id: string) => {
//     dispatch({
//       type: "SET_CLIENT_ID",
//       payload: { client_id },
//     });
//   };

  const setSelectedImage = (title: string, url: string, type: string) => {
    dispatch({
      type: "SET_SELECTED_IMAGE",
      payload: { title, url, type },
    });
  };

//   const setSelectedCSV = (title: string, url: string) => {
//     dispatch({
//       type: "SET_SELECTED_CSV",
//       payload: { title, url },
//     });
//   };

  const setRectangles = (newRectangles: Rectangle[]) => {
    dispatch({ type: "SET_RECTANGLES", payload: newRectangles });
  };

  const setPolygons = (newPolygons: Polygon[]) => {
    dispatch({ type: "SET_POLYGONS", payload: newPolygons });
  };

  const showToast = (
    severity: "success" | "info" | "warn" | "error" | undefined,
    summary: "Success" | "Info" | "Warning" | "Error",
    detail: string,
    life?: number
  ) => {
    // state.toast?.clear();
    state.toast?.show({ severity, summary, detail, life });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setRectangles,
    setPolygons,
    // setClientId,
    setSelectedImage,
    // setSelectedCSV,
    showToast,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

const useAppContext = () => {
  const context = React.useContext<AppContextType>(AppContext);

  if (context === undefined) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }

  return context;
};

export { AppContext, AppContextProvider, useAppContext };
