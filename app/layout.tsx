import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DocumentProvider } from "./context/DocumentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Legal Document Triage and Review System",
  description: "A unified document analysis system for legal professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DocumentProvider>
          {children}
        </DocumentProvider>
      </body>
    </html>
  );
}
