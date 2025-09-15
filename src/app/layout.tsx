import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cosmoshift",
  description: "Local marketplace MVP",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gray-50 text-gray-900">
<header className="bg-indigo-600 text-white">
  <nav className="mx-auto max-w-5xl flex gap-4 p-4">
    <Link href="/" className="font-semibold">Cosmoshift</Link>
    <Link href="/search" className="hover:underline">Search</Link>
    <Link href="/listing/new" className="hover:underline">New Listing</Link>
    <Link href="/profile" className="hover:underline">Profile</Link>
    <Link href="/signin" className="ml-auto hover:underline">Sign in</Link>
  </nav>
</header>

        <main className="mx-auto max-w-5xl p-4">{children}</main>
      </body>
    </html>
  );
}
