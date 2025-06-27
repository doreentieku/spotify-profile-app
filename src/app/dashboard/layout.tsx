//app/layout.tsx
"use client";

import { useSpotifyAuth } from "@/lib/useSpotifyAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GenreFilterProvider } from "@/context/GenreFilterContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token: accessToken, loading } = useSpotifyAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/login");
    }
  }, [loading, accessToken, router]);

  if (loading || !accessToken)
    return <div className="text-white p-6">Loading...</div>;

  return (
    <div className="bg-gray-800">
      <GenreFilterProvider>
        {" "}
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </GenreFilterProvider>
    </div>
  );
}
