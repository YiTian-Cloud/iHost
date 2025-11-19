import Link from "next/link";

export default function HomePage() {
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
            Bring all of <span className="text-emerald-600">you</span> into
            one page.
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

        {/* Simple “what you can do” section */}
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
      </div>
    </main>
  );
}
