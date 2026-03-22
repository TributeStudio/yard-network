"use client";

import { motion } from "framer-motion";
import { SimulationId } from "@/data/simulations";

interface HeaderProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  counts: { green: number; yellow: number; red: number };
  activeSimulation: SimulationId;
}

export default function Header({ theme, toggleTheme, counts, activeSimulation }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 60,
        borderBottom: "1px solid var(--border-primary)",
        backgroundColor: "var(--bg-card)",
        transition: "all var(--transition-base)",
        position: "relative",
        zIndex: 10,
      }}
    >
      {/* Left: Logo + Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 33 33" fill="none">
                <path d="M7 18 C10 18, 12 16, 14 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M14 22 C14 18, 14 16, 14 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M14 14 C16 12, 19 12, 22 14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M22 14 L26 18" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="7" cy="18" r="2" fill="white"/>
                <circle cx="14" cy="22" r="2" fill="white"/>
                <circle cx="14" cy="14" r="2.25" fill="white"/>
                <circle cx="26" cy="18" r="2" fill="white"/>
                <circle cx="16" cy="16" r="14.5" stroke="white" strokeWidth="1" opacity="0.35" fill="none"/>
              </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              YardFlow
            </div>
          </div>
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border-primary)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)", fontWeight: 500 }}>
            Yard Network System
          </span>
          {activeSimulation !== "current" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: 100,
                backgroundColor: "var(--accent-primary-bg)",
                color: "var(--accent-primary)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              Simulation Active
            </motion.span>
          )}
        </div>
      </div>

      {/* Right: Status + Theme */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Mini status chips */}
        <div style={{ display: "flex", gap: 8 }}>
          <StatusChip count={counts.green + counts.yellow + counts.red} label="Sites" />
          <StatusChip count={counts.red} label="Critical" color="var(--status-red)" />
        </div>

        <div style={{ width: 1, height: 24, backgroundColor: "var(--border-primary)" }} />

        {/* Live indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: activeSimulation === "current" ? "var(--status-green)" : "var(--accent-primary)",
              boxShadow: activeSimulation === "current"
                ? "0 0 8px rgba(34, 197, 94, 0.5)"
                : "0 0 8px rgba(37, 99, 235, 0.5)",
              animation: activeSimulation === "current" ? "svg-pulse-green 2s ease-in-out infinite" : undefined,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-tertiary)" }}>
            {activeSimulation === "current" ? "Live" : "Simulating"}
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: 36,
            height: 36,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-primary)",
            backgroundColor: "var(--bg-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all var(--transition-fast)",
            color: "var(--text-secondary)",
          }}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

function StatusChip({ count, label, color }: { count: number; label: string; color?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 100,
        backgroundColor: "var(--bg-tertiary)",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: color || "var(--text-primary)",
        }}
      >
        {count}
      </span>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
    </div>
  );
}
