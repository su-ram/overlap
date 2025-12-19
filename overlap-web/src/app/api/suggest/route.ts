import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';

// GET /api/suggest?moimId=xxx - 전체 availability를 분석해 TOP 시간 계산
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const searchParams = request.nextUrl.searchParams;
    const moimId = searchParams.get('moimId');

    if (!moimId) {
      return NextResponse.json(
        { error: 'moimId parameter is required' },
        { status: 400 }
      );
    }

    // availability 테이블에서 해당 모임의 모든 가능 시간 조회
    const { data: availabilityData, error } = await supabase
      .from('availability')
      .select('*')
      .eq('moim_id', moimId)
      .eq('available', true);

    if (error) {
      return NextResponse.json(
        { error: `Failed to get availability: ${error.message}` },
        { status: 500 }
      );
    }

    // 날짜별로 투표 수 집계
    const dateVotes: Record<string, number> = {};
    
    availabilityData?.forEach((item) => {
      const date = item.date;
      if (date) {
        dateVotes[date] = (dateVotes[date] || 0) + 1;
      }
    });

    // 투표 수가 많은 순으로 정렬
    const sortedDates = Object.entries(dateVotes)
      .map(([date, votes]) => ({ date, votes }))
      .sort((a, b) => b.votes - a.votes);

    return NextResponse.json({
      moimId,
      suggestions: sortedDates,
      totalMembers: new Set(availabilityData?.map((item) => item.member_id)).size,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}



