"use client";

import { motion } from "framer-motion";
import { Yard } from "@/data/yards";

interface YardPopupProps {
  yard: Yard;
  position: { x: number; y: number };
  onClose: () => void;
}

const SEVERITY_CONFIG = {
  critical: {
    bg: "var(--status-red-bg)",
    border: "var(--status-red-border)",
    color: "var(--status-red)",
    badge: "Critical",
    icon: "🔴",
  },
  warning: {
    bg: "var(--status-yellow-bg)",
    border: "var(--status-yellow-border)",
    color: "var(--status-yellow)",
    badge: "Warning",
    icon: "🟡",
  },
};

const TYPE_ICONS: Record<string, string> = {
  bottleneck: "🚧",
  detention: "⏰",
  trailer_pool: "📦",
  inventory: "❄️",
  trailer_detention: "🔗",
};

export default function YardPopup({ yard, position, onClose }: YardPopupProps) {
  const statusColor = yard.status === "red" ? "var(--status-red)" : "var(--status-yellow)";

  // Clamp position to keep popup visible
  const popupWidth = 340;
  const popupHeight = 200;
  const adjustedX = Math.min(Math.max(position.x - popupWidth / 2, 16), window.innerWidth * 0.75 - popupWidth - 16);
  const adjustedY = position.y > popupHeight + 60 ? position.y - popupHeight - 20 : position.y + 20;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
        }}
      />

      {/* Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ type: "spring", stiffness: 500, damping: 35 }}
        style={{
          position: "absolute",
          left: adjustedX,
          top: adjustedY,
          width: popupWidth,
          zIndex: 51,
          borderRadius: "var(--radius-lg)",
          backgroundColor: "var(--bg-tooltip)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
          overflow: "hidden",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px 12px",
            borderBottom: "1px solid var(--border-secondary)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: statusColor,
                  boxShadow: `0 0 8px ${statusColor}60`,
                }}
              />
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  margin: 0,
                }}
              >
                {yard.name}
              </h3>
            </div>
            <p style={{ fontSize: 12, color: "var(--text-tertiary)", margin: 0 }}>
              {yard.city}, {yard.state}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: "none",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Issues */}
        <div style={{ padding: "12px 18px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
          {yard.issues.map((issue, index) => {
            const config = SEVERITY_CONFIG[issue.severity];
            const typeIcon = TYPE_ICONS[issue.type] || "⚠️";

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: config.bg,
                  border: `1px solid ${config.border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{typeIcon}</span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: config.color,
                    }}
                  >
                    {issue.title}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: `${config.color}20`,
                      color: config.color,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginLeft: "auto",
                    }}
                  >
                    {config.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 11.5,
                    lineHeight: 1.5,
                    color: "var(--text-secondary)",
                    margin: 0,
                  }}
                >
                  {issue.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
