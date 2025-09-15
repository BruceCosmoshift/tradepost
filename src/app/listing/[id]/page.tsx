import { use } from "react";
import Link from "next/link";
import { listings } from "@/data/listings"; // adjust path if needed
import { formatZar } from "@/lib/format";   // adjust path if needed

export default function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params (Next 15)
  const { id } = use(params);

  const item = listings.find((l: any) => String(l.id) === String(id));

  if (!item) {
    return (
      <section className="p-6">
        <h1 className="text-xl font-semibold">Listing not found</h1>
        <Link href="/search" className="mt-3 inline-block text-indigo-600 hover:underline">
          ← Back to search
        </Link>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-4">
      <Link href="/search" className="text-indigo-600 hover:underline">
        ← Back to search
      </Link>

      <h1 className="text-2xl font-semibold">{item.title}</h1>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.photo} alt={item.title} className="w-full max-h-96 rounded-lg border object-cover" />

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
      </div>

      {item.description && (
        <p className="text-sm text-gray-700 whitespace-pre-line">{item.description}</p>
      )}
    </section>
  );
}
