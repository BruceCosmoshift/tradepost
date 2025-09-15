"use client";
import { useId } from "react";
export type Privacy = "EXACT"|"APPROX"|"CITY_ONLY";
export function PrivacyLevelRadio({ value, onChange }:{
  value:Privacy; onChange:(v:Privacy)=>void
}){
  const id = useId();
  const opts = [
    {key:"EXACT", label:"Exact pin", hint:"Best for shops/businesses"},
    {key:"APPROX", label:"Approximate area", hint:"~1–2 km circle"},
    {key:"CITY_ONLY", label:"City only", hint:"Show only city name"},
  ] as const;
  return (
    <div role="radiogroup" aria-labelledby={`${id}-lbl`} className="grid gap-2">
      <div id={`${id}-lbl`} className="text-sm font-medium">Privacy</div>
      {opts.map(o=>(
        <label key={o.key} className={`border rounded-xl p-3 flex items-start gap-2 ${value===o.key?'border-black':'border-gray-300'}`}>
          <input type="radio" name={id} checked={value===o.key} onChange={()=>onChange(o.key as Privacy)} />
          <div><div className="font-medium">{o.label}</div><div className="text-sm text-gray-500">{o.hint}</div></div>
        </label>
      ))}
    </div>
  );
}
