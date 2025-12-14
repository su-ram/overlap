import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const body = await req.json();
  const { moim_name } = body;

  // DB가 gen_random_uuid()로 자동 생성하므로 id는 전달하지 않음
  const { data, error } = await supabase
    .from("moim")
    .insert([{ moim_name }])
    .select()
    .single();

  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json(data);
}

export async function GET(req: NextRequest) {
  const supabase = createAdminClient();
  const searchParams = req.nextUrl.searchParams;
  const id = searchParams.get("id");

  // id 파라미터 검증
  if (!id || id === "undefined" || id === "null") {
    return NextResponse.json(
      { error: "id parameter is required and must be a valid UUID" },
      { status: 400 }
    );
  }

  // UUID 형식 검증 (간단한 체크)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: "id must be a valid UUID format" },
      { status: 400 }
    );
  }

  // moim 정보 조회
  const { data: moimData, error: moimError } = await supabase
    .from("moim")
    .select("*")
    .eq("id", id)
    .single();

  if (moimError) {
    return NextResponse.json(
      { error: moimError.message },
      { status: moimError.code === "PGRST116" ? 404 : 400 }
    );
  }

  // buddy 리스트 조회 (moim으로)
  const { data: buddyList, error: buddyError } = await supabase
    .from("buddy")
    .select("*")
    .eq("moim", id);

  if (buddyError) {
    console.error("Error fetching buddy list:", buddyError);
  }

  // slot 리스트 조회 (moim으로)
  const { data: slotList, error: slotError } = await supabase
    .from("slot")
    .select("*")
    .eq("moim", id);

  if (slotError) {
    console.error("Error fetching slot list:", slotError);
  }

  return NextResponse.json({
    ...moimData,
    buddies: buddyList || [],
    slots: slotList || [],
  });
}