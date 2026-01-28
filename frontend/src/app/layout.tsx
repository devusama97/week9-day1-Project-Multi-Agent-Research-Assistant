import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from '../ThemeRegistry';

export const metadata: Metadata = {
  title: "Multi-Agent Research Assistant",
  description: "A collaborative research team powered by LangGraph and MUI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
