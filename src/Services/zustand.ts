import { create } from "zustand";

const useStore = create((set) => ({
  imageSelected: {
    title: "",
    url: "",
    type: "",
  },
  setImageSelected: (title: string, url: string, type: string) =>
    set({ imageSelected: { title: title, url: url, type: type } }),
}));

export default useStore;
