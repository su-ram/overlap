import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import type { CreateSlotRequest, UpdateSlotRequest, Slot, ErrorResponse } from "@/types/api";

/**
 * 시간 슬롯 생성
 * @route POST /api/slot
 * @param {CreateSlotRequest} req.body - 슬롯 생성 요청 데이터
 * @returns {Promise<NextResponse<Slot | ErrorResponse>>} 생성된 슬롯 정보 또는 에러
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { moimId, buddyId, date, begin, end, pick } = body;

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
        pick: pick !== undefined ? pick : 1, // pick 값이 제공되면 사용, 없으면 기본값 1
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

/**
 * 시간 슬롯 삭제
 * @route DELETE /api/slot
 * @param {string} req.query.moimId - 모임 ID
 * @param {string} req.query.buddyId - 참여자 ID
 * @param {string} req.query.date - 날짜 (YYYY-MM-DD)
 * @returns {Promise<NextResponse<{ success: boolean } | ErrorResponse>>} 삭제 결과 또는 에러
 */
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

/**
 * 시간 슬롯 조회
 * @route GET /api/slot
 * @param {string} req.query.moimId - 모임 ID
 * @param {string} req.query.buddyId - 참여자 ID
 * @param {string} req.query.date - 날짜 (YYYY-MM-DD)
 * @returns {Promise<NextResponse<{ slots: Slot[] } | ErrorResponse>>} 슬롯 목록 또는 에러
 */
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

/**
 * 시간 슬롯 업데이트
 * @route PATCH /api/slot
 * @param {UpdateSlotRequest} req.body - 슬롯 업데이트 요청 데이터
 * @returns {Promise<NextResponse<{ slots: Slot[] } | ErrorResponse>>} 업데이트된 슬롯 목록 또는 에러
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { moimId, date, fix, buddyId, pick } = body;

    if (!moimId || !date) {
      return NextResponse.json(
        { error: "moimId and date are required" },
        { status: 400 }
      );
    }

    // 해당 날짜의 slot을 업데이트
    const updateData: any = {};
    if (fix !== undefined) {
      updateData.fix = fix;
    }
    if (pick !== undefined) {
      updateData.pick = pick;
    }

    let query = supabase
      .from("slot")
      .update(updateData)
      .eq("moim", moimId)
      .eq("date", date);

    // buddyId가 제공되면 특정 참여자의 slot만 업데이트
    if (buddyId) {
      query = query.eq("buddy", buddyId);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update slot: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots: data || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}







