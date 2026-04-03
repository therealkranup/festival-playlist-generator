# Festival Playlist Generator

Turn any music festival lineup into a Spotify & YouTube playlist in seconds.

## Quick Start

```bash
# Install dependencies
npm install

# Copy env template and fill in your API keys
cp .env.local.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Keys Required

You need three sets of credentials in `.env.local`:

### Spotify
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Set redirect URI: `http://localhost:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret

### YouTube / Google
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project, enable "YouTube Data API v3"
3. Create OAuth 2.0 credentials (Web application)
4. Set redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### Claude API (for lineup auto-detection)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### NextAuth Secret
Generate one: `openssl rand -base64 32`

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/therealkranup/festival-playlist-generator)

Set your environment variables in the Vercel dashboard, and update the OAuth redirect URIs to your production URL.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (dark theme)
- **NextAuth.js** (Spotify + Google OAuth)
- **Spotify Web API** (artist search, top tracks, playlist creation)
- **YouTube Data API v3** (video search, playlist creation)
- **Claude API** (festival lineup parsing)
