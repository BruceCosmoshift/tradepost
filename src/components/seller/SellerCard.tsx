import { SellerBadge } from "./SellerBadge";
export default function SellerCard({ profile, nearestBranch }:{
  profile: any, nearestBranch?: any
}){
  return (
    <aside className="p-4 border rounded-2xl space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div>
          <div className="font-semibold">{profile.displayName ?? "Seller"}</div>
          <div className="flex gap-2 flex-wrap">
            <SellerBadge type="email" status={profile.emailVerified ?? "UNVERIFIED"} />
            <SellerBadge type="id" status={profile.idVerified ?? "UNVERIFIED"} />
            {profile.type==="BUSINESS" && <SellerBadge type="business" status={profile.businessVerified ?? "UNVERIFIED"} />}
            {nearestBranch && <SellerBadge type="address" status={nearestBranch.addressVerified ?? "UNVERIFIED"} />}
          </div>
        </div>
      </div>
      {nearestBranch && <div className="text-sm text-gray-600">Nearest branch: {nearestBranch.label}</div>}
      <a className="block text-center px-4 py-2 rounded-2xl bg-black text-white hover:opacity-90" href={`/seller/${profile.slug ?? "seller"}`}>View profile & all items</a>
    </aside>
  );
}
