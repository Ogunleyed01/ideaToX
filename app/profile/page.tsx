"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export default function ProfileIndexPage() {
  const router = useRouter();
  const { user, profile, isConfigured, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isConfigured) {
      router.replace("/profile/you_builder");
      return;
    }

    if (!user) {
      router.replace("/auth?next=/profile&reason=auth_required");
      return;
    }

    if (profile?.username) {
      router.replace(`/profile/${encodeURIComponent(profile.username)}`);
    } else {
      router.replace("/settings");
    }
  }, [loading, isConfigured, user, profile?.username, router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-500 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>RESOLVING BUILDER PROFILE...</span>
      </div>
    </div>
  );
}
