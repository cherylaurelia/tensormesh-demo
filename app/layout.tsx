import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LMCache's CPU CI is testing a frozen Sep 23 vLLM wheel",
  description:
    "vllm-cpu-nightly stopped publishing on Sep 23; on vLLM main the default LMCacheMPConnector config fails on CPU. A small fix, checked with LMCache's own e2e. Unofficial demo by Cheryl Aurelia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${dmSans.variable} ${mono.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
