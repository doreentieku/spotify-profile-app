import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { accessToken, mood, userId } = await req.json();

    console.log("Access Token:", accessToken);
    console.log("Mood:", mood);
    console.log("User ID:", userId);

    if (!accessToken) {
      return NextResponse.json({ error: "Access token missing" }, { status: 401 });
    }

    // Step 1: Map mood to genre + fallback artist
    const moodMap: Record<string, { genre: string; artistId: string }> = {
      sad: { genre: "acoustic", artistId: "6eUKZXaKkcviH0Ku9w2n3V" }, // Ed Sheeran
      chill: { genre: "chill", artistId: "3TVXtAsR1Inumwj472S9r4" }, // Drake
      workout: { genre: "dance", artistId: "1uNFoZAHBGtllmzznpCI3s" }, // Justin Bieber
      happy: { genre: "pop", artistId: "06HL4z0CvFAxyc27GXpf02" }, // Taylor Swift
      focus: { genre: "ambient", artistId: "4EVpmkEwrLYEg6jIsiPMIb" }, // Joji
    };

    const { genre, artistId } = moodMap[mood.toLowerCase()] || {
      genre: "pop",
      artistId: "06HL4z0CvFAxyc27GXpf02", // fallback
    };

    console.log("Using genre:", genre, "artistId:", artistId);

    // Step 2: Make Spotify request with genre + artist
    const spotifyRes = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=10&seed_genres=${genre}&seed_artists=${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const rawText = await spotifyRes.text(); // Avoid double-reading
    console.log("Spotify raw response:", rawText);

    if (!spotifyRes.ok) {
      return NextResponse.json({ error: `Spotify API error: ${rawText}` }, { status: 500 });
    }

    const data = JSON.parse(rawText);

    // Step 3: Simplify track info
    const simplifiedTracks = data.tracks.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map((a: any) => a.name).join(", "),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url,
    }));

    return NextResponse.json({ tracks: simplifiedTracks });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
