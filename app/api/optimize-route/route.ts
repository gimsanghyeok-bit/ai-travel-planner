import { NextRequest, NextResponse } from 'next/server';
import { optimizeDayRoute, TravelMode } from '@/lib/routeOptimizer';

// POST { points: {id, lat, lng}[], travelMode }
// Supabase 연동 전까지는 클라이언트가 좌표 배열을 직접 넘기는 형태로 동작한다.
// DB에 저장된 itinerary_items를 조회해 points를 구성하도록 확장하려면
// db/supabase_schema.sql의 places(lat,lng)를 참고해 여기서 supabase-js로 조회를 추가하면 된다.
export async function POST(req: NextRequest) {
  try {
    const { points, travelMode } = (await req.json()) as { points: { id: string; lat: number; lng: number }[]; travelMode?: TravelMode };

    if (!points || points.length === 0) {
      return NextResponse.json({ error: 'points는 필수입니다.' }, { status: 400 });
    }
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY가 설정되어 있지 않습니다.' }, { status: 500 });
    }

    const result = await optimizeDayRoute(points, travelMode ?? 'driving', apiKey);
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error('optimize-route error:', err);
    return NextResponse.json({ error: '동선 최적화 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
