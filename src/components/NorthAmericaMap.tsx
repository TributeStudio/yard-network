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

        {/* SVG definitions for patterns and effects */}
        <defs>
          {/* Dot grid pattern for land texture */}
          <pattern id="dotGrid" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="0.6" fill="var(--text-tertiary)" opacity="0.2" />
          </pattern>
          {/* Clip path for dot grid - reuses landmass shape */}
          <clipPath id="landClip">
            <use href="#landPaths" />
          </clipPath>
          {/* Subtle glow filter */}
          <filter id="landGlow" x="-5%" y="-5%" width="110%" height="110%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Detailed North America landmass */}
        <NorthAmericaLandmass />

        {/* Dot grid overlay on land */}
        <DotGridOverlay />

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
      {/* Canada — detailed outline with coastline features */}
      <path
        className="map-land"
        d={`
          M 134 155 L 130 148 L 128 138 L 130 126 L 135 115 L 143 105
          L 153 96 L 165 88 L 180 80 L 198 73 L 218 67 L 240 62
          L 262 58 L 285 55 L 310 52 L 338 50 L 365 48 L 392 46
          L 418 44 L 442 43 L 465 42 L 488 42 L 510 42 L 530 43
          L 548 44 L 565 46 L 580 48 L 594 51 L 608 55 L 620 60
          L 630 66 L 638 73 L 644 80 L 650 72 L 658 65 L 668 60
          L 680 58 L 692 60 L 702 65 L 710 72 L 716 80 L 720 90
          L 722 100 L 724 110 L 728 118 L 734 125 L 740 132
          L 746 140 L 750 148 L 752 155
          L 740 160 L 730 155 L 720 148 L 712 140 L 704 132
          L 696 126 L 686 122 L 676 118 L 665 115 L 654 113
          L 642 112 L 630 113 L 618 115 L 606 110 L 594 108
          L 582 110 L 572 114 L 563 120 L 555 128 L 548 135
          L 540 130 L 530 125 L 518 120 L 506 116 L 494 114
          L 480 113 L 465 112 L 448 112 L 432 113 L 415 115
          L 398 118 L 382 120 L 365 122 L 348 124 L 332 126
          L 318 128 L 305 131 L 292 134 L 280 130 L 270 126
          L 258 124 L 248 124 L 238 126 L 228 129 L 218 132
          L 208 136 L 198 138 L 188 140 L 178 143 L 168 146
          L 158 150 L 148 153 L 140 157 Z
        `}
      />

      {/* Continental US — Pacific coast with detail */}
      <path
        className="map-land"
        d={`
          M 134 155 L 140 157 L 148 153 L 158 150 L 168 146
          L 174 152 L 170 160 L 164 170 L 158 182 L 152 195
          L 148 208 L 144 220 L 140 232 L 137 244 L 134 258
          L 132 270 L 132 282 L 134 294 L 138 306 L 144 316
          L 150 324 L 158 332 L 166 340 L 175 347 L 184 352
          L 190 356 L 198 360 L 208 364 L 220 368 L 232 372
          L 245 376 L 258 380 L 270 383 L 282 384 L 294 382
          L 306 379 L 318 375 L 330 372 L 342 370 L 354 370
          L 366 372 L 378 376 L 390 380 L 400 384
          L 410 386 L 420 384 L 430 380 L 440 375 L 450 370
          L 460 365 L 468 362 L 476 366 L 484 370 L 492 373
          L 502 376 L 514 378 L 526 378 L 536 376 L 546 374
          L 556 372 L 566 370 L 578 367 L 590 364 L 602 362
          L 614 360 L 625 356 L 636 352 L 646 348 L 655 343
          L 664 337 L 672 330 L 680 322 L 687 314 L 693 305
          L 698 296 L 702 288 L 706 280 L 712 270 L 718 260
          L 724 252 L 730 244 L 734 236 L 738 228 L 740 220
          L 742 212 L 743 204 L 742 196 L 740 188 L 738 180
          L 736 172 L 735 166 L 738 160 L 740 158
          L 752 155 L 755 162 L 758 170 L 760 178 L 762 186
          L 762 196 L 760 206 L 756 216 L 752 226 L 748 236
          L 745 244 L 742 252 L 738 260 L 734 268 L 728 276
          L 722 284 L 716 292 L 710 300 L 703 308 L 696 315
          L 688 322 L 680 328 L 672 334 L 665 338 L 660 342
          L 662 348 L 664 356 L 668 365 L 673 375 L 678 385
          L 682 396 L 684 406 L 683 416 L 680 425 L 675 434
          L 668 441 L 660 446 L 652 443 L 645 436 L 640 426
          L 637 416 L 636 405 L 638 395 L 640 385 L 641 376
          L 640 368 L 636 360 L 630 358 L 622 360 L 614 363
          L 606 365 L 596 367 L 586 369 L 576 372 L 564 374
          L 552 376 L 540 378 L 528 380 L 518 380 L 508 378
          L 498 375 L 488 371 L 478 367 L 470 363 L 462 360
          L 456 364 L 448 370 L 440 376 L 430 381 L 420 385
          L 410 387 L 400 386 L 392 382 L 382 378 L 372 374
          L 362 370 L 352 369 L 342 370 L 332 372 L 322 375
          L 312 378 L 302 380 L 292 383 L 280 385 L 268 384
          L 256 381 L 244 377 L 232 373 L 220 369 L 210 366
          L 200 362 L 192 358 L 184 353 L 176 348 L 170 342
          L 162 334 L 155 325 L 148 314 L 143 303 L 139 290
          L 136 276 L 134 262 L 133 248 L 134 234 L 137 220
          L 141 208 L 146 196 L 152 184 L 158 174 L 162 166
          L 164 158 L 158 152 L 150 156 L 142 158 L 136 156 Z
        `}
      />

      {/* Alaska */}
      <path
        className="map-land"
        d={`
          M 50 82 L 56 74 L 64 66 L 74 60 L 85 55 L 96 52
          L 108 50 L 118 50 L 128 52 L 136 56 L 142 62
          L 146 70 L 148 80 L 148 90 L 145 98 L 140 104
          L 133 108 L 124 110 L 114 110 L 104 108 L 94 104
          L 84 100 L 76 95 L 68 90 L 62 85 L 54 80 Z
        `}
      />

      {/* Mexico — with Yucatan and Gulf coast detail */}
      <path
        className="map-land"
        d={`
          M 184 353 L 192 358 L 200 362 L 210 366 L 220 369
          L 232 373 L 244 377 L 256 381 L 268 384 L 280 385
          L 292 383 L 302 380 L 312 378 L 322 375 L 332 372
          L 342 370 L 352 369 L 362 370 L 372 374 L 382 378
          L 392 382 L 400 386
          L 404 392 L 406 400 L 406 410 L 404 420 L 400 430
          L 394 440 L 386 450 L 376 458 L 366 464 L 354 470
          L 340 474 L 326 478 L 310 480 L 296 482 L 280 484
          L 264 486 L 250 488 L 238 489 L 228 488 L 220 485
          L 214 478 L 210 470 L 206 460 L 203 448 L 200 436
          L 198 424 L 196 412 L 195 400 L 193 390 L 192 380
          L 190 370 L 186 360 Z
        `}
      />

      {/* Baja California peninsula */}
      <path
        className="map-land"
        d={`
          M 172 348 L 168 358 L 164 370 L 160 384 L 158 398
          L 158 412 L 160 424 L 164 435 L 170 444 L 176 448
          L 180 444 L 182 434 L 183 420 L 184 406 L 183 392
          L 181 378 L 178 366 L 175 355 Z
        `}
      />

      {/* Yucatan peninsula */}
      <path
        className="map-land"
        d={`
          M 404 420 L 412 416 L 422 414 L 434 416 L 444 420
          L 452 426 L 456 434 L 454 442 L 448 448 L 440 450
          L 430 448 L 420 444 L 412 438 L 406 430 L 404 424 Z
        `}
      />

      {/* Nova Scotia / Maritime provinces */}
      <path
        className="map-land"
        d={`
          M 752 155 L 760 148 L 768 144 L 776 144 L 782 148
          L 784 155 L 782 162 L 776 166 L 768 168 L 762 165
          L 756 160 Z
        `}
      />

      {/* Newfoundland */}
      <path
        className="map-land"
        d={`
          M 770 120 L 778 116 L 786 116 L 792 120 L 794 128
          L 790 136 L 784 140 L 776 140 L 770 136 L 768 128 Z
        `}
      />

      {/* Great Lakes — shaped more realistically */}
      {/* Lake Superior */}
      <path className="map-water" d="M 520 170 Q 530 162 545 160 Q 560 158 572 162 Q 580 166 578 174 Q 574 180 562 182 Q 548 184 535 182 Q 522 178 520 170 Z" />
      {/* Lake Michigan */}
      <path className="map-water" d="M 558 176 Q 562 182 564 192 Q 566 202 562 210 Q 558 216 554 210 Q 550 202 550 192 Q 552 182 556 176 Z" />
      {/* Lake Huron */}
      <path className="map-water" d="M 578 168 Q 586 166 592 170 Q 596 176 594 184 Q 590 192 584 194 Q 578 192 576 184 Q 574 176 578 168 Z" />
      {/* Lake Erie */}
      <path className="map-water" d="M 598 194 Q 612 190 626 190 Q 638 192 640 198 Q 636 204 624 206 Q 610 206 600 202 Q 596 198 598 194 Z" />
      {/* Lake Ontario */}
      <path className="map-water" d="M 648 184 Q 658 180 668 180 Q 676 182 676 188 Q 674 194 664 196 Q 654 196 648 192 Q 646 188 648 184 Z" />

      {/* Hudson Bay */}
      <path className="map-water" d="M 465 52 Q 490 44 520 44 Q 550 46 570 54 Q 582 62 578 75 Q 568 88 548 92 Q 528 94 508 90 Q 488 84 475 72 Q 465 62 465 52 Z" opacity="0.25" />

      {/* Vancouver Island */}
      <path
        className="map-land"
        d={`
          M 118 148 L 124 140 L 130 136 L 134 140 L 134 148
          L 130 155 L 124 158 L 120 155 Z
        `}
      />

      {/* Cuba (partial, at edge of map) */}
      <path
        className="map-land"
        d={`
          M 546 440 Q 560 436 576 434 Q 594 434 610 438 Q 622 442 628 448
          Q 624 454 612 456 Q 596 456 580 454 Q 564 450 552 446 Q 546 442 546 440 Z
        `}
        opacity="0.6"
      />
    </g>
  );
}

function DotGridOverlay() {
  // Generate a grid of dots that covers the land area for a tech aesthetic
  const dots: { x: number; y: number }[] = [];
  for (let x = 100; x < 800; x += 10) {
    for (let y = 40; y < 500; y += 10) {
      dots.push({ x, y });
    }
  }
  return (
    <g opacity="0.12" style={{ pointerEvents: "none" }}>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x}
          cy={d.y}
          r={0.5}
          fill="var(--accent-primary)"
        />
      ))}
    </g>
  );
}

function StateBoundaries() {
  return (
    <g opacity="0.08" stroke="var(--text-tertiary)" strokeWidth="0.4" fill="none">
      {/* US-Canada border (49th parallel west, then Great Lakes east) */}
      <path d="M 134 157 L 200 138 L 300 131 L 400 118 L 500 116 L 540 130" strokeDasharray="6 3" opacity="0.3" />
      {/* US-Mexico border */}
      <path d="M 184 353 Q 260 382 400 386" strokeDasharray="4 2" opacity="0.3" />
      {/* Mississippi River */}
      <path d="M 510 118 Q 515 180 520 240 Q 525 300 535 378" strokeDasharray="2 3" opacity="0.2" />
      {/* Rocky Mountains spine */}
      <path d="M 240 130 Q 245 200 250 270 Q 258 330 270 384" strokeDasharray="1 3" opacity="0.15" />
      {/* Appalachian Mountains */}
      <path d="M 660 340 Q 665 300 670 260 Q 680 220 690 180 Q 700 155 710 140" strokeDasharray="1 3" opacity="0.15" />
      {/* State grid lines (subtle) */}
      {[175, 225, 275, 325, 375, 425, 475, 525, 575, 625].map((x) => (
        <line key={`vl${x}`} x1={x} y1={120} x2={x} y2={385} opacity="0.08" strokeDasharray="1 6" />
      ))}
      {[175, 225, 275, 325].map((y) => (
        <line key={`hl${y}`} x1={134} y1={y} x2={755} y2={y} opacity="0.08" strokeDasharray="1 6" />
      ))}
    </g>
  );
}
