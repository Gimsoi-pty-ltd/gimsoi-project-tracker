import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function FocusNotification({ taskCount = 0 }) {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (taskCount > 0) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [taskCount]);

  if (!show || taskCount === 0) return null;

  const handleClick = () => {
    navigate("/tasks");
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShow(false);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 24,
        right: 24,
        zIndex: 9999,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff",
        padding: "16px 20px",
        borderRadius: 14,
        boxShadow: "0 8px 30px rgba(99,102,241,0.4)",
        cursor: "pointer",
        maxWidth: 320,
        fontFamily: "sans-serif",
        animation: "focusSlideIn 0.4s ease",
      }}
    >
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "rgba(255,255,255,0.2)",
          border: "none",
          color: "#fff",
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
        You have <strong>{taskCount}</strong> task{taskCount !== 1 ? "s" : ""} to focus on
      </div>
      <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
        Click to go to Tasks →
      </div>

      <style>{`
        @keyframes focusSlideIn {
          from { opacity: 0; transform: translateX(100px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}