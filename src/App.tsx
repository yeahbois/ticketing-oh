import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Database from "./pages/Database";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Scan/>}/>
      <Route path="/database" element={<Database/>}/>
    </Routes>
  );
}