"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser } from "@/lib/auth";

export default function ProfileIndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      try {
        const activeUser = await getActiveUser();
        if (activeUser?.username) {
          router.replace(`/profile/${activeUser.username}`);
          return;
        }
      } catch {
        // fallback
      }
      router.replace("/profile/you_builder");
    }

    checkUser();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-zinc-500 font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        <span>RESOLVING BUILDER PROFILE...</span>
      </div>
    </div>
  );
}
