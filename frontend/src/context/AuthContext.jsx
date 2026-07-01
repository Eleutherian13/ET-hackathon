import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const AUTH_KEY = "dcpi_demo_auth";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  });
  
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(AUTH_KEY, isAuthenticated);
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  
  const logout = () => {
    setIsLoggingOut(true);
    // Fake the logout animation sequence, then clear state
    setTimeout(() => {
      setIsAuthenticated(false);
      setIsLoggingOut(false);
    }, 3000); // Wait 3 seconds for the exit sequence
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoggingOut, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
