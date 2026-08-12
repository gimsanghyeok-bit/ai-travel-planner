import type { BookingOption, Category, DayPlan } from './types';
import { buildLegs } from './mockData';

const CATEGORY_MAP: Record<string, Category> = {
  sightseeing: '관광',
  food: '식사',
  shopping: '쇼핑',
  healing: '힐링',
  hotspot: '핫플',
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

/** Claude API(app/api/generate-itinerary) 응답 JSON을 앱 내부 DayPlan[] 형태로 변환한다. */
export function mapClaudeResponseToDays(res: ClaudeItineraryResponse): DayPlan[] {
  return res.days.map((d) => {
    const dateObj = new Date(d.date);
    const dateLabel = isNaN(dateObj.getTime())
      ? d.date
      : `${dateObj.getMonth() + 1}/${dateObj.getDate()} (${WEEKDAY[dateObj.getDay()]})`;

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

    return {
      label: `${d.dayIndex}일차`,
      date: dateLabel,
      weather: d.weatherSummary,
      weatherAlert: d.weatherAlert,
      breakAlert: d.breakTimeAlert,
      places,
      legs: buildLegs(places),
    };
  });
}