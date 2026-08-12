import {
  buildDays, buildLegs, sortAndReindex, CHECKLIST_DEFAULT, SHOPPING_LIST_DEFAULT,
  DEFAULT_EXPENSES, DEFAULT_FOOD_LOGS, RAIN_ALT_TARGET, RAIN_ALT_REPLACEMENT,
  FLIGHT_OPTIONS, HOTEL_OPTIONS, CAR_OPTIONS, computeBudget,
} from './mockData';
import type {
  BookingOption, Category, ChecklistItem, Companion, DayPlan, Expense, FoodLog, MyViewKey,
  Pace, ShoppingItem, TabKey, TravelStyle, TripForm,
} from './types';

export interface AppState {
  stage: 'onboard' | 'app';
  activeTab: TabKey;
  itinerarySubView: 'timeline' | 'map';
  myViewKey: MyViewKey;
  activeDayIndex: number;
  tipOpenKey: string | null;
  form: TripForm;
  days: DayPlan[] | null;
  expenses: Expense[];
  expenseForm: { label: string; amount: string; payer: string };
  shareToast: string | null;
  selectedFlight: number;
  selectedHotel: number;
  selectedCar: number;
  checklist: ChecklistItem[];
  currencyKrw: string;
  rainApplied: boolean;
  foodLogs: FoodLog[];
  foodForm: { name: string; memo: string; stars: number };
  savingsTarget: string;
  savingsMonths: number;
  placeMemos: Record<string, string>;
  shoppingList: ShoppingItem[];
  bookingExpanded: { flight: boolean; hotel: boolean; car: boolean };
  addingPlace: boolean;
  newPlace: { time: string; name: string; category: Category };
  shoppingForm: { name: string; category: string; price: string; note: string };
  isGenerating: boolean;
  generateError: string | null;
  bookings: { flight: BookingOption[]; hotel: BookingOption[]; car: BookingOption[] };
  extraBudget: { food: number; admission: number; localTransit: number };
}

export const initialState: AppState = {
  stage: 'onboard',
  activeTab: 'home',
  itinerarySubView: 'timeline',
  myViewKey: null,
  activeDayIndex: 0,
  tipOpenKey: null,
  form: { destination: '오사카', nights: 3, days: 4, companion: '연인', style: ['맛집', '핫플'], pace: 'normal' },
  days: null,
  expenses: DEFAULT_EXPENSES,
  expenseForm: { label: '', amount: '', payer: '민준' },
  shareToast: null,
  selectedFlight: 0,
  selectedHotel: 0,
  selectedCar: 0,
  checklist: CHECKLIST_DEFAULT,
  currencyKrw: '100000',
  rainApplied: false,
  foodLogs: DEFAULT_FOOD_LOGS,
  foodForm: { name: '', memo: '', stars: 5 },
  savingsTarget: '1500000',
  savingsMonths: 6,
  placeMemos: {},
  shoppingList: SHOPPING_LIST_DEFAULT,
  bookingExpanded: { flight: false, hotel: false, car: false },
  addingPlace: false,
  newPlace: { time: '', name: '', category: '관광' },
  shoppingForm: { name: '', category: '', price: '', note: '' },
  isGenerating: false,
  generateError: null,
  bookings: { flight: FLIGHT_OPTIONS, hotel: HOTEL_OPTIONS, car: CAR_OPTIONS },
  extraBudget: { food: 320000, admission: 150000, localTransit: 90000 },
};

export type Action =
  | { type: 'NIGHTS_MINUS' } | { type: 'NIGHTS_PLUS' }
  | { type: 'SET_DESTINATION'; value: string }
  | { type: 'SELECT_COMPANION'; value: Companion }
  | { type: 'TOGGLE_STYLE'; value: TravelStyle }
  | { type: 'SELECT_PACE'; value: Pace }
  | { type: 'GENERATE' } | { type: 'BACK_TO_ONBOARD' }
  | { type: 'GENERATE_START' }
  | { type: 'GENERATE_SUCCESS'; days: DayPlan[]; bookings: AppState['bookings']; extraBudget: AppState['extraBudget'] }
  | { type: 'GENERATE_FAIL'; message: string }
  | { type: 'SET_TAB'; value: TabKey }
  | { type: 'GO_HOME_ITINERARY' } | { type: 'GO_TAB_BOOKING' } | { type: 'GO_TAB_BUDGET' } | { type: 'GO_HOME_CHECKLIST' }
  | { type: 'SET_SUBVIEW'; value: 'timeline' | 'map' }
  | { type: 'SET_DAY'; value: number }
  | { type: 'TOGGLE_TIP'; value: string }
  | { type: 'SET_MEMO'; key: string; value: string }
  | { type: 'REORDER_PLACES'; from: number; to: number }
  | { type: 'DELETE_PLACE'; key: string }
  | { type: 'TOGGLE_ADD_PLACE' }
  | { type: 'SET_NEW_PLACE_FIELD'; field: 'time' | 'name'; value: string }
  | { type: 'SELECT_NEW_PLACE_CATEGORY'; value: Category }
  | { type: 'ADD_PLACE' }
  | { type: 'APPLY_RAIN_ALT' }
  | { type: 'SELECT_FLIGHT'; value: number } | { type: 'SELECT_HOTEL'; value: number } | { type: 'SELECT_CAR'; value: number }
  | { type: 'TOGGLE_BOOKING_EXPAND'; value: 'flight' | 'hotel' | 'car' }
  | { type: 'SET_EXPENSE_FIELD'; field: 'label' | 'amount'; value: string }
  | { type: 'SELECT_PAYER'; value: string }
  | { type: 'ADD_EXPENSE' }
  | { type: 'TOGGLE_CHECKLIST'; id: string }
  | { type: 'SET_CURRENCY'; value: string }
  | { type: 'SET_FOOD_FIELD'; field: 'name' | 'memo'; value: string }
  | { type: 'SELECT_FOOD_STARS'; value: number }
  | { type: 'ADD_FOOD_LOG' }
  | { type: 'TOGGLE_SHOPPING'; id: string }
  | { type: 'SET_SHOPPING_FIELD'; field: 'name' | 'category' | 'price' | 'note'; value: string }
  | { type: 'ADD_SHOPPING_ITEM' }
  | { type: 'DELETE_SHOPPING_ITEM'; id: string }
  | { type: 'SET_SAVINGS_TARGET'; value: string }
  | { type: 'SAVINGS_MONTHS_MINUS' } | { type: 'SAVINGS_MONTHS_PLUS' }
  | { type: 'OPEN_MY_VIEW'; value: MyViewKey }
  | { type: 'MY_BACK' }
  | { type: 'SHARE'; value: 'pdf' | 'notion' | 'kakao' };

function getDays(state: AppState): DayPlan[] {
  return state.days ?? buildDays(state.form.pace);
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NIGHTS_MINUS': {
      const nights = Math.max(1, state.form.nights - 1);
      const days = Math.max(2, state.form.days - 1);
      return { ...state, form: { ...state.form, nights, days } };
    }
    case 'NIGHTS_PLUS':
      return { ...state, form: { ...state.form, nights: state.form.nights + 1, days: state.form.days + 1 } };
    case 'SET_DESTINATION':
      return { ...state, form: { ...state.form, destination: action.value } };
    case 'SELECT_COMPANION':
      return { ...state, form: { ...state.form, companion: action.value } };
    case 'TOGGLE_STYLE': {
      const has = state.form.style.includes(action.value);
      const style = has ? state.form.style.filter((t) => t !== action.value) : [...state.form.style, action.value];
      return { ...state, form: { ...state.form, style } };
    }
    case 'SELECT_PACE':
      return { ...state, form: { ...state.form, pace: action.value } };
    case 'GENERATE':
      return { ...state, stage: 'app', days: buildDays(state.form.pace), activeTab: 'home', activeDayIndex: 0 };
    case 'GENERATE_START':
      return { ...state, isGenerating: true, generateError: null };
    case 'GENERATE_SUCCESS': {
      const { total } = computeBudget(action.bookings, 0, 0, 0, action.extraBudget);
      return {
        ...state,
        stage: 'app',
        days: action.days,
        bookings: action.bookings,
        extraBudget: action.extraBudget,
        activeTab: 'home',
        activeDayIndex: 0,
        selectedFlight: 0,
        selectedHotel: 0,
        selectedCar: 0,
        isGenerating: false,
        generateError: null,
        expenses: [],
        foodLogs: [],
        shoppingList: [],
        shoppingForm: { name: '', category: '', price: '', note: '' },
        savingsTarget: String(total),
        savingsMonths: 6,
      };
    }
    case 'GENERATE_FAIL':
      return { ...state, isGenerating: false, generateError: action.message };
    case 'BACK_TO_ONBOARD':
      return { ...state, stage: 'onboard' };
    case 'SET_TAB':
      return { ...state, activeTab: action.value, myViewKey: null };
    case 'GO_HOME_ITINERARY':
      return { ...state, activeTab: 'itinerary', itinerarySubView: 'timeline' };
    case 'GO_TAB_BOOKING':
      return { ...state, activeTab: 'booking' };
    case 'GO_TAB_BUDGET':
      return { ...state, activeTab: 'budget' };
    case 'GO_HOME_CHECKLIST':
      return { ...state, activeTab: 'my', myViewKey: 'info' };
    case 'SET_SUBVIEW':
      return { ...state, itinerarySubView: action.value };
    case 'SET_DAY':
      return { ...state, activeDayIndex: action.value };
    case 'TOGGLE_TIP':
      return { ...state, tipOpenKey: state.tipOpenKey === action.value ? null : action.value };
    case 'SET_MEMO':
      return { ...state, placeMemos: { ...state.placeMemos, [action.key]: action.value } };
    case 'REORDER_PLACES': {
      const days = getDays(state).map((d, i) => {
        if (i !== state.activeDayIndex) return d;
        const list = [...d.places];
        const [item] = list.splice(action.from, 1);
        list.splice(action.to, 0, item);
        list.forEach((p, idx) => { p.order = idx + 1; });
        return { ...d, places: list, legs: buildLegs(list) };
      });
      return { ...state, days };
    }
    case 'DELETE_PLACE': {
      const days = getDays(state).map((d, i) => {
        if (i !== state.activeDayIndex) return d;
        const places = sortAndReindex(d.places.filter((p) => p.key !== action.key));
        return { ...d, places, legs: buildLegs(places) };
      });
      return { ...state, days };
    }
    case 'TOGGLE_ADD_PLACE':
      return { ...state, addingPlace: !state.addingPlace, newPlace: { time: '', name: '', category: '관광' } };
    case 'SET_NEW_PLACE_FIELD':
      return { ...state, newPlace: { ...state.newPlace, [action.field]: action.value } };
    case 'SELECT_NEW_PLACE_CATEGORY':
      return { ...state, newPlace: { ...state.newPlace, category: action.value } };
    case 'ADD_PLACE': {
      const { time, name, category } = state.newPlace;
      if (!time || !name) return state;
      const days = getDays(state).map((d, i) => {
        if (i !== state.activeDayIndex) return d;
        const newItem = {
          time, name, category, duration: '-', travel: '-', legTime: '-',
          tip: { menu: '-', wait: '-', note: '-' }, key: `custom-${Date.now()}`, order: 0,
        };
        const places = sortAndReindex([...d.places, newItem]);
        return { ...d, places, legs: buildLegs(places) };
      });
      return { ...state, days, addingPlace: false, newPlace: { time: '', name: '', category: '관광' } };
    }
    case 'APPLY_RAIN_ALT': {
      const days = getDays(state).map((d) => ({
        ...d,
        places: d.places.map((p) =>
          p.name === RAIN_ALT_TARGET
            ? { ...p, name: RAIN_ALT_REPLACEMENT.name, category: RAIN_ALT_REPLACEMENT.category, tip: RAIN_ALT_REPLACEMENT.tip }
            : p
        ),
      }));
      return { ...state, rainApplied: true, days };
    }
    case 'SELECT_FLIGHT':
      return { ...state, selectedFlight: action.value };
    case 'SELECT_HOTEL':
      return { ...state, selectedHotel: action.value };
    case 'SELECT_CAR':
      return { ...state, selectedCar: action.value };
    case 'TOGGLE_BOOKING_EXPAND':
      return { ...state, bookingExpanded: { ...state.bookingExpanded, [action.value]: !state.bookingExpanded[action.value] } };
    case 'SET_EXPENSE_FIELD':
      return { ...state, expenseForm: { ...state.expenseForm, [action.field]: action.value } };
    case 'SELECT_PAYER':
      return { ...state, expenseForm: { ...state.expenseForm, payer: action.value } };
    case 'ADD_EXPENSE': {
      const { label, amount, payer } = state.expenseForm;
      const amt = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
      if (!label || !amt) return state;
      return {
        ...state,
        expenses: [...state.expenses, { id: `e${Date.now()}`, label, category: '기타', amount: amt, payer }],
        expenseForm: { label: '', amount: '', payer },
      };
    }
    case 'TOGGLE_CHECKLIST':
      return { ...state, checklist: state.checklist.map((c) => (c.id === action.id ? { ...c, checked: !c.checked } : c)) };
    case 'SET_CURRENCY':
      return { ...state, currencyKrw: action.value };
    case 'SET_FOOD_FIELD':
      return { ...state, foodForm: { ...state.foodForm, [action.field]: action.value } };
    case 'SELECT_FOOD_STARS':
      return { ...state, foodForm: { ...state.foodForm, stars: action.value } };
    case 'ADD_FOOD_LOG': {
      const { name, memo, stars } = state.foodForm;
      if (!name) return state;
      return {
        ...state,
        foodLogs: [...state.foodLogs, { id: `f${Date.now()}`, name, memo, stars }],
        foodForm: { name: '', memo: '', stars: 5 },
      };
    }
    case 'TOGGLE_SHOPPING':
      return { ...state, shoppingList: state.shoppingList.map((i) => (i.id === action.id ? { ...i, checked: !i.checked } : i)) };
    case 'SET_SHOPPING_FIELD':
      return { ...state, shoppingForm: { ...state.shoppingForm, [action.field]: action.value } };
    case 'ADD_SHOPPING_ITEM': {
      const { name, category, price, note } = state.shoppingForm;
      if (!name) return state;
      const amt = parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
      return {
        ...state,
        shoppingList: [
          ...state.shoppingList,
          { id: `s${Date.now()}`, category: category || '기타', name, note: note || '', price: amt, checked: false },
        ],
        shoppingForm: { name: '', category: '', price: '', note: '' },
      };
    }
    case 'DELETE_SHOPPING_ITEM':
      return { ...state, shoppingList: state.shoppingList.filter((i) => i.id !== action.id) };
    case 'SET_SAVINGS_TARGET':
      return { ...state, savingsTarget: action.value };
    case 'SAVINGS_MONTHS_MINUS':
      return { ...state, savingsMonths: Math.max(1, state.savingsMonths - 1) };
    case 'SAVINGS_MONTHS_PLUS':
      return { ...state, savingsMonths: state.savingsMonths + 1 };
    case 'OPEN_MY_VIEW':
      return { ...state, myViewKey: action.value };
    case 'MY_BACK':
      return { ...state, myViewKey: null };
    case 'SHARE': {
      const msg = {
        pdf: 'PDF 파일이 생성되었습니다.',
        notion: '노션 템플릿 링크가 복사되었습니다.',
        kakao: '카카오톡 공유 링크가 생성되었습니다.',
      }[action.value];
      return { ...state, shareToast: msg };
    }
    default:
      return state;
  }
}