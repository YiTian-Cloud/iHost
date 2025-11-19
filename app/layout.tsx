import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "iHost",
    template: "%s · iHost",
  },
  description:
    "iHost — your personal hub for apps, links, iStacks, and your digital identity.",
  applicationName: "iHost",
  appleWebApp: {
    capable: true,
    title: "iHost",           // 👈 this is what iOS will use under the icon
    statusBarStyle: "default",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",           // normal favicon / PWA icon
    apple: "/apple-touch-icon.png",  // iOS home-screen icon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
