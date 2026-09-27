import type { Metadata } from "next";
import {
  Fraunces,
  Manrope,
  Noto_Kufi_Arabic,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const urdu = Noto_Nastaliq_Urdu({
  variable: "--font-urdu",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const abd = Noto_Kufi_Arabic({
  variable: "--font-abd",
  subsets: ["arabic"],
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Session Admin",
  description: "Session admin panel login",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${urdu.variable} ${abd.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
