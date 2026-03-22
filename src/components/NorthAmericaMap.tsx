"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Yard } from "@/data/yards";
import { SimulationId } from "@/data/simulations";
import {
  US_CONTINENTAL_PATH,
  US_STATE_BORDERS_PATH,
  ALASKA_PATH,
  HAWAII_PATH,
} from "@/data/us-map-paths";

interface MapProps {
  yards: Yard[];
  onYardClick: (yard: Yard, event: React.MouseEvent) => void;
  activeSimulation: SimulationId;
}

function latLngToSvg(lat: number, lng: number): { x: number; y: number } {
  const minLng = -132;
  const maxLng = -58;
  const minLat = 14;
  const maxLat = 56;
  const x = ((lng - minLng) / (maxLng - minLng)) * 900 + 50;
  const y = ((maxLat - lat) / (maxLat - minLat)) * 560 + 40;
  return { x, y };
}

export default function NorthAmericaMap({ yards, onYardClick, activeSimulation }: MapProps) {
  const [hoveredYard, setHoveredYard] = useState<number | null>(null);

  const sortedYards = useMemo(() => {
    const order: Record<string, number> = { green: 0, yellow: 1, red: 2 };
    return [...yards].sort((a, b) => order[a.status] - order[b.status]);
  }, [yards]);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative" }}>
      <svg viewBox="0 0 1000 640" style={{ width: "100%", height: "100%", maxWidth: 1200 }} xmlns="http://www.w3.org/2000/svg">
        {/* Water background */}
        <rect x="0" y="0" width="1000" height="640" className="map-water" rx="12" />

        {/* Graticule grid */}
        <g opacity="0.04" stroke="var(--text-tertiary)" strokeWidth="0.5">
          {[-120, -110, -100, -90, -80, -70].map((lng) => {
            const top = latLngToSvg(55, lng);
            const bot = latLngToSvg(15, lng);
            return <line key={`lng${lng}`} x1={top.x} y1={top.y} x2={bot.x} y2={bot.y} />;
          })}
          {[20, 25, 30, 35, 40, 45, 50].map((lat) => {
            const left = latLngToSvg(lat, -130);
            const right = latLngToSvg(lat, -60);
            return <line key={`lat${lat}`} x1={left.x} y1={left.y} x2={right.x} y2={right.y} />;
          })}
        </g>

        {/* Continental US landmass */}
        <path className="map-land" d={US_CONTINENTAL_PATH} />

        {/* State borders */}
        <path className="map-state-borders" d={US_STATE_BORDERS_PATH} fill="none" stroke="var(--map-border)" strokeWidth="0.5" opacity="0.4" />

        {/* Alaska */}
        <path className="map-land" d={ALASKA_PATH} />

        {/* Hawaii */}
        <path className="map-land" d={HAWAII_PATH} />

        {/* Labels */}
        <text x="80" y="540" style={{ fontSize: 7, fill: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>AK</text>
        <text x="190" y="575" style={{ fontSize: 7, fill: "var(--text-tertiary)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>HI</text>

        {/* Connection lines */}
        <g opacity="0.04" stroke="var(--accent-primary)" strokeWidth="0.5">
          {yards.map((yard) => {
            const pos = latLngToSvg(yard.lat, yard.lng);
            const nearby = yards
              .filter((y) => y.id !== yard.id)
              .map((y) => ({ ...y, pos: latLngToSvg(y.lat, y.lng) }))
              .sort((a, b) => {
                const da = Math.hypot(a.pos.x - pos.x, a.pos.y - pos.y);
                const db = Math.hypot(b.pos.x - pos.x, b.pos.y - pos.y);
                return da - db;
              })
              .slice(0, 2);
            return nearby.map((n) => (
              <line key={`line-${yard.id}-${n.id}`} x1={pos.x} y1={pos.y} x2={n.pos.x} y2={n.pos.y} strokeDasharray="3 3" />
            ));
          })}
        </g>

        {/* Yard markers */}
        <AnimatePresence mode="popLayout">
          {sortedYards.map((yard) => {
            const pos = latLngToSvg(yard.lat, yard.lng);
            const color = yard.status === "green" ? "var(--status-green)" : yard.status === "yellow" ? "var(--status-yellow)" : "var(--status-red)";
            const isClickable = yard.status !== "green";
            const isHovered = hoveredYard === yard.id;
            const radius = yard.status === "red" ? 6 : yard.status === "yellow" ? 5 : 3.5;
            const hoverRadius = radius + 2;
            return (
              <motion.g key={`${yard.id}-${activeSimulation}`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.35, delay: yard.id * 0.008 }}>
                {yard.status !== "green" && (
                  <circle cx={pos.x} cy={pos.y} r={radius + 6} fill="none" stroke={color} strokeWidth="1" opacity="0.15" className={`yard-marker-${yard.status}`} />
                )}
                <circle cx={pos.x} cy={pos.y} r={(isHovered ? hoverRadius : radius) + 2} fill={color} opacity={isHovered ? 0.2 : 0.1} style={{ transition: "all 150ms ease" }} />
                <circle cx={pos.x} cy={pos.y} r={isHovered ? hoverRadius : radius} fill={color} stroke="var(--bg-card)" strokeWidth="1.5" style={{ cursor: isClickable ? "pointer" : "default", filter: yard.status === "red" ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color})`, transition: "all 150ms ease" }} onClick={(e) => onYardClick(yard, e)} onMouseEnter={() => setHoveredYard(yard.id)} onMouseLeave={() => setHoveredYard(null)} />
                <circle cx={pos.x - radius * 0.2} cy={pos.y - radius * 0.2} r={radius * 0.25} fill="rgba(255,255,255,0.45)" style={{ pointerEvents: "none" }} />
                {isClickable && (
                  <circle cx={pos.x} cy={pos.y} r={14} fill="transparent" style={{ cursor: "pointer" }} onClick={(e) => onYardClick(yard, e)} onMouseEnter={() => setHoveredYard(yard.id)} onMouseLeave={() => setHoveredYard(null)}>
                    <title>{yard.name} — {yard.city}, {yard.state}</title>
                  </circle>
                )}
                {isHovered && isClickable && (
                  <g>
                    <rect x={pos.x - 55} y={pos.y - radius - 28} width={110} height={20} rx={5} fill="var(--bg-card)" stroke="var(--border-primary)" strokeWidth="0.5" opacity="0.95" />
                    <text x={pos.x} y={pos.y - radius - 15} textAnchor="middle" style={{ fontSize: 9, fontWeight: 600, fill: "var(--text-primary)", pointerEvents: "none" }}>{yard.city}, {yard.state}</text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Map title */}
        <text x="50" y="30" style={{ fontSize: 10, fontWeight: 600, fill: "var(--text-tertiary)", letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace" }}>
          NORTH AMERICA — REGIONAL FACILITY DEPLOYMENT ({yards.length} SITES)
        </text>
      </svg>
    </div>
  );
}
