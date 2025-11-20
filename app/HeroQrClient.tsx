"use client";

import { QrLinkWidget } from "@yitian-cloud/qr-link-widget";

const HOME_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://i-host.vercel.app/";

export default function HeroQrClient() {
  return (
    <div className="flex justify-center md:justify-end">
      <QrLinkWidget
        url={HOME_URL}
        title="Open iHost on your phone"
        description="Scan this QR with your camera to open the iHost homepage on mobile."
      />
    </div>
  );
}
