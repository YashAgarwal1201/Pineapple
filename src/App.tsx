import { useState } from "react";
import Header from "./Components/Header/Header";
import UploadData from "./Pages/UploadData.tsx/UploadData";
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="bg-red-500">
      <Header />
      <UploadData />
    </div>
  );
}

export default App;
