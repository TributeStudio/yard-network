import { Yard, BASE_YARDS, ADDITIONAL_ISSUES, YardStatus } from "./yards";

export type SimulationId = "current" | "demand_plus_10" | "demand_minus_10" | "northeast_weather" | "hurricane";

export interface SystemStats {
  avgTruckTurnaround: number;
  avgEmptyTrailerDwell: number;
  trailerPoolCompliance: number;
  avgDriversAwaiting: number;
  avgInboundLoadedAge: number;
  avgOutboundLoadedAge: number;
  pctOOSTrailers: number;
}

export interface SimulationConfig {
  id: SimulationId;
  name: string;
  description: string;
  icon: string;
  counts: { green: number; yellow: number; red: number };
  stats: SystemStats;
}

export const SIMULATION_DATA: Record<SimulationId, SimulationConfig> = {
  current: {
    id: "current",
    name: "Current",
    description: "Live network status",
    icon: "◉",
    counts: { green: 41, yellow: 5, red: 4 },
    stats: {
      avgTruckTurnaround: 57,
      avgEmptyTrailerDwell: 2.6,
      trailerPoolCompliance: 105,
      avgDriversAwaiting: 5.1,
      avgInboundLoadedAge: 0.7,
      avgOutboundLoadedAge: 1.3,
      pctOOSTrailers: 12,
    },
  },
  demand_plus_10: {
    id: "demand_plus_10",
    name: "Demand Shock +10%",
    description: "Simulate 10% demand increase",
    icon: "↑",
    counts: { green: 32, yellow: 6, red: 12 },
    stats: {
      avgTruckTurnaround: 65,
      avgEmptyTrailerDwell: 1.7,
      trailerPoolCompliance: 91,
      avgDriversAwaiting: 8.3,
      avgInboundLoadedAge: 1.4,
      avgOutboundLoadedAge: 1.1,
      pctOOSTrailers: 7,
    },
  },
  demand_minus_10: {
    id: "demand_minus_10",
    name: "Demand Shock −10%",
    description: "Simulate 10% demand decrease",
    icon: "↓",
    counts: { green: 45, yellow: 2, red: 3 },
    stats: {
      avgTruckTurnaround: 51,
      avgEmptyTrailerDwell: 2.9,
      trailerPoolCompliance: 108,
      avgDriversAwaiting: 3.4,
      avgInboundLoadedAge: 0.4,
      avgOutboundLoadedAge: 1.1,
      pctOOSTrailers: 13,
    },
  },
  northeast_weather: {
    id: "northeast_weather",
    name: "NE Weather Event",
    description: "Northeast weather impact (10%)",
    icon: "⛈",
    counts: { green: 35, yellow: 5, red: 10 },
    stats: {
      avgTruckTurnaround: 62,
      avgEmptyTrailerDwell: 2.1,
      trailerPoolCompliance: 102,
      avgDriversAwaiting: 7.3,
      avgInboundLoadedAge: 1.6,
      avgOutboundLoadedAge: 1.8,
      pctOOSTrailers: 22,
    },
  },
  hurricane: {
    id: "hurricane",
    name: "Hurricane",
    description: "Hurricane impact (20%)",
    icon: "🌀",
    counts: { green: 33, yellow: 6, red: 11 },
    stats: {
      avgTruckTurnaround: 64,
      avgEmptyTrailerDwell: 2.9,
      trailerPoolCompliance: 94,
      avgDriversAwaiting: 8.1,
      avgInboundLoadedAge: 2.1,
      avgOutboundLoadedAge: 2.4,
      pctOOSTrailers: 26,
    },
  },
};

// Generate yards for each simulation by reassigning statuses
export function getYardsForSimulation(simId: SimulationId): Yard[] {
  const config = SIMULATION_DATA[simId];
  const { green, yellow, red } = config.counts;

  // Start from base yards and reassign statuses
  const yards = BASE_YARDS.map((y) => ({ ...y, issues: [...y.issues] }));

  // Shuffle deterministically based on simulation
  const seed = simId.length * 7 + simId.charCodeAt(0);
  const shuffled = [...yards].sort((a, b) => {
    const ha = ((a.id * seed) % 997) - ((b.id * seed) % 997);
    return ha;
  });

  // Assign statuses
  let redCount = 0;
  let yellowCount = 0;
  let greenCount = 0;

  const issueTypes = [
    ADDITIONAL_ISSUES.bottleneck_critical,
    ADDITIONAL_ISSUES.trailer_pool_critical,
    ADDITIONAL_ISSUES.inventory_critical,
    ADDITIONAL_ISSUES.bottleneck_critical,
  ];

  const yellowIssueTypes = [
    ADDITIONAL_ISSUES.bottleneck_warning,
    ADDITIONAL_ISSUES.detention_warning,
    ADDITIONAL_ISSUES.detention_warning,
    ADDITIONAL_ISSUES.trailer_detention_warning,
    ADDITIONAL_ISSUES.detention_warning,
  ];

  for (const yard of shuffled) {
    if (redCount < red) {
      yard.status = "red";
      yard.issues = issueTypes[redCount % issueTypes.length];
      redCount++;
    } else if (yellowCount < yellow) {
      yard.status = "yellow";
      yard.issues = yellowIssueTypes[yellowCount % yellowIssueTypes.length];
      yellowCount++;
    } else {
      yard.status = "green";
      yard.issues = [];
      greenCount++;
    }
  }

  // For "current" simulation, use the original assignments
  if (simId === "current") {
    return BASE_YARDS;
  }

  return shuffled;
}
