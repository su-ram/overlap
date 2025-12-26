import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";
import type { MoimResponse, ErrorResponse } from "@/types/api";

/**
 * 모임명으로 모임 검색
 * @route GET /api/moim/search
 * @param {string} req.query.name - 검색할 모임명 (부분 일치)
 * @returns {Promise<NextResponse<MoimResponse[] | ErrorResponse>>} 검색된 모임 목록 또는 에러
 */
export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get("name");

  try {
    let query = supabase.from("moim").select("*");

    // name 파라미터가 있으면 검색, 없으면 전체 목록
    if (name && name.trim() !== "") {
      query = query.ilike("moim_name", `%${name.trim()}%`);
    }

    const { data: moimList, error: moimError } = await query.order("created_at", { ascending: false });

    if (moimError) {
      return NextResponse.json(
        { error: moimError.message },
        { status: 400 }
      );
    }

    // 각 모임에 대해 buddy와 slot 정보도 함께 조회
    const moimListWithDetails = await Promise.all(
      (moimList || []).map(async (moim) => {
        const [buddyResult, slotResult] = await Promise.all([
          supabase.from("buddy").select("*").eq("moim", moim.id),
          supabase.from("slot").select("*").eq("moim", moim.id),
        ]);

        return {
          ...moim,
          buddies: buddyResult.data || [],
          slots: slotResult.data || [],
        };
      })
    );

    return NextResponse.json(moimListWithDetails);
  } catch (error) {
    console.error("Error searching moim:", error);
    return NextResponse.json(
      { error: "Failed to search moim" },
      { status: 500 }
    );
  }
}
