"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Yard } from "@/data/yards";
import { SimulationId } from "@/data/simulations";

interface MapProps {
  yards: Yard[];
  onYardClick: (yard: Yard, event: React.MouseEvent) => void;
  activeSimulation: SimulationId;
}

// Convert lat/lng to SVG coordinates using a Mercator-like projection
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
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        position: "relative",
      }}
    >
      <svg
        viewBox="0 0 1000 640"
        style={{
          width: "100%",
          height: "100%",
          maxWidth: 1200,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect x="0" y="0" width="1000" height="640" className="map-water" rx="12" />

        {/* Graticule grid */}
        <g opacity="0.05" stroke="var(--text-tertiary)" strokeWidth="0.5">
          {/* Longitude lines */}
          {[-120, -110, -100, -90, -80, -70].map((lng) => {
            const top = latLngToSvg(55, lng);
            const bot = latLngToSvg(15, lng);
            return <line key={`lng${lng}`} x1={top.x} y1={top.y} x2={bot.x} y2={bot.y} />;
          })}
          {/* Latitude lines */}
          {[20, 25, 30, 35, 40, 45, 50].map((lat) => {
            const left = latLngToSvg(lat, -130);
            const right = latLngToSvg(lat, -60);
            return <line key={`lat${lat}`} x1={left.x} y1={left.y} x2={right.x} y2={right.y} />;
          })}
        </g>

        {/* Detailed North America landmass */}
        <NorthAmericaLandmass />

        {/* State/Province boundaries (subtle) */}
        <StateBoundaries />

        {/* Connection lines between nearby yards */}
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
              <line
                key={`line-${yard.id}-${n.id}`}
                x1={pos.x} y1={pos.y}
                x2={n.pos.x} y2={n.pos.y}
                strokeDasharray="3 3"
              />
            ));
          })}
        </g>

        {/* Yard markers */}
        <AnimatePresence mode="popLayout">
          {sortedYards.map((yard) => {
            const pos = latLngToSvg(yard.lat, yard.lng);
            const color =
              yard.status === "green"
                ? "var(--status-green)"
                : yard.status === "yellow"
                ? "var(--status-yellow)"
                : "var(--status-red)";

            const isClickable = yard.status !== "green";
            const isHovered = hoveredYard === yard.id;
            const radius = yard.status === "red" ? 6 : yard.status === "yellow" ? 5 : 3.5;
            const hoverRadius = radius + 2;

            return (
              <motion.g
                key={`${yard.id}-${activeSimulation}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.35, delay: yard.id * 0.008 }}
              >
                {/* Pulse ring for non-green */}
                {yard.status !== "green" && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={radius + 6}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.15"
                    className={`yard-marker-${yard.status}`}
                  />
                )}

                {/* Outer glow */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={(isHovered ? hoverRadius : radius) + 2}
                  fill={color}
                  opacity={isHovered ? 0.2 : 0.1}
                  style={{ transition: "all 150ms ease" }}
                />

                {/* Main marker */}
                <circle
                  cx={pos.x} cy={pos.y}
                  r={isHovered ? hoverRadius : radius}
                  fill={color}
                  stroke="var(--bg-card)"
                  strokeWidth="1.5"
                  style={{
                    cursor: isClickable ? "pointer" : "default",
                    filter: yard.status === "red" ? `drop-shadow(0 0 6px ${color})` : `drop-shadow(0 0 2px ${color})`,
                    transition: "all 150ms ease",
                  }}
                  onClick={(e) => onYardClick(yard, e)}
                  onMouseEnter={() => setHoveredYard(yard.id)}
                  onMouseLeave={() => setHoveredYard(null)}
                />

                {/* Inner highlight for 3D effect */}
                <circle
                  cx={pos.x - radius * 0.2}
                  cy={pos.y - radius * 0.2}
                  r={radius * 0.25}
                  fill="rgba(255,255,255,0.45)"
                  style={{ pointerEvents: "none" }}
                />

                {/* Invisible hit area */}
                {isClickable && (
                  <circle
                    cx={pos.x} cy={pos.y}
                    r={14}
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onClick={(e) => onYardClick(yard, e)}
                    onMouseEnter={() => setHoveredYard(yard.id)}
                    onMouseLeave={() => setHoveredYard(null)}
                  >
                    <title>{yard.name} — {yard.city}, {yard.state}</title>
                  </circle>
                )}

                {/* Hover tooltip label */}
                {isHovered && isClickable && (
                  <g>
                    <rect
                      x={pos.x - 55}
                      y={pos.y - radius - 28}
                      width={110}
                      height={20}
                      rx={5}
                      fill="var(--bg-card)"
                      stroke="var(--border-primary)"
                      strokeWidth="0.5"
                      opacity="0.95"
                    />
                    <text
                      x={pos.x}
                      y={pos.y - radius - 15}
                      textAnchor="middle"
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        fill: "var(--text-primary)",
                        pointerEvents: "none",
                      }}
                    >
                      {yard.city}, {yard.state}
                    </text>
                  </g>
                )}
              </motion.g>
            );
          })}
        </AnimatePresence>

        {/* Map title */}
        <text
          x="50" y="30"
          style={{
            fontSize: 10,
            fontWeight: 600,
            fill: "var(--text-tertiary)",
            letterSpacing: "0.1em",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          NORTH AMERICA — REGIONAL FACILITY DEPLOYMENT ({yards.length} SITES)
        </text>
      </svg>
    </div>
  );
}

function NorthAmericaLandmass() {
  return (
    <g>
      {/* Continental US - more detailed outline */}
      <path
        className="map-land"
        d={`
          M 115 220 L 118 210 L 120 195 L 125 180 L 132 168 L 140 160
          L 148 153 L 158 147 L 170 142 L 185 137 L 200 133 L 218 128
          L 235 124 L 252 122 L 268 125 L 280 130 L 292 134 L 305 132
          L 318 128 L 332 125 L 348 122 L 365 120 L 382 118 L 400 116
          L 420 114 L 440 113 L 458 112 L 475 111 L 492 112 L 508 115
          L 522 120 L 535 126 L 545 132 L 552 125 L 560 118 L 568 112
          L 578 108 L 590 106 L 605 108 L 618 112 L 632 110 L 648 108
          L 662 110 L 676 114 L 688 120 L 700 128 L 712 136 L 722 144
          L 732 152 L 740 160 L 748 168 L 755 178 L 758 188 L 756 198
          L 752 208 L 755 218 L 760 228 L 762 238 L 758 248 L 752 258
          L 748 268 L 742 278 L 735 286 L 728 294 L 720 302 L 712 310
          L 703 318 L 694 325 L 685 332 L 675 340 L 665 345
          L 655 350 L 642 354 L 628 358 L 612 362 L 598 365
          L 582 368 L 565 372 L 548 375 L 530 377 L 515 378
          L 500 376 L 488 372 L 475 366 L 465 362 L 458 366
          L 448 372 L 438 377 L 425 382 L 412 385 L 398 383
          L 385 378 L 372 374 L 358 370 L 345 368 L 332 370
          L 318 374 L 305 378 L 292 382 L 278 384 L 265 383
          L 250 380 L 238 376 L 225 372 L 212 368 L 200 362
          L 188 354 L 178 345 L 168 335 L 160 322 L 153 310
          L 147 296 L 142 282 L 138 268 L 134 254 L 130 240
          L 126 228 L 120 220 Z
        `}
      />

      {/* Florida peninsula */}
      <path
        className="map-land"
        d={`
          M 665 345 L 668 352 L 672 362 L 676 375 L 679 388
          L 681 400 L 680 412 L 677 424 L 672 434 L 665 440
          L 658 438 L 652 430 L 648 418 L 646 405 L 648 392
          L 650 378 L 653 365 L 658 354 Z
        `}
      />

      {/* Michigan upper peninsula */}
      <path
        className="map-land"
        d="M 545 178 L 555 172 L 565 170 L 575 172 L 580 178 L 575 183 L 565 185 L 555 183 Z"
      />

      {/* Canada - detailed outline */}
      <path
        className="map-land"
        d={`
          M 140 160 L 148 153 L 158 147 L 170 142 L 185 137 L 200 133
          L 218 128 L 235 124 L 252 122 L 268 125 L 280 130 L 292 134
          L 305 132 L 318 128 L 332 125 L 348 122 L 365 120 L 382 118
          L 400 116 L 420 114 L 440 113 L 458 112 L 475 111 L 492 112
          L 508 115 L 522 120 L 535 126 L 545 132 L 552 125 L 560 118
          L 568 112 L 578 108 L 590 106 L 605 108 L 618 112 L 632 110
          L 648 108 L 662 110 L 676 114 L 688 120 L 700 128 L 712 136
          L 722 144 L 732 152 L 740 160
          L 748 150 L 752 138 L 750 125 L 745 112 L 738 100
          L 728 88 L 718 78 L 705 68 L 690 60 L 672 54
          L 655 50 L 635 47 L 615 45 L 592 43 L 570 42
          L 548 41 L 525 40 L 500 39 L 478 40 L 455 42
          L 432 44 L 410 47 L 388 52 L 365 57 L 345 62
          L 325 68 L 305 73 L 285 78 L 265 82 L 245 86
          L 225 90 L 205 95 L 188 100 L 172 108 L 158 116
          L 148 126 L 140 138 L 135 150 L 134 160 Z
        `}
      />

      {/* Alaska */}
      <path
        className="map-land"
        d={`
          M 55 70 L 68 60 L 85 53 L 102 50 L 118 52 L 132 58
          L 142 68 L 148 80 L 145 92 L 138 100 L 128 106
          L 115 108 L 102 105 L 88 100 L 75 94 L 65 86
          L 58 78 Z
        `}
      />

      {/* Mexico */}
      <path
        className="map-land"
        d={`
          M 188 354 L 200 362 L 212 368 L 225 372 L 238 376
          L 250 380 L 265 383 L 278 384 L 292 382 L 305 378
          L 318 374 L 332 370 L 345 368 L 358 370 L 372 374
          L 385 378 L 398 383
          L 402 395 L 400 408 L 395 420 L 388 432
          L 378 444 L 368 454 L 355 462 L 342 468
          L 328 473 L 312 477 L 296 480 L 280 483
          L 265 486 L 250 488 L 238 490 L 226 492
          L 216 490 L 210 484 L 206 475 L 202 462
          L 198 448 L 195 435 L 192 420 L 190 405
          L 188 392 L 186 378 L 185 365 Z
        `}
      />

      {/* Baja California */}
      <path
        className="map-land"
        d={`
          M 170 345 L 165 360 L 160 378 L 158 395 L 160 412
          L 164 428 L 170 442 L 175 448 L 178 445 L 180 432
          L 182 415 L 183 398 L 182 380 L 178 365 L 175 352 Z
        `}
      />

      {/* Great Lakes */}
      <ellipse cx="548" cy="172" rx="22" ry="14" className="map-water" />
      <ellipse cx="585" cy="162" rx="18" ry="11" className="map-water" />
      <ellipse cx="525" cy="182" rx="14" ry="10" className="map-water" />
      <ellipse cx="615" cy="170" rx="16" ry="9" className="map-water" />
      <ellipse cx="568" cy="185" rx="10" ry="7" className="map-water" />

      {/* Hudson Bay (subtle) */}
      <ellipse cx="520" cy="65" rx="50" ry="30" className="map-water" opacity="0.3" />
    </g>
  );
}

function StateBoundaries() {
  // Simplified state/province boundary lines for visual texture
  return (
    <g opacity="0.06" stroke="var(--text-tertiary)" strokeWidth="0.3" fill="none">
      {/* Some key state boundaries */}
      {/* Mississippi River approximate */}
      <path d="M 508 120 Q 510 200 515 280 Q 520 340 530 378" strokeDasharray="2 2" />
      {/* US-Canada border (49th parallel approx) */}
      <path d="M 140 160 L 740 160" strokeDasharray="4 2" opacity="0.5" />
      {/* US-Mexico border */}
      <path d="M 188 354 Q 290 382 398 383" strokeDasharray="3 2" opacity="0.4" />
    </g>
  );
}
