"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
          displayName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
      } else {
        // After successful signup, send them to login
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Create account</h1>

        {error && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Username (handle)
            </label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Display name
            </label>
            <input
              type="text"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-xs text-slate-500">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-700 hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </main>
  );
}
