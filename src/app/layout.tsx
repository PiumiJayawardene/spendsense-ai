import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "SpendSense AI",
  description:
  "SpendSense AI is an AI-powered personal finance assistant that helps users analyse bank statements, categorise transactions, manage budgets, forecast spending, and gain personalised financial insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  className="h-full antialiased"
  suppressHydrationWarning
>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>

      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans transition-theme">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}