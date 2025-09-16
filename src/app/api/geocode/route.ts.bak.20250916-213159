import { NextResponse } from "next/server";

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const province = searchParams.get("province") || "";
  const city = searchParams.get("city") || "";
  if(!q) return NextResponse.json({ features: [] });

  try{
    const key = process.env.MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if(key){
      const r = await fetch(`https://api.maptiler.com/geocoding/${encodeURIComponent(q)}.json?key=${key}&language=en&country=ZA`);
      const data = await r.json();
      return NextResponse.json(data);
    }
    // Fallback: Nominatim (polite use)
    const bias = [city, province, "South Africa"].filter(Boolean).join(", ");
    const url = `https://nominatim.openstreetmap.org/search?format=geojson&limit=8&countrycodes=za&addressdetails=1&q=${encodeURIComponent(q + (bias?(" "+bias):""))}`;
    const r = await fetch(url, { headers: { "User-Agent": "TradePost/1.0" }});
    const data = await r.json();
    // Map to {features: [{center:[lng,lat], place_name:...}]}
    const features = (data.features||[]).map((f:any)=>({
      ...f,
      center: f.geometry?.coordinates,
      place_name: f.properties?.display_name || f.properties?.name || f.display_name
    }));
    return NextResponse.json({ features });
  }catch(e:any){
    return NextResponse.json({ features: [], error: e?.message ?? "geocode failed" }, { status: 200 });
  }
}
