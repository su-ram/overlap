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
    // pick이 -1인 슬롯 조회
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const startDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-01`;
    // 해당 월의 마지막 날 계산
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("slot")
      .select("date")
      .eq("moim", moimId)
      .eq("pick", -1)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("Error fetching unavailable slots:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 날짜만 추출하여 Set으로 변환 (중복 제거)
    const unavailableDates = new Set(
      (data || []).map((slot: any) => {
        if (slot.date) {
          const date = new Date(slot.date);
          return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        }
        return null;
      }).filter((date: string | null) => date !== null)
    );

    return NextResponse.json({ dates: Array.from(unavailableDates) });
  } catch (error) {
    console.error("Error fetching unavailable slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch unavailable slots" },
      { status: 500 }
    );
  }
}


