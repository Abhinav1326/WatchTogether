import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CoupleSpace",
  description: "Watch, chat, and connect together in real-time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-r from-[#00dbde] to-[#fc00ff]">
        {/* Navbar appears everywhere */}
        <Navbar />

        {/* Push page content down so it doesn't hide behind fixed navbar */}
        <main className="">{children}</main>
      </body>
    </html>
  );
}
