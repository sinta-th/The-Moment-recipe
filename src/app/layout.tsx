import type { Metadata, Viewport } from "next";
import "./globals.css";
import ScreenProtect from "@/components/ScreenProtect";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "The Moment Recipe",
  description: "ระบบจัดการสูตรค็อกเทลและคำนวณ Batching",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "The Moment",
  },
};

export const viewport: Viewport = {
  themeColor: "#c0392b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="antialiased">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
      </head>
      <body className="min-h-screen select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', WebkitUserSelect: 'none' }}>
        <ScreenProtect />
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
