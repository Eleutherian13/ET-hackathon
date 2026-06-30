import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Compliance from "./pages/Compliance.jsx";
import NCRDetail from "./pages/NCRDetail.jsx";
import Schedule from "./pages/Schedule.jsx";
import RFIChat from "./pages/RFIChat.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/ncr/:ncrId" element={<NCRDetail />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/rfi" element={<RFIChat />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
