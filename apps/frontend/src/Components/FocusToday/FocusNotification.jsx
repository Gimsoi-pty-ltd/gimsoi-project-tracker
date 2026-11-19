import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function FocusNotification() {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();

  // Get logged in user role
  const user = useAuthStore((state) => state.user);
  const role = (user?.role || "").toString().toLowerCase();

  // HIDE for Admin, PM, Manager, and Client roles!
  const isHiddenRole = 
    role.includes("admin") || 
    role.includes("pm") || 
    role.includes("manager") || 
    role.includes("client") ||
    role.includes("lead");

  // Don't show if user closed it OR if they are Admin/PM/Client
  if (!show || isHiddenRole) return null;

  return (
    <div
      onClick={() => navigate("/tasks")}
      style={{
        position: "fixed",
        top: 80,
        right: 24,
        zIndex: 99999,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#ffffff",
        padding: "16px 20px",
        borderRadius: 14,
        boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        cursor: "pointer",
        width: 280,
        fontFamily: "sans-serif",
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShow(false);
        }}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(255,255,255,0.25)",
          border: "none",
          color: "#ffffff",
          borderRadius: "50%",
          width: 22,
          height: 22,
          cursor: "pointer",
          fontSize: 12,
          lineHeight: "22px",
          textAlign: "center",
          padding: 0,
        }}
      >
        ✕
      </button>

      <div style={{ fontSize: 22, marginBottom: 4 }}>🎯</div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>Focus Today</div>
      <div style={{ fontSize: 13, opacity: 0.9, marginTop: 2 }}>
        Click here to view your daily focus tasks
      </div>
      <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
        Go to Tasks →
      </div>
    </div>
  );
}