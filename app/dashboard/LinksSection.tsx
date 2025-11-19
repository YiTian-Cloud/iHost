"use client";

import { useState, useEffect } from "react";

export default function LinksSection() {
  const [links, setLinks] = useState([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  async function loadLinks() {
    const res = await fetch("/api/links");
    const data = await res.json();
    setLinks(data.links || []);
  }

  async function addLink(e) {
    e.preventDefault();
    await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, url }),
    });
    setLabel("");
    setUrl("");
    loadLinks();
  }

  useEffect(() => {
    loadLinks();
  }, []);

  return (
    <div className="space-y-4">
      <form onSubmit={addLink} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Label (e.g., Instagram)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="URL (https://...)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="w-full bg-emerald-600 text-white rounded py-2">
          Add Link
        </button>
      </form>

      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link._id}
            className="border rounded px-3 py-2 flex justify-between"
          >
            <span>{link.label}</span>
            <span className="text-sm text-gray-500">{link.url}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
