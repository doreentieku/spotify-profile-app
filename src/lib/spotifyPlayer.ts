/// <reference types="spotify-web-playback-sdk" />

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

let spotifyPlayerInstance: Spotify.Player | null = null;

export function getSpotifyPlayer(): Spotify.Player | null {
  return spotifyPlayerInstance;
}

export function initializeSpotifyPlayer(
  token: string,
  onReadyCallback: (deviceId: string) => void
) {
  if (typeof window === 'undefined') return;

  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: 'Doreen Web Player',
      getOAuthToken: (cb: (token: string) => void) => cb(token),
      volume: 0.5,
    });

    spotifyPlayerInstance = player;

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      onReadyCallback(device_id);
    });

    player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    player.connect();
  };

  if (!document.getElementById('spotify-sdk')) {
    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);
  }
}
