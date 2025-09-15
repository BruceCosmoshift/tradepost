export function SellerBadge({ type, status }:{
  type:"email"|"id"|"business"|"address"; status:"VERIFIED"|"PENDING"|"UNVERIFIED"
}){
  const label = { email:"Email", id:"ID", business:"Business", address:"Address" }[type];
  const base = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs";
  const clr = status==="VERIFIED" ? "bg-teal-100 text-teal-800"
    : status==="PENDING" ? "bg-amber-100 text-amber-800"
    : "bg-gray-100 text-gray-700";
  const icon = status==="VERIFIED" ? "✓" : status==="PENDING" ? "⏳" : "ⓘ";
  return <span className={`${base} ${clr}`} title={`${label}: ${status.toLowerCase()}`}>{icon} {label}</span>;
}
