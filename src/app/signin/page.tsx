export default function SignInPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <div className="grid gap-2 max-w-xs">
        <input className="border rounded p-2" placeholder="Email" />
        <input className="border rounded p-2" placeholder="Password" type="password" />
        <button className="bg-black text-white rounded p-2 w-max">Continue</button>
      </div>
      <p className="text-sm text-gray-600">
        Social sign-in (Google/Facebook/Apple) to be added later.
      </p>
    </section>
  );
}
