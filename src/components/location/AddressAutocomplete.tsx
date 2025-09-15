"use client";
import { useEffect, useState } from "react";

export default function AddressAutocomplete({
  value, onChange, bias
}:{ value:string; onChange:(v:{address:string;lat?:number;lng?:number})=>void; bias?:{province?:string;city?:string} }){
  const [q,setQ] = useState(value);
  const [opts,setOpts] = useState<any[]>([]);
  useEffect(()=>{
    const t = setTimeout(async ()=>{
      if(!q || q.length<3){ setOpts([]); return; }
      const url = `/api/geocode?q=${encodeURIComponent(q)}${bias?.province?`&province=${encodeURIComponent(bias.province)}`:""}${bias?.city?`&city=${encodeURIComponent(bias.city)}`:""}`;
      const r = await fetch(url); const data = await r.json();
      const list = data.features?.slice(0,8) || [];
      setOpts(list);
    }, 350);
    return ()=> clearTimeout(t);
  }, [q, bias?.province, bias?.city]);
  return (
    <div className="relative">
      <input className="w-full border rounded-xl p-2" value={q} onChange={e=>setQ(e.target.value)} placeholder="Type an address" />
      {opts.length>0 && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-xl shadow overflow-hidden">
          {opts.map((f:any,i:number)=>{
            const name = f.place_name || f.properties?.label || f.display_name;
            const center = f.center || (f.geometry?.coordinates);
            const lng = center?.[0], lat = center?.[1];
            return (
              <button key={i} className="w-full text-left p-3 hover:bg-gray-50"
                onClick={()=> onChange({ address:String(name), lat, lng })}>{String(name)}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}
