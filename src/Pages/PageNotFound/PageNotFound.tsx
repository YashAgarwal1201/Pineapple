// src/Pages/PageNotFound/PageNotFound.tsx
import Layout from "../../Layout/Layout";
import EmptyBox from "./../../assets/EmptyBox.svg";

const PageNotFound = () => {
  return (
    <Layout>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <img src={EmptyBox} alt="" />
        <p className="font-heading text-xl sm:text-2xl text-center text-metallic-brown">
          Page not found
        </p>
      </div>
    </Layout>
  );
};

export default PageNotFound;
