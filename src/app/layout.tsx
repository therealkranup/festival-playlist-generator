import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Festival Playlist Generator",
  description:
    "Turn any music festival lineup into a Spotify & YouTube playlist in seconds.",
  openGraph: {
    title: "Festival Playlist Generator",
    description:
      "Turn any music festival lineup into a Spotify & YouTube playlist in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
