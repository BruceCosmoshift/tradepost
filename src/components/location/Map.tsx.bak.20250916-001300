"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map({
  lat, lng, zoom=12, onPick
}:{ lat:number; lng:number; zoom?:number; onPick?:(p:{lat:number;lng:number})=>void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(!ref.current) return;
    const styleUrl = process.env.NEXT_PUBLIC_MAPTILER_KEY
      ? `https://api.maptiler.com/maps/streets/style.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`
      : "https://demotiles.maplibre.org/style.json";
    const map = new maplibregl.Map({ container: ref.current, style: styleUrl, center: [lng,lat], zoom });
    const marker = new maplibregl.Marker({ draggable: !!onPick }).setLngLat([lng,lat]).addTo(map);
    if(onPick){ marker.on("dragend", ()=>{ const p = marker.getLngLat(); onPick({lat:p.lat,lng:p.lng}) }) }
    return ()=> map.remove();
  }, [lat,lng,zoom]);
  return <div ref={ref} className="h-64 w-full rounded-2xl overflow-hidden" />;
}
