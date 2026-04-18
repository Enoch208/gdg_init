import type { Metadata } from "next";
import "./globals.css";

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%A7%BE%3C/text%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "Invoix — AI Invoice Generator",
  description:
    "Describe your work in plain English. Invoix drafts a clean invoice you can edit and download as a PDF. Powered by Gemini.",
  icons: { icon: FAVICON },
  openGraph: {
    title: "Invoix — AI Invoice Generator",
    description:
      "Describe your work in plain English. Invoix drafts a clean invoice you can edit and download as a PDF.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Invoix — AI Invoice Generator",
    description: "Plain English in. Invoice out.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
