export type YardStatus = "green" | "yellow" | "red";

export interface YardIssue {
  type: "bottleneck" | "detention" | "trailer_pool" | "inventory" | "trailer_detention";
  severity: "warning" | "critical";
  title: string;
  description: string;
}

export interface Yard {
  id: number;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  status: YardStatus;
  issues: YardIssue[];
}

// 50 yards spread across North America
export const BASE_YARDS: Yard[] = [
  // === RED YARDS (4) ===
  { id: 1, name: "LAX Distribution Hub", city: "Los Angeles", state: "CA", lat: 33.94, lng: -118.24, status: "red", issues: [
    { type: "bottleneck", severity: "critical", title: "Severe Bottleneck", description: "Truck turnaround time is over 50% higher than average. Current: 89 min vs 57 min avg." }
  ]},
  { id: 2, name: "Newark Gateway", city: "Newark", state: "NJ", lat: 40.73, lng: -74.17, status: "red", issues: [
    { type: "bottleneck", severity: "critical", title: "Severe Bottleneck", description: "Truck turnaround time is over 50% higher than average. Current: 92 min vs 57 min avg." }
  ]},
  { id: 3, name: "DFW Mega Yard", city: "Dallas", state: "TX", lat: 32.78, lng: -96.8, status: "red", issues: [
    { type: "trailer_pool", severity: "critical", title: "Empty Trailer Pool Critical", description: "Trailer pool is at 50% of target. Current: 42 trailers vs 84 target." }
  ]},
  { id: 4, name: "Miami Cold Chain", city: "Miami", state: "FL", lat: 25.76, lng: -80.19, status: "red", issues: [
    { type: "inventory", severity: "critical", title: "Inventory at Risk", description: "One or more reefer units are expected to become out of compliance within the next 3 hours. 3 units flagged." }
  ]},

  // === YELLOW YARDS (5) ===
  { id: 5, name: "O'Hare Logistics Center", city: "Chicago", state: "IL", lat: 41.88, lng: -87.63, status: "yellow", issues: [
    { type: "bottleneck", severity: "warning", title: "Bottleneck Warning", description: "Truck turnaround time is over 25% higher than average. Current: 73 min vs 57 min avg." }
  ]},
  { id: 6, name: "Phoenix Southwest Hub", city: "Phoenix", state: "AZ", lat: 33.45, lng: -112.07, status: "yellow", issues: [
    { type: "detention", severity: "warning", title: "Detention Risk", description: "One or more trucks are within 20 minutes of incurring detention charges. 2 trucks flagged." }
  ]},
  { id: 7, name: "Memphis Freight Center", city: "Memphis", state: "TN", lat: 35.15, lng: -90.05, status: "yellow", issues: [
    { type: "detention", severity: "warning", title: "Detention Risk", description: "One or more trucks are within 20 minutes of incurring detention charges. 1 truck flagged." }
  ]},
  { id: 8, name: "Seattle Pacific Yard", city: "Seattle", state: "WA", lat: 47.6, lng: -122.33, status: "yellow", issues: [
    { type: "detention", severity: "warning", title: "Detention Risk", description: "One or more trucks are within 20 minutes of incurring detention charges. 3 trucks flagged." }
  ]},
  { id: 9, name: "Atlanta South Terminal", city: "Atlanta", state: "GA", lat: 33.75, lng: -84.39, status: "yellow", issues: [
    { type: "trailer_detention", severity: "warning", title: "Trailer Detention Risk", description: "One or more trailers are within 6 hours of incurring trailer detention charges. 4 trailers flagged." }
  ]},

  // === GREEN YARDS (41) ===
  { id: 10, name: "San Francisco Bay Hub", city: "San Francisco", state: "CA", lat: 37.77, lng: -123.42, status: "green", issues: [] },
  { id: 11, name: "Portland NW Terminal", city: "Portland", state: "OR", lat: 45.52, lng: -122.68, status: "green", issues: [] },
  { id: 12, name: "Denver Mile High Yard", city: "Denver", state: "CO", lat: 39.74, lng: -104.99, status: "green", issues: [] },
  { id: 13, name: "Salt Lake Crossroads", city: "Salt Lake City", state: "UT", lat: 40.76, lng: -111.89, status: "green", issues: [] },
  { id: 14, name: "Minneapolis North Star", city: "Minneapolis", state: "MN", lat: 44.98, lng: -93.27, status: "green", issues: [] },
  { id: 15, name: "Kansas City Central", city: "Kansas City", state: "MO", lat: 39.1, lng: -94.58, status: "green", issues: [] },
  { id: 16, name: "St. Louis Gateway", city: "St. Louis", state: "MO", lat: 38.63, lng: -90.2, status: "green", issues: [] },
  { id: 17, name: "Nashville Corridor", city: "Nashville", state: "TN", lat: 36.16, lng: -86.78, status: "green", issues: [] },
  { id: 18, name: "Charlotte Southeast", city: "Charlotte", state: "NC", lat: 35.23, lng: -80.84, status: "green", issues: [] },
  { id: 19, name: "Boston Northeast Hub", city: "Boston", state: "MA", lat: 42.36, lng: -71.06, status: "green", issues: [] },
  { id: 20, name: "Detroit Motor City", city: "Detroit", state: "MI", lat: 42.33, lng: -83.05, status: "green", issues: [] },
  { id: 21, name: "Pittsburgh Steel Yard", city: "Pittsburgh", state: "PA", lat: 40.44, lng: -80.0, status: "green", issues: [] },
  { id: 22, name: "Philadelphia East", city: "Philadelphia", state: "PA", lat: 39.95, lng: -75.17, status: "green", issues: [] },
  { id: 23, name: "Indianapolis Crossroads", city: "Indianapolis", state: "IN", lat: 39.77, lng: -86.16, status: "green", issues: [] },
  { id: 24, name: "Columbus Midwest", city: "Columbus", state: "OH", lat: 39.96, lng: -82.99, status: "green", issues: [] },
  { id: 25, name: "Cleveland Lake Hub", city: "Cleveland", state: "OH", lat: 41.5, lng: -81.69, status: "green", issues: [] },
  { id: 26, name: "San Diego Border Yard", city: "San Diego", state: "CA", lat: 32.72, lng: -117.16, status: "green", issues: [] },
  { id: 27, name: "Las Vegas West", city: "Las Vegas", state: "NV", lat: 36.17, lng: -115.14, status: "green", issues: [] },
  { id: 28, name: "Houston Gulf Terminal", city: "Houston", state: "TX", lat: 29.76, lng: -95.37, status: "green", issues: [] },
  { id: 29, name: "San Antonio South TX", city: "San Antonio", state: "TX", lat: 29.42, lng: -98.49, status: "green", issues: [] },
  { id: 30, name: "New Orleans Delta", city: "New Orleans", state: "LA", lat: 29.95, lng: -90.07, status: "green", issues: [] },
  { id: 31, name: "Jacksonville Port", city: "Jacksonville", state: "FL", lat: 30.33, lng: -81.66, status: "green", issues: [] },
  { id: 32, name: "Tampa Bay Yard", city: "Tampa", state: "FL", lat: 27.95, lng: -82.46, status: "green", issues: [] },
  { id: 33, name: "Raleigh Triangle", city: "Raleigh", state: "NC", lat: 35.78, lng: -78.64, status: "green", issues: [] },
  { id: 34, name: "Richmond East Coast", city: "Richmond", state: "VA", lat: 37.54, lng: -77.44, status: "green", issues: [] },
  { id: 35, name: "Baltimore Harbor", city: "Baltimore", state: "MD", lat: 39.29, lng: -76.61, status: "green", issues: [] },
  { id: 36, name: "Milwaukee Great Lakes", city: "Milwaukee", state: "WI", lat: 43.04, lng: -87.91, status: "green", issues: [] },
  { id: 37, name: "Omaha Plains Hub", city: "Omaha", state: "NE", lat: 41.26, lng: -95.94, status: "green", issues: [] },
  { id: 38, name: "Oklahoma City SW", city: "Oklahoma City", state: "OK", lat: 35.47, lng: -97.52, status: "green", issues: [] },
  { id: 39, name: "Albuquerque Desert", city: "Albuquerque", state: "NM", lat: 35.08, lng: -106.65, status: "green", issues: [] },
  { id: 40, name: "Boise Mountain Yard", city: "Boise", state: "ID", lat: 43.62, lng: -116.21, status: "green", issues: [] },
  { id: 41, name: "El Paso Border Hub", city: "El Paso", state: "TX", lat: 31.76, lng: -106.49, status: "green", issues: [] },
  { id: 42, name: "Louisville Derby Yard", city: "Louisville", state: "KY", lat: 38.25, lng: -85.76, status: "green", issues: [] },
  { id: 43, name: "Toronto North Hub", city: "Toronto", state: "ON", lat: 43.65, lng: -79.38, status: "green", issues: [] },
  { id: 44, name: "Montreal East Hub", city: "Montreal", state: "QC", lat: 45.5, lng: -73.57, status: "green", issues: [] },
  { id: 45, name: "Vancouver Pacific", city: "Vancouver", state: "BC", lat: 49.28, lng: -123.12, status: "green", issues: [] },
  { id: 46, name: "Monterrey Mexico NE", city: "Monterrey", state: "NL", lat: 25.67, lng: -100.31, status: "green", issues: [] },
  { id: 47, name: "Mexico City Central", city: "Mexico City", state: "CDMX", lat: 19.43, lng: -99.13, status: "green", issues: [] },
  { id: 48, name: "Guadalajara West MX", city: "Guadalajara", state: "JAL", lat: 20.67, lng: -103.35, status: "green", issues: [] },
  { id: 49, name: "Calgary Alberta Hub", city: "Calgary", state: "AB", lat: 51.05, lng: -114.07, status: "green", issues: [] },
  { id: 50, name: "Tucson Southern AZ", city: "Tucson", state: "AZ", lat: 32.22, lng: -110.93, status: "green", issues: [] },
];

// Additional issue sets for expanded red/yellow yards in simulation scenarios
export const ADDITIONAL_ISSUES: Record<string, YardIssue[]> = {
  bottleneck_critical: [
    { type: "bottleneck", severity: "critical", title: "Severe Bottleneck", description: "Truck turnaround time is over 50% higher than average. Congestion at loading docks." }
  ],
  bottleneck_warning: [
    { type: "bottleneck", severity: "warning", title: "Bottleneck Warning", description: "Truck turnaround time is over 25% higher than average." }
  ],
  detention_warning: [
    { type: "detention", severity: "warning", title: "Detention Risk", description: "One or more trucks are within 20 minutes of incurring detention charges." }
  ],
  trailer_pool_critical: [
    { type: "trailer_pool", severity: "critical", title: "Empty Trailer Pool Critical", description: "Trailer pool is at 50% of target due to surge demand." }
  ],
  inventory_critical: [
    { type: "inventory", severity: "critical", title: "Inventory at Risk", description: "One or more reefer units are expected to become out of compliance within the next 3 hours." }
  ],
  trailer_detention_warning: [
    { type: "trailer_detention", severity: "warning", title: "Trailer Detention Risk", description: "One or more trailers are within 6 hours of incurring trailer detention charges." }
  ],
};
