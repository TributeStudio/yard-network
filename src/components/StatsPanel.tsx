"use client";

import { motion } from "framer-motion";
import { SystemStats } from "@/data/simulations";
import { SimulationId, SIMULATION_DATA } from "@/data/simulations";

interface StatsPanelProps {
  stats: SystemStats;
  activeSimulation: SimulationId;
}

interface StatItem {
  label: string;
  value: string;
  unit: string;
  key: keyof SystemStats;
  icon: string;
  threshold?: { warning: number; critical: number; direction: "above" | "below" };
}

const STAT_ITEMS: StatItem[] = [
  {
    label: "Avg Truck Turnaround",
    value: "",
    unit: "min",
    key: "avgTruckTurnaround",
    icon: "⏱",
    threshold: { warning: 60, critical: 70, direction: "above" },
  },
  {
    label: "Avg Empty Trailer Dwell",
    value: "",
    unit: "days",
    key: "avgEmptyTrailerDwell",
    icon: "📦",
    threshold: { warning: 2.8, critical: 3.2, direction: "above" },
  },
  {
    label: "Trailer Pool Compliance",
    value: "",
    unit: "%",
    key: "trailerPoolCompliance",
    icon: "✓",
    threshold: { warning: 95, critical: 90, direction: "below" },
  },
  {
    label: "Avg Drivers Awaiting",
    value: "",
    unit: "",
    key: "avgDriversAwaiting",
    icon: "🚛",
    threshold: { warning: 7, critical: 9, direction: "above" },
  },
  {
    label: "Avg Inbound Loaded Age",
    value: "",
    unit: "days",
    key: "avgInboundLoadedAge",
    icon: "↓",
    threshold: { warning: 1.5, critical: 2.0, direction: "above" },
  },
  {
    label: "Avg Outbound Loaded Age",
    value: "",
    unit: "days",
    key: "avgOutboundLoadedAge",
    icon: "↑",
    threshold: { warning: 1.8, critical: 2.2, direction: "above" },
  },
  {
    label: "% OOS Trailers",
    value: "",
    unit: "%",
    key: "pctOOSTrailers",
    icon: "⚠",
    threshold: { warning: 15, critical: 20, direction: "above" },
  },
];

function getStatColor(value: number, threshold?: StatItem["threshold"]): string {
  if (!threshold) return "var(--text-primary)";
  const { warning, critical, direction } = threshold;
  if (direction === "above") {
    if (value >= critical) return "var(--status-red)";
    if (value >= warning) return "var(--status-yellow)";
  } else {
    if (value <= critical) return "var(--status-red)";
    if (value <= warning) return "var(--status-yellow)";
  }
  return "var(--status-green)";
}

function getDelta(current: number, baseline: number): { value: string; positive: boolean } {
  const diff = current - baseline;
  const pct = ((diff / baseline) * 100).toFixed(1);
  return {
    value: diff > 0 ? `+${pct}%` : `${pct}%`,
    positive: diff <= 0,
  };
}

export default function StatsPanel({ stats, activeSimulation }: StatsPanelProps) {
  const baselineStats = SIMULATION_DATA.current.stats;

  return (
    <div
      style={{
        flex: 1,
        padding: "20px 20px 12px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              margin: 0,
            }}
          >
            System Metrics
          </h2>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-tertiary)",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Real-time
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STAT_ITEMS.map((item, index) => {
          const value = stats[item.key];
          const color = getStatColor(value, item.threshold);
          const showDelta = activeSimulation !== "current";
          const delta = showDelta ? getDelta(value, baselineStats[item.key]) : null;

          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-secondary)",
                transition: "all var(--transition-fast)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                <span style={{ fontSize: 14, width: 20, textAlign: "center" }}>{item.icon}</span>
                <span style={{ fontSize: 12.5, color: "var(--text-secondary)", fontWeight: 500 }}>
                  {item.label}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {delta && (
                  <motion.span
                    key={`${item.key}-${activeSimulation}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      fontSize: 10,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 500,
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor: delta.positive ? "var(--status-green-bg)" : "var(--status-red-bg)",
                      color: delta.positive ? "var(--status-green)" : "var(--status-red)",
                    }}
                  >
                    {delta.value}
                  </motion.span>
                )}
                <motion.span
                  key={`${item.key}-val-${activeSimulation}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color,
                    minWidth: 48,
                    textAlign: "right",
                  }}
                >
                  {value}
                  <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-tertiary)", marginLeft: 2 }}>
                    {item.unit}
                  </span>
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
