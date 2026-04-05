import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — FestifyGen",
  description: "Privacy policy for FestifyGen festival playlist generator.",
};

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="text-orange-400 hover:text-orange-300 text-sm mb-8 inline-block"
        >
          &larr; Back to FestifyGen
        </Link>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-8">Last updated: April 5, 2026</p>

        <div className="space-y-6 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">What FestifyGen Does</h2>
            <p>
              FestifyGen is a free tool that generates Spotify and YouTube playlists from music
              festival lineups. You search for a festival, customize which artists and how many
              songs you want, then save the playlist directly to your Spotify or YouTube account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Data We Collect</h2>
            <p>
              When you sign in with Spotify or Google/YouTube, we receive a temporary access token
              and your email address through OAuth. We use the access token solely to create playlists
              on your behalf. We do not store your email address, access tokens, or any personal data
              in our database. Session data is stored temporarily in your browser and is cleared when
              you close the tab.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">What We Store</h2>
            <p>
              Our database stores only publicly available festival lineup information and
              Spotify track metadata (song names, artist names, album art URLs, and Spotify track IDs).
              We do not store any user data, listening history, or personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Third-Party Services</h2>
            <p>
              FestifyGen uses the following third-party services to function:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-white/60">
              <li>
                <strong className="text-white/70">Spotify API</strong> — to search for artists, fetch top tracks,
                and create playlists on your account. Subject to{" "}
                <a href="https://www.spotify.com/legal/privacy-policy/" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  Spotify&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-white/70">YouTube Data API</strong> — to search for music videos and
                create playlists on your account. Subject to{" "}
                <a href="https://policies.google.com/privacy" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  Google&apos;s Privacy Policy
                </a>.
              </li>
              <li>
                <strong className="text-white/70">Supabase</strong> — to cache festival lineups and track data
                for fast loading. No user data is stored here.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Cookies</h2>
            <p>
              We use a session cookie for authentication when you sign in with Spotify or Google.
              This cookie is essential for the app to function and is deleted when your session ends.
              We do not use tracking cookies, analytics, or advertising.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Your Rights</h2>
            <p>
              Since we don&apos;t store personal data, there is nothing to delete. You can revoke
              FestifyGen&apos;s access at any time through your{" "}
              <a href="https://www.spotify.com/account/apps/" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Spotify account settings
              </a>{" "}
              or{" "}
              <a href="https://myaccount.google.com/permissions" className="text-orange-400 hover:underline" target="_blank" rel="noopener noreferrer">
                Google account permissions
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
            <p>
              If you have any questions about this privacy policy, you can reach the developer at{" "}
              <a href="mailto:anup.2111@gmail.com" className="text-orange-400 hover:underline">
                anup.2111@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
