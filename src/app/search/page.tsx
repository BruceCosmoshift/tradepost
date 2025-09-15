"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { listings, kmBetween } from "@/data/listings";
import { formatZar } from "@/lib/format"; // If '@' alias isn't set, use: import { formatZar } from "../../lib/format";

type Loc = { lat: number; lon: number } | null;

function textLower(v: unknown) {
  return typeof v === "string" ? v.toLowerCase() : "";
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("All");
  const [radius, setRadius] = useState("Any");
  const [userLoc, setUserLoc] = useState<Loc>(null);
  const [locMsg, setLocMsg] = useState<string | null>(null);

  // Build category list dynamically so it always matches your data
  const categories = useMemo(() => {
    const set = new Set<string>();
    listings.forEach((l) => set.add(l.category));
    return ["All", ...Array.from(set)];
  }, []);

  // Attach a robust displayKm:
  // - If user location available AND listing has coords -> compute km
  // - Else fall back to listing.distanceKm
  // - If neither available -> displayKm = null
  const withDistance = useMemo(() => {
    return listings.map((l) => {
      let displayKm: number | null =
        typeof (l as any).distanceKm === "number" ? Math.round((l as any).distanceKm) : null;

      const hasCoords =
        typeof (l as any).lat === "number" &&
        Number.isFinite((l as any).lat) &&
        typeof (l as any).lon === "number" &&
        Number.isFinite((l as any).lon);

      if (userLoc && hasCoords) {
        const km = kmBetween(userLoc, { lat: (l as any).lat, lon: (l as any).lon });
        if (Number.isFinite(km)) displayKm = Math.round(km);
      }

      return { ...l, displayKm };
    });
  }, [userLoc]);

  // Resilient filtering (handles missing description, etc.)
  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return withDistance.filter((l: any) => {
      const kwOk = kw ? textLower(l.title).includes(kw) || textLower(l.description).includes(kw) : true;
      const catOk = category === "All" || l.category === category;
      const radOk =
        radius === "Any"
          ? true
          : typeof l.displayKm === "number" && l.displayKm <= parseInt(radius, 10);

      return kwOk && catOk && radOk;
    });
  }, [keyword, category, radius, withDistance]);

  function useMyLocation() {
    // Works on https:// OR http://localhost — not on plain http://<LAN-IP>
    if (!("geolocation" in navigator)) {
      setLocMsg("Geolocation not supported by this browser.");
      return;
    }
    setLocMsg("Requesting location…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLoc({ lat: latitude, lon: longitude });
        setLocMsg(`Location set (${latitude.toFixed(4)}, ${longitude.toFixed(4)}).`);
      },
      (err) => setLocMsg(`Location error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Search</h1>

      <div className="flex flex-wrap items-center gap-3">
        <button onClick={useMyLocation} className="bg-indigo-600 text-white rounded px-3 py-2">
          Use my location
        </button>
        <span className="text-xs text-gray-500">
          Tip: use <code>http://localhost:3000</code> for location (blocked on plain LAN URLs).
        </span>
        {userLoc && <span className="text-sm text-gray-600">Using your location • distances updated</span>}
        {locMsg && <span className="text-sm text-gray-600">{locMsg}</span>}
      </div>

      {/* Filters */}
      <form className="grid gap-3 max-w-xl" onSubmit={(e) => e.preventDefault()}>
        <div className="grid gap-1">
          <label htmlFor="kw" className="text-sm font-medium text-gray-700">
            Keyword
          </label>
          <input
            id="kw"
            className="border rounded p-2"
            placeholder="Type to filter…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="grid gap-1">
            <label htmlFor="cat" className="text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="cat"
              className="border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-1">
            <label htmlFor="rad" className="text-sm font-medium text-gray-700">
              Radius
            </label>
            <select
              id="rad"
              className="border rounded p-2"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
            >
              <option>Any</option>
              <option value="5">≤ 5 km</option>
              <option value="10">≤ 10 km</option>
              <option value="25">≤ 25 km</option>
              <option value="50">≤ 50 km</option>
              <option value="100">≤ 100 km</option>
              <option value="250">≤ 250 km</option>
            </select>
          </div>
        </div>
      </form>

      {/* Results */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item: any) => (
          <Link
            key={item.id}
            href={`/search/(..)listing/${item.id}`}
            className="block border rounded-lg overflow-hidden bg-white hover:shadow"
            prefetch={false}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.photo} alt={item.title} className="w-full h-40 object-cover" />
            <div className="p-3 space-y-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-sm text-gray-600">
                {item.isFree ? (
                  "FREE"
                ) : (
                  <span suppressHydrationWarning>{formatZar(item.priceZar)}</span>
                )}
                <span className="ml-2">• {item.category}</span>
                <span className="ml-2">
                  • {typeof item.displayKm === "number" ? `${item.displayKm} km` : "— km"}
                </span>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-gray-600">
            No results. Try a different keyword, category, or radius.
            {!!userLoc && (
              <>
                {" "}
                Your current location is set, so items far from you may be filtered out quickly.
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
