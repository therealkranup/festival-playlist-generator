import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "FestifyGen — Festival Playlist Generator",
  description:
    "Turn any music festival lineup into a Spotify & YouTube playlist in seconds. Search 36+ European festivals with instant results.",
  openGraph: {
    title: "FestifyGen — Festival Playlist Generator",
    description:
      "Turn any music festival lineup into a Spotify & YouTube playlist in seconds. Search 36+ European festivals with instant results.",
    type: "website",
    url: "https://festifygen.netlify.app",
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
