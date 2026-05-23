import LandingClient from "@/modules/landing/landing-client";
import { createClient } from "@/modules/core/infrastructure/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return <LandingClient isLoggedIn={isLoggedIn} />;
}
