import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cửu Long G-Sync | Quản trị nguyên liệu",
  description: "Phát hiện thiếu hụt, xác minh bằng chứng và theo dõi quyết định nguyên liệu.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
