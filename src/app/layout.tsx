import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#862572",
};

export const metadata: Metadata = {
  title: "2026 서울국제주류&와인박람회 마곡 | 부스배치도",
  description: "2026 서울국제주류&와인박람회 마곡 부스배치도 및 참가업체 검색 모바일 웹앱",
  applicationName: "마곡 주류박람회 부스배치도",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "마곡 주류박람회",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍷</text></svg>",
    apple: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍷</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={cn("h-full", "font-sans", geist.variable)}>
      <body className="h-full bg-stone-100 text-stone-900 antialiased selection:bg-fuchsia-200 selection:text-fuchsia-900">
        {children}
      </body>
    </html>
  );
}
