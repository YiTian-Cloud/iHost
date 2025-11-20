"use client";

import { QrLinkWidget } from "qr-link-widget";

const DEMO_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://i-host.vercel.app/"

export default function QrTestPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 p-10">
      <div className="max-w-md w-full">
        <h1 className="text-xl font-semibold mb-4 text-slate-900">
          QR Widget Library Test
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          This page imports <code>QrLinkWidget</code> from{" "}
          <code>@yitian-cloud/qr-link-widget</code>.
        </p>
        <QrLinkWidget
          url={DEMO_URL}
          title="Scan to open iHost"
          description="Scan this QR code to open the iHost homepage on your phone."
        />
      </div>
    </main>
  );
}
