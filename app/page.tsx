import LandingClient from "@/modules/landing/landing-client";
import { createClient } from "@/modules/core/infrastructure/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isLoggedIn = !!user;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    user?.email ||
    null;

  const initials = displayName
    ? displayName
        .split(" ")
        .map((w: string) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : null;

  return <LandingClient isLoggedIn={isLoggedIn} displayName={displayName} initials={initials} />;
}
