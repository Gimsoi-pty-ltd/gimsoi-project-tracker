import React from "react";

export default function GimsoiSignOut() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eef1f4",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* OUTER CONTAINER */}
      <div
        style={{
          width: "420px",
          padding: "24px",
          borderRadius: "24px",
          backgroundColor: "#f7f8fa",
        }}
      >
        {/* INNER CARD */}
        <div
          style={{
            backgroundColor: "#f7f8fa",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginBottom: "24px",
            }}
          >
         <div
           style={{
             width: "40px",
             height: "40px",
             background: "linear-gradient(135deg, #ffffff00)",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
       }}
   >
         <img
           src="src/assets/icon.png"
           alt="Icon"
           style={{
             width: "50px",
             height: "50px",
             objectFit: "contain",
           }}
        />
</div>

            <div
              style={{
                fontSize: "18px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              
            </div>
          </div>

          {/* TITLE */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#1f2937",
              marginBottom: "12px",
            }}
          >
            Log out
          </div>

          {/* MESSAGE */}
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
              lineHeight: "1.5",
              marginBottom: "28px",
            }}
          >
            <div>Are you sure you want to log out?</div>
            <div>You can log back in anytime.</div>
          </div>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <button
              style={{
                height: "42px",
                borderRadius: "6px",
                border: "none",
                background:
                  "linear-gradient(135deg, #02186f)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              }}
            >
              Log out
            </button>

            <button
              style={{
                height: "42px",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                color: "#374151",
                fontSize: "12px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
