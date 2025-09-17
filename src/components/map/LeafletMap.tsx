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
  duration = 0.8,
}: {
  target?: L.LatLngExpression;
  zoom?: number;
  offsetPx?: [number, number];
  duration?: number;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const container = map.getContainer();
    map.whenReady(() => map.invalidateSize());
    const ro = new ResizeObserver(() => map.invalidateSize({ pan: true }));
    ro.observe(container);
    const onWin = () => map.invalidateSize({ pan: true });
    window.addEventListener("resize", onWin);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onWin);
    };
  }, [map]);

  useEffect(() => {
    if (!map || !target) return;
    map.invalidateSize();
    map.flyTo(target, zoom ?? map.getZoom(), { duration });
    map.once("moveend", () => {
      if (offsetPx[0] || offsetPx[1]) map.panBy(offsetPx, { animate: true });
    });
  }, [map, target, zoom, duration, offsetPx]);

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
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        {selected && <Marker position={selected} />}
        <FlyAndCentre target={selected ?? undefined} zoom={selectedZoom} offsetPx={offset} />
      </MapContainer>
    </div>
  );
}