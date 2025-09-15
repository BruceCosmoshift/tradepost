"use client";

import { useState } from "react";

export default function NewListingPage() {
  const [saved, setSaved] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      title: String(fd.get("title") || ""),
      priceZar: fd.get("price") ? Number(fd.get("price")) : null,
      description: String(fd.get("description") || ""),
      free: fd.get("free") === "on",
      ageRestricted: fd.get("age") === "on",
      photos: (fd.getAll("photos") as File[]).map((f) => f.name),
    };
    console.log("New listing (mock save):", data);
    setSaved("Saved (mock). Check the browser console for submitted data.");
    e.currentTarget.reset();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Create a listing</h1>

      <form className="grid gap-3 max-w-xl" onSubmit={onSubmit}>
        <input name="title" className="border rounded p-2" placeholder="Title" required />
        <input name="price" className="border rounded p-2" placeholder="Price (ZAR) — leave blank for FREE" inputMode="numeric" />
        <textarea name="description" className="border rounded p-2" placeholder="Description" rows={5} />
        <input name="photos" className="border rounded p-2" type="file" multiple />

        <label className="inline-flex items-center gap-2 text-sm">
          <input name="free" type="checkbox" /> Mark as FREE item
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input name="age" type="checkbox" /> Age-restricted
        </label>

        <button className="bg-indigo-600 text-white rounded p-2 w-max">Save</button>
      </form>

      {saved && <p className="text-sm text-green-700">{saved}</p>}
      <p className="text-xs text-gray-500">Tip: Open <strong>DevTools → Console</strong> to see the submitted data (Ctrl+Shift+I).</p>
    </section>
  );
}
