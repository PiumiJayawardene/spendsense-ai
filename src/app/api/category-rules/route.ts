import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const { keyword, categoryId } = body;

  if (!keyword || !categoryId) {
    return NextResponse.json(
      { error: "Missing keyword or categoryId" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("category_rules")
    .insert({
      user_id: user.id,
      keyword,
      category_id: categoryId,
    });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}