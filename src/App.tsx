import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Database from "./pages/Database";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Database/>}/>
    </Routes>
  );
}