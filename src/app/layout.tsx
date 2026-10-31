import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cocktail Batch App",
  description: "ระบบจัดการสูตรค็อกเทลและคำนวณ Batching",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="antialiased">
      <body className="min-h-screen" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
