"use client";
import { useEffect, useRef, useState } from "react";
import * as ZA from "../../lib/za";

// Accept either export shape:
const ZA_PROVINCES: readonly string[] =
  (ZA as any).ZA_PROVINCES ??
  ["Eastern Cape","Free State","Gauteng","KwaZulu-Natal","Limpopo","Mpumalanga","Northern Cape","North West","Western Cape"];

const PROVINCE_CITIES: Record<string, string[]> =
  (ZA as any).PROVINCE_CITIES ??
  (ZA as any).ZA_PROVINCE_CITIES ??
  {};

type PC = { province?: string; city?: string };

export function ProvinceCitySelect({
  value, onChange, showSuburb=false, suburb, onSuburbChange
}:{ value: PC; onChange:(v:PC)=>void; showSuburb?:boolean; suburb?:string; onSuburbChange?:(s:string)=>void }){
  const [cityQ, setCityQ] = useState(value.city || "");
  const [cityOpts, setCityOpts] = useState<string[]>([]);
  const [cityOpen, setCityOpen] = useState(false);

  const [subQ, setSubQ] = useState(suburb || "");
  const [subOpts, setSubOpts] = useState<string[]>([]);
  const [subOpen, setSubOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const subRef  = useRef<HTMLDivElement>(null);

  const NATIONAL_DEFAULTS = ["Johannesburg","Pretoria","Cape Town","Durban","Gqeberha","Bloemfontein","Polokwane","Mbombela","Kimberley","Mahikeng"];

  useEffect(()=>{
    function outside(e:MouseEvent){
      if(!cityRef.current?.contains(e.target as Node)) setCityOpen(false);
      if(!subRef.current?.contains(e.target as Node)) setSubOpen(false);
    }
    document.addEventListener("mousedown", outside);
    return ()=> document.removeEventListener("mousedown", outside);
  },[]);

  // Seed city list when province changes (or none selected)
  useEffect(()=>{
    const seed = value.province && PROVINCE_CITIES[value.province] ? PROVINCE_CITIES[value.province] : NATIONAL_DEFAULTS;
    setCityOpts(seed);
  }, [value.province]);

  // Filter + fetch city suggestions while typing (constrained by province when present)
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      const term = cityQ.trim().toLowerCase();
      const seed = value.province && PROVINCE_CITIES[value.province] ? PROVINCE_CITIES[value.province] : NATIONAL_DEFAULTS;
      let merged = seed;

      if(term){
        const local = seed.filter(n => n.toLowerCase().includes(term));
        try{
          const q = [cityQ, value.province, "South Africa"].filter(Boolean).join(", ");
          const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}`);
          const data = await r.json();
          const remote = (data.features||[]).map((f:any)=> f.place_name || f.properties?.label || f.text || f.display_name);
          merged = Array.from(new Set([...local, ...remote]));
        }catch{
          merged = local;
        }
      }
      setCityOpts(merged.slice(0,12));
      if(merged.length>0) setCityOpen(true);
    }, 200);
    return ()=> clearTimeout(t);
  }, [cityQ, value.province]);

  // Suburb suggestions only after a city is chosen
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      if(!value.city){ setSubOpts([]); setSubOpen(false); return; }
      const term = subQ.trim();
      const q = [term || value.city, value.city, value.province, "South Africa"].filter(Boolean).join(", ");
      try{
        const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}${value.province?`&province=${encodeURIComponent(value.province)}`:""}${value.city?`&city=${encodeURIComponent(value.city)}`:""}`);
        const data = await r.json();
        const names = (data.features||[]).map((f:any)=> f.place_name || f.properties?.label || f.text || f.display_name);
        setSubOpts(Array.from(new Set(names)).slice(0,12));
      }catch{
        setSubOpts([]);
      }
    }, 250);
    return ()=> clearTimeout(t);
  }, [subQ, value.city, value.province]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Province */}
      <label className="block">
        <div className="text-sm font-medium">Province</div>
        <select
          className="mt-1 w-full border rounded-xl p-2"
          value={value.province||""}
          onChange={e=>{
            const province = e.target.value || undefined;
            onChange({ province, city: undefined });
            setCityQ(""); setSubQ(""); setSubOpts([]);
          }}
        >
          <option value="">Select…</option>
          {ZA_PROVINCES.map((p:any)=> <option key={String(p)} value={String(p)}>{String(p)}</option>)}
        </select>
      </label>

      {/* City combobox */}
      <div className="block" ref={cityRef} style={{ position:"relative" }}>
        <div className="text-sm font-medium">City/Town</div>
        <input
          className="mt-1 w-full border rounded-xl p-2"
          placeholder={value.province ? "Type or choose city…" : "Choose province first (optional)"}
          value={cityQ}
          onFocus={()=> setCityOpen(true)}
          onChange={e=>{ setCityQ(e.target.value); setCityOpen(true); }}
        />
        {cityOpen && cityOpts.length>0 && (
          <div style={{ position:"absolute", zIndex:20, marginTop:4, width:"calc(100% - 2px)", background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
            {cityOpts.map((name,i)=>(
              <button key={i} type="button"
                style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #f3f4f6", background:"white", cursor:"pointer" }}
                onClick={()=>{ setCityQ(name); setCityOpen(false); onChange({ ...value, city: name }); }}
              >{name}</button>
            ))}
          </div>
        )}
      </div>

      {/* Suburb combobox */}
      {showSuburb && (
        <div className="block" ref={subRef} style={{ position:"relative" }}>
          <div className="text-sm font-medium">Suburb</div>
          <input
            className="mt-1 w-full border rounded-xl p-2"
            placeholder={value.city ? "Type or choose suburb…" : "Choose city first"}
            value={subQ}
            disabled={!value.city}
            onFocus={()=> value.city && setSubOpen(true)}
            onChange={e=>{ setSubQ(e.target.value); onSuburbChange?.(e.target.value); setSubOpen(true); }}
          />
          {subOpen && subOpts.length>0 && value.city && (
            <div style={{ position:"absolute", zIndex:20, marginTop:4, width:"calc(100% - 2px)", background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 4px 16px rgba(0,0,0,0.08)" }}>
              {subOpts.map((name,i)=>(
                <button key={i} type="button"
                  style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 12px", borderBottom:"1px solid #f3f4f6", background:"white", cursor:"pointer" }}
                  onClick={()=>{ onSuburbChange?.(name); setSubQ(name); setSubOpen(false); }}
                >{name}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}