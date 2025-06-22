// src/hooks/usePlayTrack.ts
export function usePlayTrack(accessToken: string, deviceId: string | null) {
    return async function playTrack(uri: string) {
        if (!accessToken || !deviceId) return;

        try {
            await fetch("https://api.spotify.com/v1/me/player", {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    device_ids: [deviceId],
                    play: false,
                }),
            });

            await fetch(
                `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ uris: [uri] }),
                }
            );
        } catch (err) {
            console.error("Failed to play track", err);
        }
    };
}
