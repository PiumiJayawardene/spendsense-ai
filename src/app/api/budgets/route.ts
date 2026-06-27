import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const body = await request.json();
  const { categoryId, limitAmount, periodMonth } = body;

  if (!categoryId || typeof limitAmount !== "number" || !periodMonth) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const { error } = await supabase.from("budgets").upsert(
    {
      user_id: authData.user.id,
      category_id: categoryId,
      limit_amount: limitAmount,
      period_month: periodMonth,
    },
    { onConflict: "user_id,category_id,period_month" }
  );

  if (error) {
    console.error("Failed to save budget:", error);
    return NextResponse.json({ error: "Failed to save budget." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}