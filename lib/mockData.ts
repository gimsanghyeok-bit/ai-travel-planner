import type {
  BookingOption,
  ChecklistItem,
  Companion,
  DayPlan,
  Expense,
  FoodLog,
  Pace,
  ShoppingItem,
  TravelStyle,
} from './types';

// 1차 개발 범위 목업 데이터. 실제 서비스 전환 시 이 파일 대신
// app/api/generate-itinerary가 반환하는 Claude 응답으로 교체한다.

export const FULL_DAYS_RAW = [
  {
    label: '1일차', date: '8/12 (수)', weather: '맑음 32° / 25°', weatherAlert: null as string | null, breakAlert: null as string | null,
    places: [
      { time: '15:00', name: '난바 숙소 체크인', category: '이동', duration: '55분 소요', travel: '리무진버스', legTime: '55분', tip: { menu: '-', wait: '-', note: '리무진버스는 사전 예약 시 좌석 보장' } },
      { time: '17:30', name: '도톤보리 리버워크', category: '핫플', duration: '40분', travel: '도보', legTime: '10분', tip: { menu: '-', wait: '대기 없음', note: '글리코상 간판 앞이 인생샷 명당' } },
      { time: '18:30', name: '이치란 라멘 도톤보리점', category: '식사', duration: '50분', travel: '도보', legTime: '3분', tip: { menu: '오리지널 돈코츠 라멘', wait: '오후 6시 이전 방문 시 대기 짧음', note: '주문서는 한국어 지원' } },
      { time: '20:00', name: '신사이바시 쇼핑거리', category: '쇼핑', duration: '1시간', travel: '도보', legTime: '5분', tip: { menu: '-', wait: '-', note: '드럭스토어 세일은 늦은 저녁이 한산' } },
      { time: '21:30', name: '호젠지요코초 골목 바', category: '핫플', duration: '1시간', travel: '도보', legTime: '4분', tip: { menu: '하이볼', wait: '-', note: '좁은 골목, 조용한 분위기' } },
    ],
  },
  {
    label: '2일차', date: '8/13 (목)', weather: '대체로 흐림 30° / 24°', weatherAlert: '오후 소나기 - 우산 챙기기', breakAlert: '오사카성 천수각 매표 마감 16:30 - 15:00 이전 도착 권장',
    places: [
      { time: '09:30', name: '오사카성', category: '관광', duration: '2시간', travel: '지하철', legTime: '20분', tip: { menu: '-', wait: '천수각 입장 대기 20분', note: '천수각 매표 마감 16:30' } },
      { time: '12:00', name: '오사카성 인근 카레 전문점', category: '식사', duration: '40분', travel: '도보', legTime: '8분', tip: { menu: '가츠 카레', wait: '평일 낮 대기 짧음', note: '현금 결제만 가능' } },
      { time: '14:00', name: '우메다 스카이빌딩 전망대', category: '관광', duration: '1시간', travel: '지하철', legTime: '25분', tip: { menu: '-', wait: '주말 대기 30분+', note: '일몰 시간대 가장 인기' } },
      { time: '16:00', name: '그랑프론트 오사카', category: '쇼핑', duration: '1시간 30분', travel: '도보', legTime: '6분', tip: { menu: '-', wait: '-', note: '외국인 세금 환급 카운터 4층' } },
      { time: '18:30', name: '우메다 이자카야 골목', category: '식사', duration: '1시간 30분', travel: '도보', legTime: '10분', tip: { menu: '모듬 야키토리', wait: '19시 이후 대기 발생', note: '2차는 조용한 뒷골목 추천' } },
      { time: '20:30', name: '우메다 지하가 산책', category: '힐링', duration: '40분', travel: '도보', legTime: '3분', tip: { menu: '-', wait: '-', note: '지하 상점가는 22시 대부분 마감' } },
    ],
  },
  {
    label: '3일차', date: '8/14 (금)', weather: '맑음 33° / 26°', weatherAlert: null as string | null, breakAlert: null as string | null,
    places: [
      { time: '09:00', name: '유니버설 스튜디오 재팬 입장', category: '핫플', duration: '종일', travel: '지하철', legTime: '30분', tip: { menu: '-', wait: '익스프레스 패스 추천', note: '개장 30분 전 도착 권장' } },
      { time: '12:30', name: 'USJ 내 푸드코트', category: '식사', duration: '40분', travel: '도보', legTime: '2분', tip: { menu: '미니언 테마 버거', wait: '12~13시 대기 최대', note: '11시 30분 이전 방문 권장' } },
      { time: '19:00', name: '코난공원역 인근 오코노미야키', category: '식사', duration: '1시간', travel: '지하철', legTime: '25분', tip: { menu: '모던야키', wait: '저녁 대기 있음', note: '예약 가능 매장' } },
      { time: '21:00', name: '숙소 온천 스파', category: '힐링', duration: '1시간', travel: '숙소 내', legTime: '0분', tip: { menu: '-', wait: '-', note: '문신 가리개 준비' } },
    ],
  },
  {
    label: '4일차', date: '8/15 (토)', weather: '흐림 29° / 23°', weatherAlert: null as string | null, breakAlert: null as string | null,
    places: [
      { time: '09:00', name: '교토로 이동', category: '이동', duration: '15분', travel: 'JR 열차', legTime: '15분', tip: { menu: '-', wait: '-', note: '왕복 티켓 미리 구매' } },
      { time: '10:00', name: '후시미이나리 신사', category: '관광', duration: '1시간 30분', travel: '도보', legTime: '5분', tip: { menu: '-', wait: '이른 오전이 가장 한산', note: '상시 개방, 브레이크타임 없음' } },
      { time: '12:30', name: '니시키 시장 먹거리 투어', category: '식사', duration: '1시간', travel: '도보', legTime: '15분', tip: { menu: '다코야키, 유바 만주', wait: '점심시간 혼잡', note: '현금 소액권 준비' } },
      { time: '14:30', name: '기온거리 & 야사카신사', category: '핫플', duration: '1시간 30분', travel: '도보', legTime: '20분', tip: { menu: '-', wait: '-', note: '기모노 대여 예약 필요' } },
      { time: '16:30', name: '간사이공항으로 이동', category: '이동', duration: '1시간', travel: '공항 리무진', legTime: '60분', tip: { menu: '-', wait: '-', note: '탑승 2시간 전 도착' } },
    ],
  },
];

export const PACE_COUNTS: Record<Pace, number> = { tight: 6, normal: 5, relaxed: 3 };
export const PACE_LABELS: Record<Pace, string> = { tight: '타이트한 핫플 투어', normal: '보통', relaxed: '여유로운 힐링' };
export const PACE_DESC: Record<Pace, string> = {
  tight: '하루 5~6곳, 이동은 최소화해 빠르게 도는 코스입니다.',
  normal: '하루 4~5곳, 이동과 휴식의 균형을 맞춘 코스입니다.',
  relaxed: '하루 3곳 이하, 여유롭게 머무는 힐링 코스입니다.',
};
export const COMPANIONS: Companion[] = ['혼자', '연인', '친구', '가족'];
export const STYLES: TravelStyle[] = ['맛집', '핫플', '힐링', '쇼핑'];
export const CATEGORY_COLOR: Record<string, string> = {
  관광: '#5F7A55', 식사: '#C1502E', 쇼핑: '#5B4B8A', 힐링: '#1F7A6C', 핫플: '#C1502E', 이동: '#7A6F65',
};
export const PLACE_CATEGORIES = ['관광', '식사', '쇼핑', '힐링', '핫플', '이동'];

export const MY_MENU = [
  { key: 'info', label: '여행 정보', sub: '체크리스트 · 환율 · 필수앱 · 교통패스' },
  { key: 'shopping', label: '쇼핑 리스트', sub: '추천템 체크하기' },
  { key: 'record', label: '기록 & 다음 여행', sub: '맛집 기록 · 추천 · 저축 계산기' },
  { key: 'share', label: '공유하기', sub: 'PDF · 노션 · 카카오톡' },
] as const;

export const SHOPPING_LIST_DEFAULT: ShoppingItem[] = [
  { id: 's1', category: '돈키호테', name: '시로이 코이비토 초콜릿', note: '오사카 대표 기념 과자, 공항보다 저렴', price: 1200, checked: false },
  { id: 's2', category: '돈키호테', name: '로이스 생초콜릿', note: '냉장 보관 필요, 여름엔 아이스팩 추천', price: 1500, checked: false },
  { id: 's3', category: '드럭스토어', name: '사론파스 파스', note: '동행자 선물용으로 인기, 대용량이 저렴', price: 800, checked: false },
  { id: 's4', category: '드럭스토어', name: '핫치오리 아이마스크', note: '여행 중 피로 회복용', price: 600, checked: false },
  { id: 's5', category: '편의점', name: '훼미리마트 한정 디저트', note: '시즌마다 신상품 교체, 재구매 어려움', price: 400, checked: false },
  { id: 's6', category: '슈퍼마켓', name: '칼비 감자칩 지역 한정판', note: '오사카/간사이 한정 맛, 마트에서 구매', price: 300, checked: false },
];

export const CHECKLIST_DEFAULT: ChecklistItem[] = [
  { id: 'passport', label: '여권 (유효기간 6개월 이상)', checked: true },
  { id: 'esim', label: '유심 / eSIM', checked: false },
  { id: 'insurance', label: '여행자보험', checked: false },
  { id: 'charger', label: '충전기 / 멀티어댑터', checked: false },
  { id: 'visa', label: '비자 요건 확인', checked: false },
  { id: 'vaccine', label: '백신/검역 요건 확인', checked: false },
];

export const ESSENTIALS = [
  { name: 'Google 지도', desc: '오프라인 지도 미리 다운로드 권장' },
  { name: 'Papago', desc: '현지어 간단 번역' },
  { name: '포켓와이파이 / eSIM', desc: '데이터 사용량 많으면 무제한 포켓와이파이 추천' },
];

export const TRANSIT_PASSES: { name: string; desc: string; price: number }[] = [];

export const NEXT_TRIP_RECS = [
  { name: '후쿠오카', reason: '맛집 취향과 잘 맞는 미식 도시, 짧은 비행시간' },
  { name: '다낭', reason: '힐링 스타일에 맞는 리조트/해변 중심 여행지' },
  { name: '방콕', reason: '핫플·쇼핑 스타일에 맞는 활기찬 도심 여행지' },
];

export const RAIN_ALT_TARGET = '우메다 스카이빌딩 전망대';
export const RAIN_ALT_REPLACEMENT = {
  name: '그랑프론트 오사카 실내 전망 라운지',
  category: '힐링' as const,
  tip: { menu: '-', wait: '-', note: '우천 시 실내에서 즐기는 오사카 시내 전망 대안' },
};

export const FLIGHT_OPTIONS: BookingOption[] = [
  { name: '제주항공 저비용항공', desc: '인천 → 간사이, 왕복 2인, 직항', price: 560000 },
  { name: '진에어 저비용항공', desc: '인천 → 간사이, 왕복 2인, 직항', price: 590000 },
  { name: '티웨이항공 저비용항공', desc: '인천 → 간사이, 왕복 2인, 직항', price: 610000 },
  { name: '아시아나항공 직항', desc: '인천 → 간사이, 왕복 2인, 직항', price: 780000 },
  { name: '대한항공 직항', desc: '인천 → 간사이, 왕복 2인, 직항', price: 840000 },
];
export const HOTEL_OPTIONS: BookingOption[] = [
  { name: '우메다 부티크 호텔 (더블룸)', desc: '우메다역 도보 3분 · 3박', price: 390000 },
  { name: '난바 시티 호텔 (더블룸)', desc: '도톤보리 도보 5분 · 3박', price: 450000 },
  { name: '신사이바시 디자인 호텔 (더블룸)', desc: '신사이바시역 도보 2분 · 3박', price: 470000 },
  { name: '도톤보리 리버뷰 호텔 (더블룸)', desc: '도톤보리강 전망 · 3박', price: 510000 },
  { name: '오사카역 직결 호텔 (더블룸)', desc: '오사카역 직결, 공항 이동 편리 · 3박', price: 560000 },
];
export const CAR_OPTIONS: BookingOption[] = [
  { name: '대중교통 이용 (렌터카 없음)', desc: '전 일정 지하철/도보로 이동', price: 0 },
  { name: '소형 렌터카 4일', desc: '공항 픽업/반납 · 보험 포함', price: 180000 },
  { name: '준중형 렌터카 4일', desc: '공항 픽업/반납 · 보험 포함', price: 220000 },
  { name: 'SUV 렌터카 4일', desc: '공항 픽업/반납 · 보험 포함, 짐 많은 경우 추천', price: 280000 },
];

export const DEFAULT_EXPENSES: Expense[] = [
  { id: 'e1', label: '이치란 라멘 저녁', category: '식비', amount: 42000, payer: '민준' },
  { id: 'e2', label: '신칸센 왕복', category: '교통비', amount: 68000, payer: '서연' },
  { id: 'e3', label: 'USJ 입장권 2인', category: '입장료', amount: 220000, payer: '민준' },
];

export const DEFAULT_FOOD_LOGS: FoodLog[] = [
  { id: 'f1', name: '이치란 라멘', memo: '오리지널 돈코츠, 웨이팅 짧음', stars: 5 },
  { id: 'f2', name: '오사카성 카레집', memo: '가츠 카레 추천', stars: 4 },
];

/** 페이스에 따라 하루 장소 개수를 잘라내고 order/legs를 재계산한다. */
export function buildDays(pace: Pace): DayPlan[] {
  const count = PACE_COUNTS[pace] ?? 5;
  return FULL_DAYS_RAW.map((d, di) => {
    const places = d.places.slice(0, count).map((p, i) => ({
      ...p,
      category: p.category as DayPlan['places'][number]['category'],
      order: i + 1,
      key: `${di}-${i}`,
    }));
    return { ...d, places, legs: buildLegs(places) };
  });
}

export function buildLegs(places: DayPlan['places']): DayPlan['legs'] {
  const legs: DayPlan['legs'] = [];
  for (let i = 0; i < places.length - 1; i++) {
    legs.push({
      from: places[i].name,
      to: places[i + 1].name,
      fromOrder: places[i].order,
      toOrder: places[i + 1].order,
      mode: places[i + 1].travel,
      time: places[i + 1].legTime,
    });
  }
  return legs;
}

export function sortAndReindex(places: DayPlan['places']): DayPlan['places'] {
  const sorted = [...places].sort((a, b) => a.time.localeCompare(b.time));
  sorted.forEach((p, i) => { p.order = i + 1; });
  return sorted;
}

export function fmtWon(n: number): string {
  return n.toLocaleString('ko-KR') + '원';
}

export function computeBudget(
  bookings: { flight: BookingOption[]; hotel: BookingOption[]; car: BookingOption[] },
  selectedFlight: number,
  selectedHotel: number,
  selectedCar: number,
  extra?: { food?: number; admission?: number; localTransit?: number }
) {
  const flight = bookings.flight[selectedFlight]?.price ?? 0;
  const hotel = bookings.hotel[selectedHotel]?.price ?? 0;
  const car = bookings.car[selectedCar]?.price ?? 0;
  const budget: Record<string, number> = {
    항공료: flight,
    숙박비: hotel,
    렌터카비: car,
    식비: extra?.food ?? 320000,
    입장료: extra?.admission ?? 150000,
    현지교통비: extra?.localTransit ?? 90000,
  };
  const total = Object.values(budget).reduce((a, b) => a + b, 0);
  return { budget, total };
}