"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

type OSMResult = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OSMResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query || query.length < 3) { setResults([]); return; }
      try {
        setLoading(true);
        const res = await fetch(`/api/osm/search?q=${encodeURIComponent(query)}`);
        const data: OSMResult[] = await res.json();
        setResults(data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const sidebarWidth = 300;

  return (
    <div className="grid grid-cols-[300px_1fr] h-[calc(100vh-80px)]">
      <aside className="border-r p-3 space-y-3 overflow-auto">
        <div className="text-lg font-semibold">Search location</div>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 3 letters… (e.g., Durban)"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="border rounded px-3 py-2" type="submit">Search</button>
        </form>

        {loading && <div className="text-sm opacity-70">Searching…</div>}

        <div className="space-y-2">
          {results.slice(0, 8).map((r, i) => {
            const lat = Number(r.lat), lon = Number(r.lon);
            return (
              <button
                key={i}
                onClick={() => setSelected([lat, lon])}
                className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
                title={`${lat.toFixed(5)}, ${lon.toFixed(5)}`}
              >
                {r.display_name}
              </button>
            );
          })}
          {(!loading && query.length >= 3 && results.length === 0) && (
            <div className="text-sm opacity-70">No results.</div>
          )}
        </div>

        <div className="text-xs opacity-60 pt-2">
          Selected: {selected ? `${selected[0].toFixed(5)}, ${selected[1].toFixed(5)}` : "none"}
        </div>
      </aside>

      <div className="relative">
        <LeafletMap
          selected={selected as any}
          selectedZoom={13}
          sidebarPx={sidebarWidth}
        />
      </div>
    </div>
  );
}
