"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function ProfileIndexPage() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data } = await supabase
              .from("profiles")
              .select("username")
              .eq("id", user.id)
              .maybeSingle();

            const profile = data as any;
            if (profile?.username) {
              router.replace(`/profile/${profile.username}`);
              return;
            }
          }
        } catch {
          // ignore
        }
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
