'use client';

import { useReducer } from 'react';
import { initialState, reducer } from '@/lib/reducer';
import { buildDays } from '@/lib/mockData';
import OnboardingScreen from './OnboardingScreen';
import HomeTab from './HomeTab';
import ItineraryTab from './ItineraryTab';
import BookingTab from './BookingTab';
import BudgetTab from './BudgetTab';
import MyTab from './MyTab';
import type { TabKey } from '@/lib/types';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'home', label: '홈' },
  { key: 'itinerary', label: '일정' },
  { key: 'booking', label: '예약' },
  { key: 'budget', label: '정산' },
  { key: 'my', label: 'MY' },
];

export default function TravelPlannerApp() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const days = state.days ?? buildDays(state.form.pace);

  return (
    <div className="w-[390px] h-[844px] max-h-[calc(100vh-64px)] bg-bg text-ink rounded-[36px] overflow-hidden shadow-2xl flex flex-col relative">
      {state.stage === 'onboard' ? (
        <OnboardingScreen state={state} dispatch={dispatch} />
      ) : (
        <>
          <header className="pt-[54px] pb-3 px-5 flex items-center justify-between shrink-0">
            <div>
              <div className="font-heading font-bold text-[19px]">
                {state.form.destination} · {state.form.nights}박 {state.form.days}일
              </div>
              <div className="text-xs text-ink-soft mt-0.5">
                {state.form.companion} 여행 · {state.form.style.join(', ')}
              </div>
            </div>
            <button
              className="text-xs text-ink-soft underline shrink-0"
              onClick={() => dispatch({ type: 'BACK_TO_ONBOARD' })}
            >
              조건 수정
            </button>
          </header>

          <div className="flex-1 flex flex-col overflow-hidden">
            {state.activeTab === 'home' && <HomeTab state={state} days={days} dispatch={dispatch} />}
            {state.activeTab === 'itinerary' && <ItineraryTab state={state} days={days} dispatch={dispatch} />}
            {state.activeTab === 'booking' && <BookingTab state={state} dispatch={dispatch} />}
            {state.activeTab === 'budget' && <BudgetTab state={state} dispatch={dispatch} />}
            {state.activeTab === 'my' && <MyTab state={state} days={days} dispatch={dispatch} />}

            <nav className="flex border-t border-canvas bg-bg px-2 pt-2.5 pb-4 shrink-0">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => dispatch({ type: 'SET_TAB', value: t.key })}
                  className={`flex-1 py-2 px-1 text-xs font-bold border-t-2 ${
                    state.activeTab === t.key ? 'text-accent border-accent' : 'text-ink-faint border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
