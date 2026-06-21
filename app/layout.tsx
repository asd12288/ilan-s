import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Direction } from "radix-ui";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "לימודים",
  description: "לוח לימודים אישי",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        <Direction.Provider dir="rtl">
          {children}
          <Toaster position="bottom-left" />
        </Direction.Provider>
      </body>
    </html>
  );
}
