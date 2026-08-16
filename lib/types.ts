export type Category = '관광' | '식사' | '쇼핑' | '힐링' | '핫플' | '이동';
export type Pace = 'tight' | 'normal' | 'relaxed';
export type Companion = '혼자' | '연인' | '친구' | '가족';
export type TravelStyle = '맛집' | '핫플' | '힐링' | '쇼핑';
export type TabKey = 'home' | 'itinerary' | 'booking' | 'budget' | 'my';
export type MyViewKey = 'info' | 'shopping' | 'record' | 'share' | null;

export interface PlaceTip {
  menu: string;
  wait: string;
  note: string;
}

export interface Place {
  key: string;
  order: number;
  time: string;
  name: string;
  category: Category;
  duration: string;
  travel: string;
  legTime: string;
  tip: PlaceTip;
}

export interface Leg {
  from: string;
  to: string;
  fromOrder: number;
  toOrder: number;
  mode: string;
  time: string;
}

export interface DayPlan {
  label: string;
  date: string;
  weather: string;
  weatherAlert: string | null;
  breakAlert: string | null;
  places: Place[];
  legs: Leg[];
}

export interface TripForm {
  destination: string;
  nights: number;
  days: number;
  companion: Companion;
  style: TravelStyle[];
  pace: Pace;
  startDate: string; // YYYY-MM-DD, 실제 출발일. 일정의 각 날짜는 이 값 기준으로 코드에서 계산한다 (AI가 지어내지 않도록).
  travelerCount: number; // 항공/숙소/렌터카 가격을 이 인원 기준으로 계산하도록 AI에게 명시적으로 전달한다.
}

export interface Expense {
  id: string;
  label: string;
  category: string;
  amount: number;
  payer: string;
}

export interface FoodLog {
  id: string;
  name: string;
  memo: string;
  stars: number;
}

export interface ShoppingItem {
  id: string;
  category: string;
  name: string;
  note: string;
  price: number;
  checked: boolean;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface BookingOption {
  name: string;
  desc: string;
  price: number;
}