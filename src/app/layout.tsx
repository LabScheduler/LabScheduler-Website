"use client";

import Header from "../components/layouts/Header";
import { Inter } from "next/font/google";
import "./globals.css";
import Menu from "@/components/layouts/Menu";
import { usePathname, useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });





export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const isNotFoundPage = pathname === "/not-found";

  // Don't show header and menu on login or not found pages
  if (isLoginPage || isNotFoundPage) {
    return (
      <html lang="en" className="h-full">
        <body className={`${inter.className} flex flex-col h-full`}>
          <main className="flex-1">{children}</main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col h-full bg-gray-50`}>
        <Header />
        <div className="flex flex-1 h-[calc(100vh-64px)]">
          <Menu />
          <main className="overflow-auto flex-1 p-6 md:p-8 lg:p-10">{children}</main>
        </div>
      </body>
    </html>
  );
}