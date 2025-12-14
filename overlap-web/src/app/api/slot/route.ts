import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

// POST /api/slot - slot 생성
export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { moimId, buddyId, date, begin, end } = body;

    if (!moimId || !buddyId || !date) {
      return NextResponse.json(
        { error: "moimId, buddyId, and date are required" },
        { status: 400 }
      );
    }

    // slot 테이블에 추가 (모임 + 사용자를 키로 사용)
    // begin과 end는 선택사항 (없으면 null)
    const { data, error } = await supabase
      .from("slot")
      .insert({
        moim: moimId,
        buddy: buddyId, // 사용자 정보 저장
        date: date, // YYYY-MM-DD 형식
        begin: begin || null,
        end: end || null,
        pick: 1, // 기본값 1 (투표 수)
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create slot: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

// DELETE /api/slot - slot 삭제
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const moimId = searchParams.get("moimId");
    const buddyId = searchParams.get("buddyId");
    const date = searchParams.get("date");

    if (!moimId || !buddyId || !date) {
      return NextResponse.json(
        { error: "moimId, buddyId, and date are required" },
        { status: 400 }
      );
    }

    // 모임 + 사용자 + 날짜로 특정 slot 삭제
    const { error } = await supabase
      .from("slot")
      .delete()
      .eq("moim", moimId)
      .eq("buddy", buddyId)
      .eq("date", date);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete slot: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// GET /api/slot - slot 조회 (특정 날짜, 특정 사용자)
export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = req.nextUrl.searchParams;
    const moimId = searchParams.get("moimId");
    const buddyId = searchParams.get("buddyId");
    const date = searchParams.get("date");

    if (!moimId || !buddyId || !date) {
      return NextResponse.json(
        { error: "moimId, buddyId, and date are required" },
        { status: 400 }
      );
    }

    // 모임 + 사용자 + 날짜로 특정 slot 조회
    const { data, error } = await supabase
      .from("slot")
      .select("*")
      .eq("moim", moimId)
      .eq("buddy", buddyId)
      .eq("date", date);

    if (error) {
      return NextResponse.json(
        { error: `Failed to get slot: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
