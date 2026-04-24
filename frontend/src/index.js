import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Toaster } from "react-hot-toast";
import axios from "axios";

axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "https://ccs-management-backend.vercel.app";

axios.defaults.headers.common["Accept"] = "application/json";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#333",
              color: "#fff",
            },
            success: {
              style: {
                background: "#10b981",
              },
            },
            error: {
              style: {
                background: "#ef4444",
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
