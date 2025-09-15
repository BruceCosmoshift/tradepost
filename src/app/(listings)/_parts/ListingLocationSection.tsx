"use client";
import { useState, useEffect } from "react";
import Map from "@/src/components/location/Map";
import { PrivacyLevelRadio, type Privacy } from "@/src/components/location/PrivacyLevelRadio";
import AddressAutocomplete from "@/src/components/location/AddressAutocomplete";
import { ProvinceCitySelect } from "@/src/components/location/ProvinceCitySelect";

export default function ListingLocationSection(){
  const [useDefault, setUseDefault] = useState(true);
  const [privacy, setPrivacy] = useState<Privacy>("CITY_ONLY");
  const [pos, setPos] = useState<{lat:number;lng:number}|null>(null);
  const [addr, setAddr] = useState("");
  const [pc, setPc] = useState<{province?:string;city?:string}>({});
  const [suburb, setSuburb] = useState<string>("");

  useEffect(()=>{ /* TODO: hydrate defaults from user */ }, []);

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold">Listing location</h3>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={useDefault} onChange={e=>setUseDefault(e.target.checked)} />
        <span>Use my default location</span>
      </label>
      {!useDefault && (
        <>
          <AddressAutocomplete value={addr} onChange={(v)=>{ setAddr(v.address); if(v.lat && v.lng) setPos({lat:v.lat, lng:v.lng}); }} bias={pc}/>
          <ProvinceCitySelect value={pc} onChange={setPc} showSuburb={true} suburb={suburb} onSuburbChange={setSuburb} />
          <Map lat={pos?.lat ?? -27.996} lng={pos?.lng ?? 29.208} onPick={async (p)=>{
            setPos(p);
            const r = await fetch(`/api/revgeocode?lat=${p.lat}&lng=${p.lng}`); const data = await r.json();
            if(data?.label) { setAddr(data.label); }
          }}/>
          <PrivacyLevelRadio value={privacy} onChange={setPrivacy} />
        </>
      )}
    </section>
  );
}
