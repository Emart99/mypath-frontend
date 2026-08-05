import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./editor/Editor.css";

import { ThemeProvider } from "@/components/layout/theme-provider";
import { robotoFlex, roboto, robotoMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: { default: "Tramo", template: "%s | Tramo" },
  description:
    "Collect ideas, connect them into trails, and retrace your thinking — build knowledge maps and share them on Tramo.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${robotoFlex.variable} ${roboto.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}