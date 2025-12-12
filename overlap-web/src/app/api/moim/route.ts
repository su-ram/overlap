import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { moim_name } = body;

  const { data, error } = await supabase
    .from("moim")
    .insert([{ moim_name }])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json(data);
}