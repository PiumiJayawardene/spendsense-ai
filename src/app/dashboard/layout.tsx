import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, currency")
    .eq("id", data.user.id)
    .single();

  return (
    <div className="min-h-screen bg-[var(--bg-app)]">
      <DashboardNav
        displayName={profile?.display_name ?? data.user.email ?? "Account"}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
}