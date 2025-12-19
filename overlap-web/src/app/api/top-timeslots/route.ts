import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const searchParams = req.nextUrl.searchParams;
  const moimId = searchParams.get("moimId");
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!moimId || !year || !month) {
    return NextResponse.json(
      { error: "moimId, year, and month are required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase.rpc("get_top_timeslots", {
      p_moim_id: moimId,
      p_year: parseInt(year),
      p_month: parseInt(month),
    });

    if (error) {
      console.error("RPC error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // pick이 -1인 슬롯 제외
    const filteredSlots = (data || []).filter((slot: any) => {
      const pickValue = slot.pick ? Number(slot.pick) : undefined;
      return pickValue !== -1;
    });

    return NextResponse.json({ slots: filteredSlots });
  } catch (error) {
    console.error("Error fetching top timeslots:", error);
    return NextResponse.json(
      { error: "Failed to fetch top timeslots" },
      { status: 500 }
    );
  }
}






