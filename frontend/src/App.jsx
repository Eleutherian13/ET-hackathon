import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Compliance from "./pages/Compliance.jsx";
import NCRDetail from "./pages/NCRDetail.jsx";
import Schedule from "./pages/Schedule.jsx";
import RFIChat from "./pages/RFIChat.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import ActivityCenter from "./pages/ActivityCenter.jsx";
import SplashScreen from "./components/splash/SplashScreen.jsx";
import PageTransition from "./components/PageTransition.jsx";

// Auth and Workspace Layout
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { WorkspaceProvider } from "./context/WorkspaceContext.jsx";
import LoginScreen from "./components/auth/LoginScreen.jsx";
import LogoutAnimation from "./components/auth/LogoutAnimation.jsx";
import NotificationDrawer from "./components/workspace/NotificationDrawer.jsx";

const SPLASH_DURATION_MS = 3000;
const SPLASH_SEEN_KEY = "dcpi_splash_seen";

// Animated routes — must be inside BrowserRouter
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/compliance" element={<PageTransition><Compliance /></PageTransition>} />
        <Route path="/ncr/:ncrId" element={<PageTransition><NCRDetail /></PageTransition>} />
        <Route path="/schedule" element={<PageTransition><Schedule /></PageTransition>} />
        <Route path="/rfi" element={<PageTransition><RFIChat /></PageTransition>} />
        <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        <Route path="/activity" element={<PageTransition><ActivityCenter /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

// Inner Application (Handles Auth Routing)
function ApplicationCore() {
  const { isAuthenticated, isLoggingOut } = useAuth();
  
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem(SPLASH_SEEN_KEY)
  );

  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
      setShowSplash(false);
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showSplash]);

  if (showSplash) {
    return (
      <AnimatePresence mode="sync">
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <motion.div
      key="workspace"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500"
    >
      <BrowserRouter>
        <div className="flex flex-col min-h-screen relative">
          <Navbar />
          <NotificationDrawer />
          {isLoggingOut && <LogoutAnimation />}
          
          <main className="flex-1 w-full">
            <AnimatedRoutes />
          </main>
        </div>
      </BrowserRouter>
    </motion.div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <ApplicationCore />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
