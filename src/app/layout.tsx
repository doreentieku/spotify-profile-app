import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next";
import { Varela_Round } from "next/font/google";
import "./globals.css";

const varelaRound = Varela_Round({
  weight: "400", 
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Spoticizr",
  description: "Orchestrate Your Spotify Experience..",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${varelaRound.className} antialiased`}
      >
        {children}
         <Analytics />
      </body>
    </html>
  );
}

