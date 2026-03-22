export const CATEGORIES = [
  {
    value: "plumbing",
    label: "Plumbing",
    emoji: "🔧",
    desc: "Leaks, pipes, fixtures, drains & water heaters",
    examples: ["Leaky faucet", "Clogged drain", "Water heater install"],
  },
  {
    value: "electrical",
    label: "Electrical",
    emoji: "⚡",
    desc: "Wiring, panels, outlets, switches & lighting",
    examples: ["Outlet repair", "Light fixture install", "Panel upgrade"],
  },
  {
    value: "handyman",
    label: "Handyman",
    emoji: "🔨",
    desc: "General repairs, installations & home fixes",
    examples: ["Door repair", "Drywall patch", "Furniture assembly"],
  },
] as const;

export type CategoryValue = typeof CATEGORIES[number]["value"];
