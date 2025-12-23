import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

// POST /api/slot/pick - 해당 슬롯의 pick + 1
export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { moim, date, begin, end } = body;

    if (!moim || !date) {
      return NextResponse.json(
        { error: "moim and date are required" },
        { status: 400 }
      );
    }

    // 해당 슬롯 조회 (moim, date, begin, end로 필터링)
    let query = supabase
      .from("slot")
      .select("*")
      .eq("moim", moim)
      .eq("date", date);

    if (begin !== undefined && begin !== null) {
      query = query.eq("begin", begin);
    } else {
      query = query.is("begin", null);
    }

    if (end !== undefined && end !== null) {
      query = query.eq("end", end);
    } else {
      query = query.is("end", null);
    }

    const { data: existingSlots, error: fetchError } = await query;

    if (fetchError) {
      return NextResponse.json(
        { error: `Failed to find slot: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!existingSlots || existingSlots.length === 0) {
      return NextResponse.json(
        { error: "Slot not found" },
        { status: 404 }
      );
    }

    // 첫 번째 슬롯의 pick 값 증가
    const slot = existingSlots[0];
    const currentPick = slot.pick || 0;
    const newPick = currentPick + 1;

    // pick 값 업데이트
    const { data: updatedSlot, error: updateError } = await supabase
      .from("slot")
      .update({ pick: newPick })
      .eq("id", slot.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update pick: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedSlot);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}







