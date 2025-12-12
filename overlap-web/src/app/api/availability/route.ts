import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const { moim_id, member_id, slots } = await req.json();

  const rows = slots.map((s: any) => ({
    moim_id,
    member_id,
    date: s.date,
    start_time: s.start,
    end_time: s.end,
  }));

  const { error } = await supabase.from("moim_availability").insert(rows);
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
