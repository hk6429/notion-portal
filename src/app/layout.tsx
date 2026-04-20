import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SIDEBAR_CONFIG } from "@/lib/sidebar-config";

export const metadata: Metadata = {
  title: "新竹市數位語文教學資料庫",
  description: "新竹市國中數位語文教學教案、研習、AI 工具資料庫",
};

export const revalidate = 300;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant" className="h-full antialiased">
      <body className="min-h-full bg-gray-50 text-gray-900">
        <div className="flex">
          <Sidebar config={SIDEBAR_CONFIG} />
          <main className="flex-1 min-h-screen bg-white">
            <div className="max-w-3xl mx-auto px-10 py-12">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
