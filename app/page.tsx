import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Page } from "@/models/Page";
import { Profile } from "@/models/Profile";
import HeroQrClient from "./HeroQrClient"; // ✅ default import

interface CommunityItem {
  username: string;
  displayName: string;
  title: string;
}

// Server-side helper to load community members
async function getCommunityMembers(): Promise<CommunityItem[]> {
  await connectDB();

  const pages = await Page.find({
    published: true,
    communityListed: true,
  })
    .sort({ updatedAt: -1 })
    .limit(24)
    .lean();

  if (!pages.length) return [];

  const userIds = pages
    .map((p: any) => (p.userId ? p.userId.toString() : null))
    .filter(Boolean);

  const profiles = await Profile.find({ userId: { $in: userIds } }).lean();
  const profileMap = new Map(
    profiles.map((p: any) => [p.userId.toString(), p])
  );

  return pages.map((p: any) => {
    const prof = profileMap.get(p.userId.toString());
    const title =
      p.title ||
      (prof?.displayName ? `${prof.displayName}'s iHost` : "iHost page");

    return {
      username: prof?.username || "unknown",
      displayName: prof?.displayName || "",
      title,
    };
  });
}

export default async function HomePage() {
  const community = await getCommunityMembers();

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-12 space-y-10">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          iHost · your personal home on the web
        </div>

        {/* Hero */}
        <section className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-snug">
            Bring all of <span className="text-emerald-600">you</span> into one
            page.
          </h1>

          <p className="text-base md:text-lg text-slate-700 leading-relaxed">
            iHost is your personal hub for everything you do online — apps,
            projects, social links, writing, and your iStacks posts. Create a
            simple public page that reflects who you are and share it with
            anyone.
          </p>

          {/* Primary actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
            >
              Create your iHost page
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50 transition"
            >
              Sign in
            </Link>
          </div>


        </section>

        {/* What you can do */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              One page for everything
            </h2>
            <p className="text-sm text-slate-600">
              Add text blocks, links to your apps (Golf Connect, AddMe, WeTalk,
              eCart), and more — all in one clean, shareable page.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              iStacks for your writing
            </h2>
            <p className="text-sm text-slate-600">
              Publish short posts or longer thoughts as iStacks entries. Each
              post becomes part of your personal stack of ideas.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Simple editor, instant publish
            </h2>
            <p className="text-sm text-slate-600">
              Use the dashboard editor to add, update, and reorder your blocks.
              Click publish and your public page is live at{" "}
              <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">
                /u/your-handle
              </span>
              .
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Own your identity
            </h2>
            <p className="text-sm text-slate-600">
              Instead of scattered links, iHost becomes the glue that ties your
              work, interests, and social identity together in the virtual
              world.
            </p>
          </div>
        </section>

        {/* Featured / Posted Community */}
        <section className="space-y-3 pt-4 border-t border-emerald-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Featured iHost community
          </h2>
          <p className="text-sm text-slate-600">
            These are real iHost pages that chose to be listed. Click any handle
            to see how they bring their apps, links, and iStacks together.
          </p>

          {community.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 p-4 text-sm text-emerald-800">
              No pages are listed yet. Publish your page in the editor and
              enable{" "}
              <span className="font-semibold">
                “List my page in Posted Community”
              </span>{" "}
              to appear here.
            </div>
          ) : (
            <div className="space-y-2">
              {community.map((item) => (
                <Link
                  key={item.username}
                  href={`/u/${encodeURIComponent(
                    item.username
                  )}?handle=${encodeURIComponent(item.username)}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm hover:border-emerald-400 hover:bg-emerald-50 transition"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">
                      {item.displayName || item.username}
                    </p>
                    <p className="text-xs text-slate-500">@{item.username}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {item.title}
                    </p>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    View page ↗
                  </span>
                </Link>
              ))}
            </div>
          )}

          <p className="text-[11px] text-slate-500 pt-1">
            Want to join? Create an iHost page, publish it, and toggle “Community
            visibility” in your editor.
          </p>

                    {/* QR widget under hero */}
                    <div className="pt-4">
            <HeroQrClient />
          </div>
        </section>
      </div>
    </main>
  );
}
