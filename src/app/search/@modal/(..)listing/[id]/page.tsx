"use client";

import { use } from "react";
import Modal from "@/components/Modal"; // or: import Modal from "../../../components/Modal";
import { listings } from "@/data/listings"; // adjust path if needed
import { formatZar } from "@/lib/format";   // or: import { formatZar } from "../../../lib/format";

export default function ListingModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // In Next 15, params is a Promise — unwrap with React.use()
  const { id } = use(params);

  const item = listings.find((l: any) => String(l.id) === String(id));

  if (!item) {
    return (
      <Modal>
        <h1 className="text-xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-gray-600">
          We couldn’t find that listing. It may have been moved or deleted.
        </p>
      </Modal>
    );
  }

  return (
    <Modal>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{item.title}</h1>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.photo}
          alt={item.title}
          className="w-full max-h-80 rounded-lg border object-cover"
        />

        <div className="text-lg">
          {item.isFree ? (
            <span className="font-medium">FREE</span>
          ) : (
            <span className="font-medium" suppressHydrationWarning>
              {formatZar(item.priceZar)}
            </span>
          )}
        </div>

        <div className="text-sm text-gray-600 space-x-2">
          <span>Category: {item.category}</span>
          {" • "}
          <span>
            Distance:{" "}
            {typeof (item as any).distanceKm === "number"
              ? `${Math.round((item as any).distanceKm)} km`
              : "— km"}
          </span>
        </div>

        {item.description && (
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {item.description}
          </p>
        )}
      </div>
    </Modal>
  );
}
