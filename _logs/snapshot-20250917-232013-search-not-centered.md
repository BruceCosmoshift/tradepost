# Snapshot 20250917-232013 (search-not-centered)

## Location
C:\Cosmos\Apps\TradePost

## Git Status
On branch main
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   package.json
	modified:   pnpm-lock.yaml
	modified:   src/components/location/AddressAutocomplete.tsx
	modified:   src/components/location/ProvinceCitySelect.tsx
	modified:   src/components/map/LeafletMap.tsx

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	_logs/
	src/app/api/geo/
	src/app/api/osm/
	src/app/test-map/
	src/components/MapView.tsx
	src/components/PlacesAutocompleteOSM.tsx
	src/components/PlacesAutocompletePhoton.tsx
	src/components/location/AddressAutocomplete.tsx.bak.20250916-220034
	src/components/location/ProvinceCitySelect.tsx.bak.20250916-220034
	src/components/map/LeafletMap.tsx.bak.20250917-220759
	src/lib/places.ts
	src/lib/search.ts
	src/lib/text.ts
	src/lib/zaIndex.ts
	tools/
	transcript-20250917-220538.txt

no changes added to commit (use "git add" and/or "git commit -a")


## Recent Commits
* 2e4a882 (HEAD -> main, origin/main) chore: add map-report-20250917-220647.md
* b7df30e Map: centre-on-pin + Leaflet icons + dynamic no-SSR import
* 7af0210 fix(geo): add aliases + robust Nominatim mapping; normalize city recenter; better suburb suggestions
* 9ae5aab fix(geo): add aliases + robust Nominatim mapping; normalize city recenter; better suburb suggestions
* afc109c fix(location): support ZA_PROVINCE_CITIES export; stabilize city/suburb combobox


## Diff (working tree)
diff --git a/package.json b/package.json
index e4e764d..9feb2dd 100644
--- a/package.json
+++ b/package.json
@@ -9,15 +9,18 @@
     "lint": "eslint"
   },
   "dependencies": {
+    "leaflet": "^1.9.4",
     "maplibre-gl": "^5.7.1",
     "next": "15.5.2",
     "react": "19.1.0",
     "react-dom": "19.1.0",
+    "react-leaflet": "^5.0.0",
     "react-virtuoso": "^4.14.0"
   },
   "devDependencies": {
     "@eslint/eslintrc": "^3",
     "@tailwindcss/postcss": "^4",
+    "@types/leaflet": "^1.9.20",
     "@types/node": "^20",
     "@types/react": "^19",
     "@types/react-dom": "^19",
diff --git a/src/components/location/AddressAutocomplete.tsx b/src/components/location/AddressAutocomplete.tsx
index a34ed2e..ca01b63 100644
--- a/src/components/location/AddressAutocomplete.tsx
+++ b/src/components/location/AddressAutocomplete.tsx
@@ -1,6 +1,8 @@
 "use client";
 import { useEffect, useRef, useState } from "react";
-import { normalizeName } from "../../lib/aliases";
+import { findCities, findSuburbs } from "../../lib/zaIndex";
+
+type LocalOpt = { label: string; query: string };
 
 export default function AddressAutocomplete({
   value, onChange, bias
@@ -11,18 +13,40 @@ export default function AddressAutocomplete({
 }){
   const rootRef = useRef<HTMLDivElement>(null);
   const [q,setQ] = useState(value);
-  const [opts,setOpts] = useState<any[]>([]);
+  const [remote,setRemote] = useState<any[]>([]);
+  const [local,setLocal] = useState<LocalOpt[]>([]);
   const [open,setOpen] = useState(false);
 
+  // Local suggestions (wildcard): suburbs first, then cities
+  useEffect(()=>{
+    const t = setTimeout(()=>{
+      if(!q || q.length<2){ setLocal([]); return; }
+      const subs = findSuburbs(q, bias?.city, bias?.province).slice(0,8).map(s => ({
+        label: `${s.name}, ${s.city}`, query: `${s.name}, ${s.city}, ${s.province}, South Africa`
+      }));
+      const cits = findCities(q, bias?.province).slice(0,6).map(c => ({
+        label: `${c.name}`, query: `${c.name}, ${c.province}, South Africa`
+      }));
+      // de-dupe by label
+      const seen = new Set<string>();
+      const merged: LocalOpt[] = [];
+      for (const it of [...subs, ...cits]) { if(!seen.has(it.label)){ seen.add(it.label); merged.push(it); } }
+      setLocal(merged);
+    }, 120);
+    return ()=> clearTimeout(t);
+  }, [q, bias?.province, bias?.city]);
+
+  // Remote suggestions (optional)
   useEffect(()=>{
     const t = setTimeout(async ()=>{
-      if(!q || q.length<2){ setOpts([]); setOpen(false); return; }
-      const nq = normalizeName(q);
-      const url = `/api/geocode?q=${encodeURIComponent(nq)}${bias?.province?`&province=${encodeURIComponent(bias.province)}`:""}${bias?.city?`&city=${encodeURIComponent(bias.city)}`:""}`;
-      const r = await fetch(url); const data = await r.json();
-      const list = data.features?.slice(0,8) || [];
-      setOpts(list); setOpen(list.length>0);
-    }, 200);
+      if(!q || q.length<3){ setRemote([]); return; }
+      const parts = [q, bias?.city, bias?.province, "South Africa"].filter(Boolean).join(", ");
+      const url = `/api/geocode?q=${encodeURIComponent(parts)}${bias?.province?`&province=${encodeURIComponent(bias.province)}`:""}${bias?.city?`&city=${encodeURIComponent(bias.city)}`:""}`;
+      try{
+        const r = await fetch(url); const data = await r.json();
+        setRemote(data.features?.slice(0,8) || []);
+      }catch{ setRemote([]); }
+    }, 250);
     return ()=> clearTimeout(t);
   }, [q, bias?.province, bias?.city]);
 
@@ -34,29 +58,57 @@ export default function AddressAutocomplete({
     return ()=>{ document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); }
   },[]);
 
+  async function selectLocal(opt: LocalOpt){
+    // Geocode the query phrase to get coordinates
+    try{
+      const r = await fetch(`/api/geocode?q=${encodeURIComponent(opt.query)}`);
+      const data = await r.json();
+      const f = data.features?.[0];
+      const c = f?.center || f?.geometry?.coordinates;
+      if(Array.isArray(c) && c.length===2){
+        onChange({ address: opt.query, lat: c[1], lng: c[0] });
+        setQ(opt.query); setOpen(false);
+        return;
+      }
+    }catch{}
+    // If geocode failed, still set address text
+    onChange({ address: opt.query });
+    setQ(opt.query); setOpen(false);
+  }
+
   return (
     <div ref={rootRef} style={{ position:"relative" }}>
       <input
         style={{ width:"100%", padding:"8px 10px", border:"1px solid #d1d5db", borderRadius:12 }}
         value={q}
-        onFocus={()=> setOpen(opts.length>0)}
+        onFocus={()=> setOpen(true)}
         onChange={e=>{ setQ(e.target.value); setOpen(true); }}
-        placeholder="Type an address (e.g. 'Harrismith Wilgepark', '12 West St, Sandton')"
+        placeholder="Type an address, suburb, or city"
       />
-      {open && opts.length>0 && (
+      {open && (local.length>0 || remote.length>0) && (
         <div
           style={{ position:"absolute", zIndex:20, marginTop:4, width:"100%", background:"#fff",
                    border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 4px 16px rgba(0,0,0,0.08)", overflow:"hidden" }}
         >
-          {opts.map((f:any,i:number)=>{
+          {/* Local hits */}
+          {local.map((f,i)=>(
+            <button key={"L"+i} type="button"
+              style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #f3f4f6", background:"white", cursor:"pointer" }}
+              onClick={()=> selectLocal(f)}
+            >
+              {f.label}
+            </button>
+          ))}
+          {/* Remote hits */}
+          {remote.map((f:any,i:number)=>{
             const name = f.place_name || f.properties?.label || f.properties?.display_name || f.display_name;
             const center = f.center || f.geometry?.coordinates;
             const lng = center?.[0], lat = center?.[1];
             return (
               <button
-                key={i} type="button"
+                key={"R"+i} type="button"
                 style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #f3f4f6", background:"white", cursor:"pointer" }}
-                onClick={()=>{ onChange({ address:String(name), lat, lng }); setQ(String(name)); setOpen(false); setOpts([]); }}
+                onClick={()=>{ onChange({ address:String(name), lat, lng }); setQ(String(name)); setOpen(false); }}
               >
                 {String(name)}
               </button>
diff --git a/src/components/location/ProvinceCitySelect.tsx b/src/components/location/ProvinceCitySelect.tsx
index d9a799f..6fffa22 100644
--- a/src/components/location/ProvinceCitySelect.tsx
+++ b/src/components/location/ProvinceCitySelect.tsx
@@ -1,7 +1,8 @@
 "use client";
 import { useEffect, useRef, useState } from "react";
 import * as ZA from "../../lib/za";
-import { normalizeName } from "../../lib/aliases";
+import { findCities, findSuburbs } from "../../lib/zaIndex";
+import { normalize } from "../../lib/text";
 
 const ZA_PROVINCES: readonly string[] =
   (ZA as any).ZA_PROVINCES ??
@@ -45,48 +46,59 @@ export function ProvinceCitySelect({
     setCityOpts(seed);
   }, [value.province]);
 
-  // City type-ahead (province-constrained + normalized + center bias)
+  // City type-ahead: local wildcard first, remote augment if needed
   useEffect(()=>{
     const t = setTimeout(async ()=>{
-      const term = cityQ.trim().toLowerCase();
-      const seed = value.province && PROVINCE_CITIES[value.province] ? PROVINCE_CITIES[value.province] : NATIONAL_DEFAULTS;
-      let merged = seed;
+      const q = cityQ.trim();
+      const seeded = value.province && PROVINCE_CITIES[value.province] ? PROVINCE_CITIES[value.province] : NATIONAL_DEFAULTS;
 
-      if(term){
-        const local = seed.filter(n => n.toLowerCase().includes(term));
+      // Local matches (wildcard-style)
+      const local = q ? findCities(q, value.province).map(c => c.name)
+                      : seeded;
+
+      let merged = Array.from(new Set(local));
+
+      // Remote augment only if user typed & we have few local results
+      if (q && merged.length < 8) {
         try{
-          const q = [normalizeName(cityQ), value.province, "South Africa"].filter(Boolean).join(", ");
-          const url = `/api/geocode?q=${encodeURIComponent(q)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}${center?`&lat=${center.lat}&lng=${center.lng}`:""}`;
-          const r = await fetch(url);
-          const data = await r.json();
+          const parts = [q, value.province, "South Africa"].filter(Boolean).join(", ");
+          const url = `/api/geocode?q=${encodeURIComponent(parts)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}${center?`&lat=${center.lat}&lng=${center.lng}`:""}`;
+          const r = await fetch(url); const data = await r.json();
           const remote = (data.features||[]).map((f:any)=> f.place_name || f.properties?.label || f.properties?.display_name || f.text || f.display_name);
           merged = Array.from(new Set([...local, ...remote]));
-        }catch{
-          merged = local;
-        }
+        }catch{}
       }
+
       setCityOpts(merged.slice(0,12));
       if(merged.length>0) setCityOpen(true);
-    }, 300);
+    }, 250);
     return ()=> clearTimeout(t);
   }, [cityQ, value.province, center?.lat, center?.lng]);
 
-  // Suburb suggestions (after city), normalized + center bias
+  // Suburb type-ahead: local wildcard (city-scoped) first, remote augment if needed
   useEffect(()=>{
     const t = setTimeout(async ()=>{
       if(!value.city){ setSubOpts([]); setSubOpen(false); return; }
-      const term = subQ.trim();
-      const q = [term || value.city, normalizeName(value.city), value.province, "South Africa"].filter(Boolean).join(", ");
-      try{
-        const url = `/api/geocode?q=${encodeURIComponent(q)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}${value.city?`&city=${encodeURIComponent(value.city)}`:""}${center?`&lat=${center.lat}&lng=${center.lng}`:""}`;
-        const r = await fetch(url);
-        const data = await r.json();
-        const names = (data.features||[]).map((f:any)=> f.place_name || f.properties?.label || f.properties?.display_name || f.text || f.display_name);
-        setSubOpts(Array.from(new Set(names)).slice(0,20));
-      }catch{
-        setSubOpts([]);
+      const q = subQ.trim();
+
+      const local = q ? findSuburbs(q, value.city, value.province).map(s => s.name)
+                      : findSuburbs("", value.city, value.province).map(s => s.name);
+
+      let merged = Array.from(new Set(local));
+
+      if (q && merged.length < 8) {
+        try{
+          const parts = [q || value.city, value.city, value.province, "South Africa"].filter(Boolean).join(", ");
+          const url = `/api/geocode?q=${encodeURIComponent(parts)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}${value.city?`&city=${encodeURIComponent(value.city)}`:""}${center?`&lat=${center.lat}&lng=${center.lng}`:""}`;
+          const r = await fetch(url); const data = await r.json();
+          const remote = (data.features||[]).map((f:any)=> f.place_name || f.properties?.label || f.properties?.display_name || f.text || f.display_name);
+          merged = Array.from(new Set([...local, ...remote]));
+        }catch{}
       }
-    }, 350);
+
+      setSubOpts(merged.slice(0,20));
+      if(merged.length>0 && q.length>=0) setSubOpen(true);
+    }, 300);
     return ()=> clearTimeout(t);
   }, [subQ, value.city, value.province, center?.lat, center?.lng]);
 
diff --git a/src/components/map/LeafletMap.tsx b/src/components/map/LeafletMap.tsx
index 6c9547c..80ceeb2 100644
--- a/src/components/map/LeafletMap.tsx
+++ b/src/components/map/LeafletMap.tsx
@@ -1,5 +1,4 @@
 "use client";
-
 import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
 import L from "leaflet";
 import { useEffect, useMemo } from "react";
@@ -15,15 +14,14 @@ function FlyAndCentre({
   target,
   zoom,
   offsetPx = [0, 0],
-  duration = 0.8,
 }: {
   target?: L.LatLngExpression;
   zoom?: number;
   offsetPx?: [number, number];
-  duration?: number;
 }) {
   const map = useMap();
 
+  // keep size in sync
   useEffect(() => {
     if (!map) return;
     const container = map.getContainer();
@@ -32,20 +30,19 @@ function FlyAndCentre({
     ro.observe(container);
     const onWin = () => map.invalidateSize({ pan: true });
     window.addEventListener("resize", onWin);
-    return () => {
-      ro.disconnect();
-      window.removeEventListener("resize", onWin);
-    };
+    return () => { ro.disconnect(); window.removeEventListener("resize", onWin); };
   }, [map]);
 
+  // hard centre (no animation)
   useEffect(() => {
     if (!map || !target) return;
-    map.invalidateSize();
-    map.flyTo(target, zoom ?? map.getZoom(), { duration });
-    map.once("moveend", () => {
-      if (offsetPx[0] || offsetPx[1]) map.panBy(offsetPx, { animate: true });
-    });
-  }, [map, target, zoom, duration, offsetPx]);
+    map.stop();                 // cancel any in-flight animation
+    map.invalidateSize({ pan: true });
+    map.setView(target, zoom ?? map.getZoom(), { animate: false });
+    if (offsetPx[0] || offsetPx[1]) {
+      map.panBy(offsetPx, { animate: false });
+    }
+  }, [map, target, zoom, offsetPx]);
 
   return null;
 }
@@ -72,10 +69,7 @@ export default function LeafletMap({
         style={{ height: "100%", width: "100%", minHeight: 300 }}
         whenReady={(e) => e.target.invalidateSize()}
       >
-        <TileLayer
-          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
-          attribution="┬⌐ OpenStreetMap"
-        />
+        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="┬⌐ OpenStreetMap" />
         {selected && <Marker position={selected} />}
         <FlyAndCentre target={selected ?? undefined} zoom={selectedZoom} offsetPx={offset} />
       </MapContainer>


## search/page.tsx (first 160 lines)
"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PlacesAutocompletePhoton, { type PickedPlace } from "@/components/PlacesAutocompletePhoton";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function SearchPage() {
  const [picked, setPicked] = useState<PickedPlace | null>(null);
  const [text, setText] = useState<string>("");
  const [selectionToken, setSelectionToken] = useState(0);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center gap-6">
      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Search city / town / suburb / street</label>
          <PlacesAutocompletePhoton
            externalText={text}
            placeholder="Try: Durban · Bloemfontein · Sarel Cilliers St, Warden"
            onSelected={(p) => {
              setPicked(p);           // update chosen place
              setText(p.label);       // reflect text
              setSelectionToken(t => t + 1); // tell map it's a NEW selection
            }}
          />
          <div className="mt-2 text-[11px] text-neutral-600">
            <b>Fly target:</b> {picked?.label ?? "-"} · {picked?.lat?.toFixed(6)}, {picked?.lng?.toFixed(6)} · zoom {picked?.zoomHint ?? 14}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Map (click to drop · drag to adjust)</div>
          <MapView
            lat={picked?.lat}
            lng={picked?.lng}
            label={picked?.label}
            selectionToken={selectionToken}
            selectZoom={picked?.zoomHint ?? 14}
            onMove={(next) => {
              if (typeof next.label === "string" && next.label.length > 0) {
                setText(next.label);
              } else if (typeof next.lat === "number" && typeof next.lng === "number") {
                setText(`${next.lat.toFixed(6)}, ${next.lng.toFixed(6)}`);
              }
              setPicked(prev => prev
                ? { ...prev, lat: next.lat, lng: next.lng, label: next.label ?? prev.label }
                : { id: `${next.lat},${next.lng}`, label: next.label ?? `${next.lat}, ${next.lng}`, lat: next.lat, lng: next.lng }
              );
            }}
          />
        </div>
      </div>

      <div className="text-xs text-neutral-500">
        New search → map flies & centers (no manual resize needed). Click/drag keeps your zoom. Labels are place-first.
      </div>
    </div>
  );
}


## LeafletMap.tsx (first 220 lines)
"use client";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

function FlyAndCentre({
  target,
  zoom,
  offsetPx = [0, 0],
}: {
  target?: L.LatLngExpression;
  zoom?: number;
  offsetPx?: [number, number];
}) {
  const map = useMap();

  // keep size in sync
  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    map.whenReady(() => map.invalidateSize());
    const ro = new ResizeObserver(() => map.invalidateSize({ pan: true }));
    ro.observe(container);
    const onWin = () => map.invalidateSize({ pan: true });
    window.addEventListener("resize", onWin);
    return () => { ro.disconnect(); window.removeEventListener("resize", onWin); };
  }, [map]);

  // hard centre (no animation)
  useEffect(() => {
    if (!map || !target) return;
    map.stop();                 // cancel any in-flight animation
    map.invalidateSize({ pan: true });
    map.setView(target, zoom ?? map.getZoom(), { animate: false });
    if (offsetPx[0] || offsetPx[1]) {
      map.panBy(offsetPx, { animate: false });
    }
  }, [map, target, zoom, offsetPx]);

  return null;
}

export default function LeafletMap({
  initialCenter = [-28.74, 24.76],
  initialZoom = 6,
  selected,
  selectedZoom = 13,
  sidebarPx = 0,
}: {
  initialCenter?: [number, number];
  initialZoom?: number;
  selected?: [number, number] | null;
  selectedZoom?: number;
  sidebarPx?: number;
}) {
  const offset = useMemo<[number, number]>(() => [sidebarPx ? sidebarPx / 2 : 0, 0], [sidebarPx]);
  return (
    <div className="h-full w-full">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ height: "100%", width: "100%", minHeight: 300 }}
        whenReady={(e) => e.target.invalidateSize()}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
        {selected && <Marker position={selected} />}
        <FlyAndCentre target={selected ?? undefined} zoom={selectedZoom} offsetPx={offset} />
      </MapContainer>
    </div>
  );
}

