"use client";

import { useState } from "react";
import AdminLogin from "@/components/AdminLogin";
import AdminVideoManager from "@/components/AdminVideoManager";
import type { VideoCardData } from "@/lib/types";

export default function AdminPanel({
  authenticated,
  initialVideos,
}: {
  authenticated: boolean;
  initialVideos: VideoCardData[];
}) {
  const [loggedIn, setLoggedIn] = useState(authenticated);

  if (!loggedIn) {
    return (
      <AdminLogin
        onSuccess={() => {
          // Reload so server re-fetches videos with the new session cookie
          window.location.reload();
        }}
      />
    );
  }

  return <AdminVideoManager initialVideos={initialVideos} />;
}
