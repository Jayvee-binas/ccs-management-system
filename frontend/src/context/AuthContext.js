import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Configure axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get("/api/auth/me");
          if (response.data.success) {
            setUser({ ...response.data.user, token });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  // Student login
  const studentLogin = async (studentId, password) => {
    try {
      const response = await axios.post("/api/auth/student/login", {
        studentId,
        password,
      });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({ ...userData, token: newToken });
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Teacher login
  const teacherLogin = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/teacher/login", {
        email,
        password,
      });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({ ...userData, token: newToken });
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Admin login
  const adminLogin = async (username, password) => {
    try {
      const response = await axios.post("/api/auth/admin/login", {
        username,
        password,
      });
      if (response.data.success) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser({ ...userData, token: newToken });
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Try to call logout API, but don't wait for it
      const logoutPromise = axios.post("/api/auth/logout");

      // Clear local state immediately for better UX
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];

      // Handle API response asynchronously
      logoutPromise.catch((error) => {
        console.warn("Logout API call failed (non-critical):", error.message);
      });

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Unexpected logout error:", error);

      // Ensure local state is cleared even on error
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];

      toast.success("Logged out successfully");
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await axios.put("/api/auth/change-password", {
        currentPassword,
        newPassword,
      });
      if (response.data.success) {
        toast.success("Password changed successfully");
        return { success: true };
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to change password";
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    user,
    loading,
    token,
    studentLogin,
    teacherLogin,
    adminLogin,
    logout,
    changePassword,
    isAuthenticated: !!user,
    role: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
