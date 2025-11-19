"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Block =
  | {
      id: string;
      type: "text";
      text: string;
      style: "body" | "heading" | "subheading";
      url?: undefined;
      description?: undefined;
    }
  | {
      id: string;
      type: "link";
      text: string;
      url: string;
      style?: "body" | "heading" | "subheading";
      description?: string;
      content?: undefined;
    }
    | {
      id: string;
      type: "post";
      text: string;               // post title
      content: string;            // full article
      style?: "body" | "heading" | "subheading";
      description?: string;       // short summary/excerpt
      url?: undefined;
    };
    
interface PageResponse {
  title: string;
  published: boolean;
  blocks: { type: string; text?: string; url?: string; style?: string }[];
}

interface MeResponse {
  user:
    | {
        id: string;
        username: string;
        displayName: string;
      }
    | null;
}

export default function PageEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("My iHost Page");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Load current user + page
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // who am I
        const meRes = await fetch("/api/auth/me", {
          headers: { Accept: "application/json" },
        });

        if (meRes.status === 401) {
          router.replace("/login");
          return;
        }

        const meData: MeResponse = await meRes.json();
        if (cancelled) return;

        if (!meData.user) {
          router.replace("/login");
          return;
        }

        setUsername(meData.user.username);

        // load their page
        const res = await fetch("/api/page");
        if (res.status === 401) {
          router.replace("/login");
          return;
        }

        const data: PageResponse | { error: string } = await res.json();
        if (cancelled) return;

        if ("error" in data) {
          setError(data.error);
        } else {
          setTitle(data.title || "My iHost Page");
          setPublished(!!data.published);

          const withIds: Block[] = (data.blocks || []).map((b, idx) => {
            const baseStyle =
              b.style === "heading" || b.style === "subheading"
                ? (b.style as "heading" | "subheading")
                : "body";
          
            if (b.type === "link") {
              return {
                id: `${idx}-${Date.now()}`,
                type: "link",
                text: b.text || "",
                url: b.url || "",
                style: baseStyle,
                description: b.description || "",
              };
            }
          
            if (b.type === "post") {
              return {
                id: `${idx}-${Date.now()}`,
                type: "post",
                text: b.text || "",
                content: b.content || "",
                style: baseStyle,
                description: b.description || "",
              };
            }
          
            return {
              id: `${idx}-${Date.now()}`,
              type: "text",
              text: b.text || "",
              style: baseStyle,
            };
          });
          

          setBlocks(withIds);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to load page");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function addTextBlock() {
    setBlocks((prev) => [
      ...prev,
      { id: `${Date.now()}-text`, type: "text", text: "", style: "body" },
    ]);
  }

  function addLinkBlock() {
    setBlocks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-link`,
        type: "link",
        text: "",
        url: "",
        style: "body",
        description: "",   // ✅ new
      },
    ]);
  }
  
  function addPostBlock() {
    setBlocks((prev) => [
      ...prev,
      {
        id: `${Date.now()}-post`,
        type: "post",
        text: "Untitled iStack",
        content: "",
        style: "body",
        description: "",
      },
    ]);
  }
  

  function updateBlock(id: string, updates: Partial<Block>) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...updates } as Block) : b))
    );
  }

  function deleteBlock(id: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function handleSave(publish?: boolean) {
    setSaving(true);
    setSavedMessage(null);
    setError(null);

    try {
      const body = {
        title,
        published: publish ? true : published,
        blocks: blocks.map((b) => {
          if (b.type === "link") {
            return {
              type: "link",
              text: b.text,
              url: b.url,
              style: b.style || "body",
              description: b.description || "",
            };
          }
      
          if (b.type === "post") {
            return {
              type: "post",
              text: b.text,
              content: b.content || "",
              style: b.style || "body",
              description: b.description || "",
            };
          }
      
          // text
          return {
            type: "text",
            text: b.text,
            style: b.style || "body",
          };
        }),
      };
      
      const res = await fetch("/api/page", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to save");
      } else {
        setPublished(!!data.published);
        setSavedMessage(publish ? "Page published" : "Draft saved");
        setTimeout(() => setSavedMessage(null), 2500);
      }
    } catch (err) {
      console.error(err);
      setError("Unexpected error while saving");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="rounded-2xl bg-white shadow px-6 py-4 text-slate-700">
          Loading editor...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow border border-slate-200 flex flex-col">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-2 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addTextBlock}
              className="px-3 py-1 text-sm rounded bg-slate-800 text-white hover:bg-slate-900"
            >
              + Text
            </button>
            <button
              type="button"
              onClick={addLinkBlock}
              className="px-3 py-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              + Link
            </button>
            <button
              type="button"
              onClick={addPostBlock}
              className="..."
            >
              + iStacks Post   {/* ✅ new */}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
          {username && (
  <a
    href={`/u/${encodeURIComponent(
      username
    )}?handle=${encodeURIComponent(username)}`}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-blue-600 hover:underline"
  >
    View public page ↗
  </a>
)}

            <span className="text-xs text-slate-500">
              Status:{" "}
              <span
                className={
                  published ? "text-emerald-700 font-semibold" : "text-slate-700"
                }
              >
                {published ? "Published" : "Draft"}
              </span>
            </span>

            {savedMessage && (
              <span className="text-xs text-emerald-700">{savedMessage}</span>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-3 py-1.5 text-sm rounded border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="px-4 py-2 text-sm text-red-700 bg-red-50 border-b border-red-100">
            {error}
          </div>
        )}

        {/* Editor body */}
        <div className="px-6 py-4 space-y-4">
          {/* Title */}
          <input
            className="w-full text-2xl font-semibold border-b border-slate-200 pb-1 outline-none focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page title"
          />

          {/* Blocks */}
          <div className="space-y-4">
            {blocks.map((block) => {
              if (block.type === "text") {
                const style = block.style || "body";
                const textClasses =
                  style === "heading"
                    ? "text-lg font-semibold"
                    : style === "subheading"
                    ? "text-base font-medium"
                    : "text-sm";

                return (
                  <div
                    key={block.id}
                    className="border border-slate-200 rounded-lg p-3 bg-slate-50/50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-wide text-slate-500">
                          Text block
                        </span>
                        <select
                          className="text-xs border rounded px-1 py-0.5"
                          value={style}
                          onChange={(e) =>
                            updateBlock(block.id, {
                              style: e.target.value as Block["style"],
                            })
                          }
                        >
                          <option value="body">Body</option>
                          <option value="heading">Heading</option>
                          <option value="subheading">Subheading</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                    <textarea
                      className={`w-full min-h-[80px] border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 ${textClasses}`}
                      value={block.text}
                      onChange={(e) =>
                        updateBlock(block.id, { text: e.target.value })
                      }
                      placeholder="Write your content..."
                    />
                  </div>
                );
              }

              //post
              if (block.type === "post") {
                return (
                  <div
                    key={block.id}
                    className="border border-indigo-200 rounded-lg p-3 bg-indigo-50/40"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs uppercase tracking-wide text-indigo-700">
                        iStacks post
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteBlock(block.id)}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
              
                    <div className="space-y-2">
                      {/* Title */}
                      <input
                        className="w-full text-sm border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={block.text}
                        onChange={(e) =>
                          updateBlock(block.id, { text: e.target.value })
                        }
                        placeholder="Post title (e.g., Why I built iHost)"
                      />
              
                      {/* Short description / subtitle */}
                      <input
                        className="w-full text-xs border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={block.description || ""}
                        onChange={(e) =>
                          updateBlock(block.id, { description: e.target.value })
                        }
                        placeholder="Optional short summary shown under the title"
                      />
              
                      {/* Article body */}
                      <textarea
                        className="w-full text-sm border rounded-md px-2 py-2 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[140px]"
                        value={block.content}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="Write your iStacks article here. You can use blank lines and simple paragraphs."
                      />
                      <p className="text-[11px] text-gray-500">
                        Tip: Keep it simple for now — we can add rich formatting later.
                      </p>
                    </div>
                  </div>
                );
              }
              

              // link block
              return (
                <div
                  key={block.id}
                  className="border border-emerald-200 rounded-lg p-3 bg-emerald-50/40"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs uppercase tracking-wide text-emerald-700">
                      Link block
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="space-y-2">
        <input
          className="w-full text-sm border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
          value={block.text}
          onChange={(e) =>
            updateBlock(block.id, { text: e.target.value })
          }
          placeholder="Link label (e.g., Golf Connect)"
        />
        <input
          className="w-full text-sm border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
          value={block.url}
          onChange={(e) =>
            updateBlock(block.id, { url: e.target.value })
          }
          placeholder="https://..."
        />
        <textarea
          className="w-full text-xs border rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
          value={block.description || ""}
          onChange={(e) =>
            updateBlock(block.id, { description: e.target.value })
          }
          placeholder="Short description (e.g., Landing page listing all my apps and social links)"
          rows={2}
        />
      </div>

                </div>
              );
            })}

            {blocks.length === 0 && (
              <p className="text-sm text-slate-400">
                Use the toolbar above to add text or link blocks to your page.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
