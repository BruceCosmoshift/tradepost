import { NextResponse } from "next/server";

export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  if(!lat || !lng) return NextResponse.json({});

  try{
    const key = process.env.MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY;
    if(key){
      const r = await fetch(`https://api.maptiler.com/geocoding/${lng},${lat}.json?key=${key}`);
      const data = await r.json();
      const best = data.features?.[0];
      return NextResponse.json({
        label: best?.place_name || best?.properties?.label,
        city: best?.place?.[0]?.text || best?.properties?.locality,
        suburb: best?.properties?.neighbourhood || best?.properties?.district
      });
    }
    // Nominatim fallback
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`;
    const r = await fetch(url, { headers: { "User-Agent": "TradePost/1.0" }});
    const data = await r.json();
    const addr = data.address || {};
    return NextResponse.json({
      label: data.display_name,
      city: addr.city || addr.town || addr.village || addr.municipality,
      suburb: addr.suburb || addr.neighbourhood || addr.city_district
    });
  }catch(e:any){
    return NextResponse.json({ label: null }, { status: 200 });
  }
}
