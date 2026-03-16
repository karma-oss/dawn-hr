import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const notoSansJP = localFont({
  src: "../../public/fonts/NotoSansJP-Regular.ttf",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "DAWN HR - 人事管理",
  description: "DAWN SERIES 人事管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
