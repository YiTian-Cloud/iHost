import { connectDB } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { Page } from "@/models/Page";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import sanitizeHtml from "sanitize-html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeRichHtml(html: string) {
  return sanitizeHtml(String(html ?? ""), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "h1",
      "h2",
      "h3",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "span",
    ],
    allowedAttributes: {
      span: ["style"],
    },
    // Allow TipTap inline color/highlight styles
    allowedStyles: {
      span: {
        color: [/^#(0-9a-fA-F){3,8}$/, /^rgb\(/, /^rgba\(/],
        "background-color": [/^#(0-9a-fA-F){3,8}$/, /^rgb\(/, /^rgba\(/],
      },
    },
  });
}


export default async function PublicProfilePage({
  params,
  searchParams,
}: {
  params: any;       // normalize runtime
  searchParams: any; // normalize runtime
}) {
  // ✅ Normalize params (sometimes Next can pass unexpected shapes)
  const p = typeof params?.then === "function" ? await params : (params ?? {});
  const rawUsername = p?.username;

  // ✅ Normalize searchParams
  const sp =
    typeof searchParams?.then === "function"
      ? await searchParams
      : (searchParams ?? {});

  const rawHandle = Array.isArray(sp?.handle) ? sp.handle[0] : sp?.handle;
  const handle = String(rawHandle ?? "").trim();

  // ✅ Safe path username (fallback to yitian for demo)
  const pathUsername = String(rawUsername ?? "yitian").trim();

  // ✅ Canonicalize /u/yitian → /u/yitian?handle=yitian
  if (!handle && pathUsername) {
    redirect(`/u/${pathUsername}?handle=${pathUsername}`);
  }

  const username = handle || pathUsername;

  console.log("Public page username resolved as:", username);

  if (!username) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white shadow rounded-2xl p-6 space-y-2 max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            No username in URL
          </h1>
          <p className="text-sm text-slate-600">
            This page expects a URL like{" "}
            <span className="font-mono">
              /u/your-handle?handle=your-handle
            </span>
            .
          </p>
        </div>
      </main>
    );
  }

  await connectDB();

  // 1) Find profile by username
  let profileDoc: any = null;
  try {
    profileDoc = await Profile.findOne({ username }).lean();
  } catch (err) {
    console.error("Error loading profile:", err);
  }

  if (!profileDoc) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white shadow rounded-2xl p-6 space-y-2 max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Profile not found
          </h1>
          <p className="text-sm text-slate-600">
            We couldn&apos;t find a profile for{" "}
            <span className="font-mono">@{username}</span>.
          </p>
          <div className="mt-4">
            <a
              href="/"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create your own page
            </a>
          </div>
        </div>
      </main>
    );
  }

  const userId =
    profileDoc.userId && profileDoc.userId.toString
      ? profileDoc.userId.toString()
      : profileDoc.userId || profileDoc._id.toString();

  let pageDoc: any = null;
  try {
    pageDoc = await Page.findOne({
      userId,
      published: true,
    }).lean();
  } catch (err) {
    console.error("Error loading page:", err);
  }

  if (!pageDoc) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white shadow rounded-2xl p-6 space-y-2 max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">
            Page not published yet
          </h1>
          <p className="text-sm text-slate-600">
            The profile{" "}
            <span className="font-mono">@{profileDoc.username}</span> exists,
            but no published page was found.
          </p>
          <p className="text-xs text-slate-500">
            Log in as this user, open the Page Editor, add some content, and
            click <span className="font-semibold">Publish</span>.
          </p>
          <div className="mt-4">
            <a
              href="/register"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Create your own page
            </a>
          </div>
        </div>
      </main>
    );
  }

  const blocks: any[] = pageDoc.blocks || [];
  const textAndLinkBlocks = blocks.filter(
    (b) => b.type === "text" || b.type === "link"
  );
  const postBlocks = blocks.filter((b) => b.type === "post");
  

  return (
    <main className="min-h-screen flex justify-center bg-gradient-to-b from-emerald-50 to-white px-4 py-8">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {pageDoc.title || profileDoc.displayName}
          </h1>
          <p className="text-sm text-gray-500">@{profileDoc.username}</p>
        </div>

        <div className="space-y-4">
         {textAndLinkBlocks.map((block, index) => {

            if (block.type === "text") {
              const style =
                block.style === "heading" || block.style === "subheading"
                  ? block.style
                  : "body";

              if (style === "heading") {
                return (
                  <h2
                    key={index}
                    className="text-2xl font-semibold text-gray-900"
                  >
                    {block.text}
                  </h2>
                );
              }

              if (style === "subheading") {
                return (
                  <h3
                    key={index}
                    className="text-lg font-medium text-gray-800"
                  >
                    {block.text}
                  </h3>
                );
              }

              return (
                <p
                  key={index}
                  className="text-base text-gray-800 leading-relaxed"
                >
                  {block.text}
                </p>
              );
            }

            if (block.type === "link") {
              return (
                <div
                  key={index}
                  className="rounded-xl border bg-white shadow-sm p-4
                             transition-all duration-300 hover:bg-emerald-50 hover:border-emerald-400
                             group"
                >
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="font-medium text-emerald-800 text-center">
                      {block.text || block.url}
                    </div>
            
                    {block.description && (
                      <p
                        className="mt-2 text-sm text-gray-600 text-center
                                   opacity-0 max-h-0 overflow-hidden
                                   group-hover:opacity-100 group-hover:max-h-24
                                   transition-all duration-300"
                      >
                        {block.description}
                      </p>
                    )}
                  </a>
                </div>
              );
            }
            
            return null;
          })}
        </div>

        {/* iStacks section */}
{postBlocks.length > 0 && (
  <section className="mt-8 space-y-3">
    <h2 className="text-xl font-semibold text-gray-900">iStacks</h2>
    <p className="text-xs text-gray-500">
      Essays, notes, and posts written by @{profileDoc.username}.
    </p>

    <div className="space-y-3">
      {postBlocks.map((block: any, index: number) => (
        <details
          key={index}
          className="group rounded-xl border border-indigo-200 bg-white shadow-sm"
        >
          <summary className="cursor-pointer list-none px-4 py-3 flex flex-col gap-1">
            <span className="text-sm font-semibold text-indigo-800">
              {block.text || "Untitled iStacks Post"}
            </span>
            {block.description && (
              <span className="text-xs text-gray-500">
                {block.description}
              </span>
            )}
            <span className="text-[11px] text-indigo-500 group-open:hidden">
              Click to read
            </span>
            <span className="text-[11px] text-indigo-500 hidden group-open:inline">
              Click to collapse
            </span>
          </summary>
          <div
  className="px-4 pb-4 pt-3 text-sm text-gray-800 border-t border-indigo-100
             prose prose-sm max-w-none prose-headings:mt-3 prose-p:my-2 prose-li:my-1"
             dangerouslySetInnerHTML={{
              __html: sanitizeRichHtml(String(block.content ?? "")),
            }}
            
/>

        </details>
      ))}
    </div>
  </section>
)}

<div className="pt-6 border-t border-emerald-100 mt-4 space-y-3">
          {/* Owner / power actions */}
          <div className="flex flex-wrap justify-center gap-2">
            {/* Edit mode (for the owner; others will hit login) */}
            <a
              href="/dashboard/editor"
              className="inline-flex items-center rounded-full border border-emerald-500/70 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              ✏️ Edit this iHost
            </a>

            {/* View other host pages (community wall on landing) */}
            <a
              href="/"
              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100"
            >
              👀 View iHost Community
            </a>
          </div>

          {/* CTA for new users */}
          <div className="pt-2 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Want your own iHost page?
            </p>
            <a
              href="/"
              className="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Create your page
            </a>
          </div>
        </div>

      </div>
    </main>
  );
}
