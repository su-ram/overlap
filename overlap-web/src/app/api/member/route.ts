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

    // 중복 검사: 같은 모임에서 같은 이름의 buddy가 이미 존재하는지 확인
    const { data: existingBuddy, error: checkError } = await supabase
      .from('buddy')
      .select('id, name')
      .eq('moim', moimId)
      .eq('name', memberName.trim())
      .maybeSingle();

    if (checkError) {
      return NextResponse.json(
        { error: `Failed to check duplicate: ${checkError.message}` },
        { status: 500 }
      );
    }

    if (existingBuddy) {
      return NextResponse.json(
        { error: '이미 같은 이름의 참여자가 존재합니다.' },
        { status: 409 } // Conflict
      );
    }

    // buddy 테이블에 추가 (moim 컬럼 사용)
    const { data, error } = await supabase
      .from('buddy')
      .insert({
        moim: moimId,
        name: memberName.trim(),
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



