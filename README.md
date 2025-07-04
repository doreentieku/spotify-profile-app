# Spoticizr – Unleash the Full Potential of Your Spotify Data

Explore your Spotify profile, top tracks, top artists, genres, and more with powerful visualizations and personalized insights.

**Try it out:** [spoticizr.vercel.app/login](https://spoticizr.vercel.app/login)

---

## Features

- OAuth authentication with Spotify  
- View top artists, tracks, and genres  
- Filter saved tracks by genre and create playlist
- Beautiful data visualizations  
- Search for tracks  
- Play tracks in app and add to playlist
- Fully responsive and modern UI (Next.js + Tailwind CSS + GSAP)
---

## Preview

![App Preview](./example.png)

---



## Prerequisites

Before getting started, make sure you have the following:

1. **Spotify Developer Credentials**  
   - Create a new app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)  
   - Add the following Redirect URI in your app settings:  
     `http://127.0.0.1:3000/login`  
   - Copy your **Client ID** and **Client Secret**

2. **Clone the repository**

```bash
git clone https://github.com/doreentieku/spotify-profile-app.git
cd spotify-profile-app
```

3. **Install dependencies**
```bash
npm install
```

4. **Create a .env.local file in the root directory and add**
```bash
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/login
```

## Run the Development Server
**Start the local server with:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Then open your browser and visit: http://127.0.0.1:3000

### Built With
 - [Next.js](https://nextjs.org/)
 - [GSAP](https://gsap.com/)
 - [Tailwind CSS](https://tailwindcss.com/)
 - [Spotify Web API](https://developer.spotify.com/documentation/web-api)

This project is licensed under the [MIT License](LICENSE).