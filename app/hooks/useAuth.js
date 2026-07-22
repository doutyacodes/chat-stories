// hooks/useAuth.js
import { useEffect, useState, useCallback } from "react";
import jwt from "jsonwebtoken";
import { useRouter } from "next/navigation";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error decoding token", error);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial check
    checkAuth();

    // Listen for same-tab auth changes (custom event)
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);

    // Listen for cross-tab storage changes
    const handleStorage = (e) => {
      if (e.key === "token") {
        checkAuth();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [checkAuth]);

  const logout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    window.dispatchEvent(new Event("auth-change")); // Notify all listeners
    setIsAuthenticated(false); // Update state
    router.replace("/login"); // Redirect to login page
  };

  return { isAuthenticated, loading, logout };
};

export default useAuth;
