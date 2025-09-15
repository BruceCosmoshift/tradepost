"use client";
import { ZA_PROVINCES } from "../../lib/za";
export function ProvinceCitySelect({
  value, onChange, showSuburb=false, suburb, onSuburbChange
}:{ value:{province?:string; city?:string}; onChange:(v:any)=>void; showSuburb?:boolean; suburb?:string; onSuburbChange?:(s:string)=>void }){
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <label className="block">
        <div className="text-sm font-medium">Province</div>
        <select className="mt-1 w-full border rounded-xl p-2" value={value.province||""}
          onChange={e=>onChange({ ...value, province:e.target.value||undefined, city:undefined })}>
          <option value="">Select…</option>
          {ZA_PROVINCES.map(p=> <option key={p} value={p}>{p}</option>)}
        </select>
      </label>
      <label className="block">
        <div className="text-sm font-medium">City/Town</div>
        <input className="mt-1 w-full border rounded-xl p-2" placeholder="Start typing…"
          value={value.city||""} onChange={e=>onChange({ ...value, city:e.target.value||undefined })}/>
      </label>
      {showSuburb && <label className="block">
        <div className="text-sm font-medium">Suburb</div>
        <input className="mt-1 w-full border rounded-xl p-2" placeholder="Optional suburb…"
          value={suburb||""} onChange={e=>onSuburbChange?.(e.target.value)}/>
      </label>}
    </div>
  );
}
