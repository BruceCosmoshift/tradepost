export default function DevIndex(){
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dev pages</h1>
      <ul className="list-disc pl-5 space-y-1">
        <li><a className="text-blue-600 underline" href="/dev/location">Location UI test</a></li>
        <li><a className="text-blue-600 underline" href="/listings/new">New Listing (wired to test)</a></li>
      </ul>
    </main>
  );
}