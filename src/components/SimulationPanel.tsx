"use client";

import { motion } from "framer-motion";
import { SimulationId, SIMULATION_DATA } from "@/data/simulations";

interface SimulationPanelProps {
  activeSimulation: SimulationId;
  onSelectSimulation: (id: SimulationId) => void;
}

const SIMULATION_ORDER: SimulationId[] = [
  "current",
  "demand_plus_10",
  "demand_minus_10",
  "northeast_weather",
  "hurricane",
];

const SIMULATION_COLORS: Record<SimulationId, string> = {
  current: "var(--status-green)",
  demand_plus_10: "#f59e0b",
  demand_minus_10: "#3b82f6",
  northeast_weather: "#8b5cf6",
  hurricane: "#ef4444",
};

export default function SimulationPanel({ activeSimulation, onSelectSimulation }: SimulationPanelProps) {
  return (
    <div
      style={{
        padding: "12px 20px 20px",
        borderTop: "1px solid var(--border-primary)",
      }}
    >
      <h2
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text-tertiary)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          margin: "0 0 12px",
        }}
      >
        Simulations
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {SIMULATION_ORDER.map((simId, index) => {
          const sim = SIMULATION_DATA[simId];
          const isActive = activeSimulation === simId;
          const color = SIMULATION_COLORS[simId];

          return (
            <motion.button
              key={simId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelectSimulation(simId)}
              className="sim-button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                padding: "11px 14px",
                borderRadius: "var(--radius-sm)",
                border: isActive ? `1.5px solid ${color}` : "1px solid var(--border-secondary)",
                backgroundColor: isActive ? `${color}0D` : "var(--bg-card)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all var(--transition-fast)",
                outline: "none",
                position: "relative",
              }}
            >
              {/* Status indicator */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: isActive ? color : "var(--border-primary)",
                  boxShadow: isActive ? `0 0 8px ${color}60` : "none",
                  transition: "all var(--transition-fast)",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    transition: "color var(--transition-fast)",
                  }}
                >
                  {sim.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-tertiary)",
                    marginTop: 1,
                  }}
                >
                  {sim.description}
                </div>
              </div>

              {/* Mini counts */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    display: "flex",
                    gap: 4,
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "var(--status-green)" }}>{sim.counts.green}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>/</span>
                  <span style={{ color: "var(--status-yellow)" }}>{sim.counts.yellow}</span>
                  <span style={{ color: "var(--text-tertiary)" }}>/</span>
                  <span style={{ color: "var(--status-red)" }}>{sim.counts.red}</span>
                </motion.div>
              )}

              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sim-active"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    borderRadius: 4,
                    backgroundColor: color,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
