import { NextResponse } from "next/server";
import { normalizeName } from "../../../lib/aliases";

function buildQuery(q: string, city?: string | null, province?: string | null) {
  const qN = normalizeName(q || "");
  const cN = city ? normalizeName(city) : "";
  const pN = province ? normalizeName(province) : "";
  // Prefer the most specific term first, then city/province, then country
  const parts = [qN, cN, pN, "South Africa"].filter(Boolean);
  return parts.join(", ");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const province = searchParams.get("province");
  const city = searchParams.get("city");

  const finalQuery = buildQuery(q, city, province);

  try {
    const key = process.env.MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if (key) {
      // MapTiler vector geocoding
      const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(finalQuery)}.json?key=${key}&language=en&country=ZA`;
      const R = await fetch(url);
      const data = await R.json();
      return NextResponse.json(data);
    }

    // Nominatim fallback
    const url = `https://nominatim.openstreetmap.org/search?format=geojson&limit=10&countrycodes=za&addressdetails=1&q=${encodeURIComponent(finalQuery)}`;
    const R = await fetch(url, { headers: { "User-Agent": "TradePost/1.0" } });
    const data = await R.json();

    // Normalize features to include center + a consistent name field
    const features = (data.features || []).map((f: any) => {
      const center = f.geometry?.coordinates;
      const props = f.properties || {};
      const name =
        props.display_name ||
        props.name ||
        f.place_name ||
        f.text ||
        f.display_name;
      return { ...f, center, place_name: name };
    });

    return NextResponse.json({ type: "FeatureCollection", features });
  } catch (e: any) {
    return NextResponse.json({ features: [], error: e?.message ?? "geocode failed" });
  }
}