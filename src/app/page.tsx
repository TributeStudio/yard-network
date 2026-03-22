"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import NorthAmericaMap from "@/components/NorthAmericaMap";
import StatsPanel from "@/components/StatsPanel";
import SimulationPanel from "@/components/SimulationPanel";
import YardPopup from "@/components/YardPopup";
import Header from "@/components/Header";
import { SimulationId, SIMULATION_DATA, getYardsForSimulation } from "@/data/simulations";
import { Yard } from "@/data/yards";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeSimulation, setActiveSimulation] = useState<SimulationId>("current");
  const [selectedYard, setSelectedYard] = useState<Yard | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const handleYardClick = useCallback((yard: Yard, event: React.MouseEvent) => {
    if (yard.status === "green") return;
    const rect = (event.currentTarget as HTMLElement).closest('.map-container')?.getBoundingClientRect();
    if (rect) {
      setPopupPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
    setSelectedYard(yard);
  }, []);

  const closePopup = useCallback(() => {
    setSelectedYard(null);
  }, []);

  const yards = getYardsForSimulation(activeSimulation);
  const stats = SIMULATION_DATA[activeSimulation].stats;
  const counts = SIMULATION_DATA[activeSimulation].counts;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--bg-primary)",
        transition: "background-color var(--transition-base)",
      }}
    >
      <Header theme={theme} toggleTheme={toggleTheme} counts={counts} activeSimulation={activeSimulation} />

      <main
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Map Section - Left 3/4 */}
        <div
          ref={mapRef}
          className="map-container"
          style={{
            flex: "3",
            position: "relative",
            overflow: "hidden",
            borderRight: "1px solid var(--border-primary)",
          }}
        >
          <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.3 }} />
          <NorthAmericaMap
            yards={yards}
            onYardClick={handleYardClick}
            activeSimulation={activeSimulation}
          />

          {/* Legend */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              display: "flex",
              gap: 16,
              padding: "12px 20px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--bg-overlay)",
              backdropFilter: "blur(12px)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-md)",
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            <LegendItem color="var(--status-green)" label="Operational" count={counts.green} />
            <LegendItem color="var(--status-yellow)" label="Warning" count={counts.yellow} />
            <LegendItem color="var(--status-red)" label="Critical" count={counts.red} />
          </div>

          {/* Popup */}
          <AnimatePresence>
            {selectedYard && (
              <YardPopup
                yard={selectedYard}
                position={popupPosition}
                onClose={closePopup}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel - 1/4 */}
        <div
          style={{
            flex: "1",
            minWidth: 340,
            maxWidth: 400,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--bg-secondary)",
            transition: "background-color var(--transition-base)",
            overflow: "hidden",
          }}
        >
          <StatsPanel stats={stats} activeSimulation={activeSimulation} />
          <SimulationPanel
            activeSimulation={activeSimulation}
            onSelectSimulation={setActiveSimulation}
          />
        </div>
      </main>
    </div>
  );
}

function LegendItem({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          backgroundColor: color,
          boxShadow: `0 0 6px ${color}40`,
        }}
      />
      <span style={{ fontWeight: 500 }}>{label}</span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 600,
          fontSize: 12,
          backgroundColor: "var(--bg-tertiary)",
          padding: "2px 8px",
          borderRadius: 6,
          color: "var(--text-primary)",
        }}
      >
        {count}
      </span>
    </div>
  );
}
