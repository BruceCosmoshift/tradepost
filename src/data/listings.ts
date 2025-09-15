export type Listing = {
  id: string;
  title: string;
  priceZar: number | null; // null = FREE
  category: "Phones" | "Cars" | "Jobs" | "Other";
  // Static fallback distance (used if user location not available)
  distanceKm: number;
  isFree: boolean;
  isAgeRestricted: boolean;
  description: string;
  photo: string;
  // Coordinates so we can compute real distance
  lat: number;
  lon: number;
};

export const listings: Listing[] = [
  {
    id: "p1",
    title: "Samsung Galaxy A53",
    priceZar: 3500,
    category: "Phones",
    distanceKm: 4,
    isFree: false,
    isAgeRestricted: false,
    description: "Great condition, 128GB, includes charger.",
    photo: "https://picsum.photos/seed/a53/600/400",
    lat: -26.2041, lon: 28.0473, // Johannesburg CBD-ish
  },
  {
    id: "p2",
    title: "iPhone 12",
    priceZar: 6500,
    category: "Phones",
    distanceKm: 12,
    isFree: false,
    isAgeRestricted: false,
    description: "64GB, battery 85%, minor scuffs.",
    photo: "https://picsum.photos/seed/iphone12/600/400",
    lat: -26.1451, lon: 28.0410, // Randburg-ish
  },
  {
    id: "c1",
    title: "Toyota Yaris 1.3",
    priceZar: 78000,
    category: "Cars",
    distanceKm: 28,
    isFree: false,
    isAgeRestricted: false,
    description: "2009 model, 180,000 km, FSH.",
    photo: "https://picsum.photos/seed/yaris/600/400",
    lat: -25.7479, lon: 28.2293, // Pretoria-ish
  },
  {
    id: "j1",
    title: "Shop Assistant (Part-time)",
    priceZar: null,
    category: "Jobs",
    distanceKm: 6,
    isFree: true,
    isAgeRestricted: false,
    description: "Weekend shifts available. Apply with CV.",
    photo: "https://picsum.photos/seed/job/600/400",
    lat: -26.2599, lon: 27.9390, // Roodepoort-ish
  },
  {
    id: "o1",
    title: "FREE: Office Chair",
    priceZar: null,
    category: "Other",
    distanceKm: 2,
    isFree: true,
    isAgeRestricted: false,
    description: "Pickup only, fair condition.",
    photo: "https://picsum.photos/seed/chair/600/400",
    lat: -26.1376, lon: 28.1847, // Sandton-ish
  },
  {
    id: "o2",
    title: "Age-restricted Item (example)",
    priceZar: 500,
    category: "Other",
    distanceKm: 35,
    isFree: false,
    isAgeRestricted: true,
    description: "Example listing requiring age verification.",
    photo: "https://picsum.photos/seed/agerestricted/600/400",
    lat: -27.9967, lon: 29.0019, // East Rand-ish
  }
];

// Haversine distance in km
export function kmBetween(a: {lat: number; lon: number}, b: {lat: number; lon: number}) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 🔧 Bring back the helper used by the detail pages
export function getListingById(id: string): Listing | null {
  return listings.find(l => l.id === id) ?? null;
}
