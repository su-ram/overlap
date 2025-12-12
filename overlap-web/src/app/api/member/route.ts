import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

// POST /api/member - 멤버 추가
export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const body = await req.json();
    const { moimId, memberName } = body;

    if (!moimId || !memberName) {
      return NextResponse.json(
        { error: 'moimId and memberName are required' },
        { status: 400 }
      );
    }

    // member 테이블이 있다고 가정하고 추가
    // 실제 테이블 구조에 맞게 수정 필요
    const { data, error } = await supabase
      .from('member')
      .insert({
        moim_id: moimId,
        member_name: memberName,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to create member: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
