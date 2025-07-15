// src/components/PlayButton.tsx
"use client";

import { usePlayTrack } from "@/hooks/usePlayTrack";
import { CiPlay1 } from "react-icons/ci";

interface PlayButtonProps {
    uri: string;
    accessToken: string;
    deviceId: string | null;
}

export default function PlayButton({
    uri,
    accessToken,
    deviceId,
}: PlayButtonProps) {
    const playTrack = usePlayTrack(accessToken, deviceId);

    return (
        <button
            onClick={() => playTrack(uri)}
            className="mt-3 px-4 py-2 text-sm font-medium text-white rounded-full backdrop-blur-md bg-white/10 hover:bg-green-300/80 transition duration-200 shadow-lg cursor-pointer"
        >
            <CiPlay1 size={20} />
        </button>
    );
}
