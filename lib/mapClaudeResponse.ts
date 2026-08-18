import type { BookingOption, Category, DayPlan, ShoppingItem } from './types';
import { buildLegs } from './mockData';

const CATEGORY_MAP: Record<string, Category> = {
  sightseeing: '관광',
  food: '식사',
  shopping: '쇼핑',
  healing: '힐링',
  hotspot: '핫플',
  golf: '골프',
  transit: '이동',
};

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

export interface ClaudeItineraryResponse {
  days: {
    dayIndex: number;
    date: string;
    weatherSummary: string;
    weatherAlert: string | null;
    breakTimeAlert: string | null;
    places: {
      order: number;
      time: string;
      name: string;
      category: string;
      durationLabel: string;
      travelMode: string;
      travelTimeLabel: string;
      tip: { mustTryMenu: string; waitingTip: string; note: string };
    }[];
  }[];
  bookings: {
    flight: { name: string; description: string; price: number }[];
    hotel: { name: string; description: string; price: number }[];
    car: { name: string; description: string; price: number }[];
  };
  budgetEstimate: {
    flight: number; hotel: number; car: number;
    food: number; admission: number; localTransit: number;
  };
  shoppingRecommendations: { name: string; note: string }[];
  nextTripRecommendations: { name: string; reason: string }[];
}

/** Claude 응답의 bookings(항공/숙소/렌터카)를 화면에서 쓰는 BookingOption[] 형태로 변환 (description -> desc) */
export function mapClaudeBookings(res: ClaudeItineraryResponse): { flight: BookingOption[]; hotel: BookingOption[]; car: BookingOption[] } {
  const mapItems = (items: { name: string; description: string; price: number }[]): BookingOption[] =>
    (items ?? []).map((b) => ({ name: b.name, desc: b.description, price: b.price }));

  return {
    flight: mapItems(res.bookings?.flight),
    hotel: mapItems(res.bookings?.hotel),
    car: mapItems(res.bookings?.car),
  };
}

/** budgetEstimate 중 항공/숙소/렌터카를 뺀 나머지(식비/입장료/현지교통비)만 추출 — 항공/숙소/렌터카는 bookings 선택값으로 계산하기 때문 */
export function mapClaudeExtraBudget(res: ClaudeItineraryResponse): { food: number; admission: number; localTransit: number } {
  return {
    food: res.budgetEstimate?.food ?? 0,
    admission: res.budgetEstimate?.admission ?? 0,
    localTransit: res.budgetEstimate?.localTransit ?? 0,
  };
}

/** Claude API(app/api/generate-itinerary) 응답 JSON을 앱 내부 DayPlan[] 형태로 변환한다.
 *  날짜는 AI가 만든 값을 신뢰하지 않고, 사용자가 고른 실제 출발일(startDate) 기준으로 코드에서 정확히 계산한다.
 *  (AI에게 날짜 계산을 맡기면 몇 달 전/후로 지어내는 경우가 있어 신뢰할 수 없다.)
 *  expectedDayCount를 주면, AI가 일부 날짜를 빠뜨려도 그 자리를 빈 플레이스홀더로 채워서
 *  탭 개수(=사용자가 요청한 일수)가 항상 맞도록 보정한다.
 */
export function mapClaudeResponseToDays(res: ClaudeItineraryResponse, startDate?: string, expectedDayCount?: number): DayPlan[] {
  function calcDateLabel(dayIndex: number, fallbackDate: string): string {
    if (startDate) {
      const base = new Date(startDate + 'T00:00:00');
      base.setDate(base.getDate() + (dayIndex - 1));
      return `${base.getMonth() + 1}/${base.getDate()} (${WEEKDAY[base.getDay()]})`;
    }
    const dateObj = new Date(fallbackDate);
    return isNaN(dateObj.getTime())
      ? fallbackDate
      : `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${WEEKDAY[dateObj.getDay()]})`;
  }

  const byIndex = new Map<number, DayPlan>();
  res.days.forEach((d) => {
    const places = d.places.map((p, i) => ({
      key: `${d.dayIndex}-${i}`,
      order: p.order,
      time: p.time,
      name: p.name,
      category: CATEGORY_MAP[p.category] ?? ('관광' as Category),
      duration: p.durationLabel,
      travel: p.travelMode,
      legTime: p.travelTimeLabel,
      tip: {
        menu: p.tip.mustTryMenu || '-',
        wait: p.tip.waitingTip || '-',
        note: p.tip.note || '-',
      },
    }));

    byIndex.set(d.dayIndex, {
      label: `${d.dayIndex}일차`,
      date: calcDateLabel(d.dayIndex, d.date),
      weather: d.weatherSummary,
      weatherAlert: d.weatherAlert,
      breakAlert: d.breakTimeAlert,
      places,
      legs: buildLegs(places),
    });
  });

  const highestIndex = res.days.reduce((max, d) => Math.max(max, d.dayIndex), 0);
  const total = expectedDayCount ?? highestIndex;

  const result: DayPlan[] = [];
  for (let i = 1; i <= total; i++) {
    const existing = byIndex.get(i);
    if (existing) {
      result.push(existing);
    } else {
      result.push({
        label: `${i}일차`,
        date: calcDateLabel(i, ''),
        weather: '',
        weatherAlert: null,
        breakAlert: 'AI가 이 날짜의 일정을 만들지 못했어요. 아래 "+ 일정 추가"로 직접 채워주세요.',
        places: [],
        legs: [],
      });
    }
  }
  return result;
}

/** AI가 목적지 기준으로 추천한 쇼핑 아이템을 화면용 ShoppingItem[]으로 변환 (가격은 통화가 달라 비워둠) */
export function mapShoppingRecommendations(res: ClaudeItineraryResponse): ShoppingItem[] {
  return (res.shoppingRecommendations ?? []).map((s, i) => ({
    id: `ai-shop-${i}`,
    category: 'AI 추천',
    name: s.name,
    note: s.note || '',
    price: 0,
    checked: false,
  }));
}

/** 이번 여행 조건(동행유형·스타일·페이스)을 반영한 다음 여행지 추천을 변환 */
export function mapNextTripRecommendations(res: ClaudeItineraryResponse): { name: string; reason: string }[] {
  return (res.nextTripRecommendations ?? []).map((r) => ({ name: r.name, reason: r.reason }));
}