import type { Metadata } from "next";
import "./globals.css";
import ScreenProtect from "@/components/ScreenProtect";

export const metadata: Metadata = {
  title: "Cocktail Batch App",
  description: "ระบบจัดการสูตรค็อกเทลและคำนวณ Batching",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="antialiased">
      <body className="min-h-screen select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', WebkitUserSelect: 'none' }}>
        <ScreenProtect />
        {children}
      </body>
    </html>
  );
}
