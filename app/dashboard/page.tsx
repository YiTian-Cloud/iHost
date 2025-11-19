"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface MeUser {
  id: string;
  username: string;
  displayName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        const data = (await res.json()) as { user: MeUser | null };

        if (cancelled) return;

        if (!data.user) {
          // not logged in → go to login
          router.replace("/login");
        } else {
          setUser(data.user);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError("Failed to load dashboard");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMe();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white shadow px-6 py-4 text-slate-700">
          Loading your dashboard...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white shadow px-6 py-4 text-red-700">
          {error}
        </div>
      </main>
    );
  }

  if (!user) {
    // brief state before redirect
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">
          Welcome, {user.displayName}
        </h1>

        <p className="text-slate-700">
          Your handle:{" "}
          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            @{user.username}
          </span>
        </p>

        <p className="text-sm text-slate-500">
          Your public page will be at{" "}
          <code>/u/{user.username}</code>.
        </p>

        <button
          type="button"
          onClick={() => router.push("/dashboard/editor")}
          className="mt-2 w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Open Page Editor
        </button>
      </div>
    </main>
  );
}
