import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AI-Driven Learning Path Generation | Thesis",
  description:
    "Comparing LLM approaches for generating personalized learning paths — A bachelor thesis by Emil Jansson & Oliver Brantin",
  openGraph: {
    title: "AI-Driven Learning Path Generation",
    description:
      "Comparing LLM approaches for generating personalized learning paths",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
