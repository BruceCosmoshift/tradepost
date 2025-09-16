import { NextResponse } from "next/server";
import { normalizeName } from "../../../lib/aliases";

function buildQuery(q: string, city?: string | null, province?: string | null) {
  const qN = normalizeName(q || "");
  const cN = city ? normalizeName(city) : "";
  const pN = province ? normalizeName(province) : "";
  return [qN, cN, pN, "South Africa"].filter(Boolean).join(", ");
}

function scoreFeature(f: any, city?: string|null, province?: string|null) {
  const name = String(
    f.place_name || f.properties?.display_name || f.properties?.label || f.text || f.display_name || ""
  ).toLowerCase();
  let s = 0;
  if (city) {
    const c = normalizeName(city).toLowerCase();
    if (name.includes(c)) s += 5;
    if (name.startsWith(c)) s += 2;
  }
  if (province) {
    const p = normalizeName(province).toLowerCase();
    if (name.includes(p)) s += 2;
  }
  if (name.includes("south africa")) s += 1;
  if (f.properties?.class === "place" && (f.properties?.type === "city" || f.properties?.type === "town")) s += 1;
  return s;
}

async function fetchMapTiler(query: string, key: string) {
  const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${key}&language=en&country=ZA`;
  const R = await fetch(url);
  const data = await R.json();
  const features = (data.features || []).map((f: any) => ({
    ...f,
    center: f.center || f.geometry?.coordinates,
    place_name: f.place_name || f.properties?.label || f.text,
  }));
  return { type: "FeatureCollection", features };
}

async function fetchNominatim(query: string, lat?: number, lng?: number) {
  const params = new URLSearchParams({
    format: "geojson",
    limit: "20",
    countrycodes: "za",
    addressdetails: "1",
    q: query,
  });
  // If a center is provided, bound the search to a small box around it
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const d = 0.3; // ~30km box
    const left = (lng - d).toFixed(6);
    const right = (lng + d).toFixed(6);
    const top = (lat + d).toFixed(6);
    const bottom = (lat - d).toFixed(6);
    params.set("viewbox", `${left},${top},${right},${bottom}`);
    params.set("bounded", "1");
  }
  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const R = await fetch(url, { headers: { "User-Agent": "TradePost/1.0" } });
  const data = await R.json();
  const features = (data.features || []).map((f: any) => {
    const center = f.geometry?.coordinates;
    const props = f.properties || {};
    const name = props.display_name || props.name || f.place_name || f.text || f.display_name;
    return { ...f, center, place_name: name };
  });
  return { type: "FeatureCollection", features };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const province = searchParams.get("province");
  const city = searchParams.get("city");
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const latN = lat ? Number(lat) : undefined;
  const lngN = lng ? Number(lng) : undefined;

  const key = process.env.MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const tryQuery = async (query: string) => {
    if (key) return fetchMapTiler(query, key);
    return fetchNominatim(query, latN, lngN);
  };

  // Attempt 1: normal order
  const q1 = buildQuery(q, city, province);
  let res = await tryQuery(q1);

  // Attempt 2: if no hits and the free-text has multiple tokens, try reversed token order for the first two
  if (!res.features?.length) {
    const parts = q.trim().split(/\s+/);
    if (parts.length >= 2) {
      const swapped = [parts[1], parts[0]].join(" ");
      const q2 = buildQuery(swapped, city, province);
      res = await tryQuery(q2);
    }
  }

  // Rank results for better “Cape Town” / “Harrismith” precision
  const ranked = (res.features || []).sort((a: any, b: any) => scoreFeature(b, city, province) - scoreFeature(a, city, province));
  return NextResponse.json({ type: "FeatureCollection", features: ranked });
}