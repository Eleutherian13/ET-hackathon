import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { useWorkspace } from "../context/WorkspaceContext.jsx";
import ProfileDropdown from "./workspace/ProfileDropdown.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();
  const { toggleNotifications, unreadNotifications } = useWorkspace();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Compliance", path: "/compliance" },
    { name: "Schedule Risk", path: "/schedule" },
    { name: "RFI Intelligence", path: "/rfi" },
    { name: "Activity", path: "/activity" }
  ];

  return (
    <header 
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 flex items-center justify-between">
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <span className="text-white font-bold text-xs tracking-tighter">DC</span>
          </div>
          <span className="font-bold text-slate-800 tracking-tight text-lg hidden sm:block">
            DCPI Workspace
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center bg-white/50 backdrop-blur-md border border-slate-200 rounded-full px-2 py-1.5 shadow-sm">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-full shadow-sm"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${isActive ? 'text-teal-600' : 'text-slate-600 hover:text-slate-900'}`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors hidden sm:block">
            <Search size={20} />
          </button>

          <button 
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors relative"
          >
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
            )}
          </button>

          <div className="relative ml-2">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md transition-all hover:scale-105"
            >
              EK
            </button>
            <ProfileDropdown isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}
