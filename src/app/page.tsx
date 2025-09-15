export default function Page() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome to Cosmoshift</h1>
      <p className="text-sm text-gray-600">
        A simple, fast local marketplace MVP.
      </p>

      <ul className="list-disc pl-6">
        <li>Search nearby listings</li>
        <li>Create a new listing</li>
        <li>Sign in to manage your profile</li>
      </ul>
    </section>
  );
}
