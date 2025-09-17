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