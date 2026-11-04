import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function ProfileIndexPage() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
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
          redirect(`/profile/${profile.username}`);
        }
      }
    } catch {
      // fallback
    }
  }

  redirect("/profile/you_builder");
}
