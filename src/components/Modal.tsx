"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose?: () => void;
}) {
  const router = useRouter();

  const close = () => {
    if (onClose) onClose();
    // Go back to the previous page (usually /search)
    router.back();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={close}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="max-h-[90vh] w-[90vw] max-w-2xl overflow-auto rounded-xl bg-white shadow-xl"
        onClick={stop}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="font-medium">Listing</div>
          <button
            onClick={close}
            className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
