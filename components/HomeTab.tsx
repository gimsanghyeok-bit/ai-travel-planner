'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import type { DayPlan } from '@/lib/types';
import { computeBudget, fmtWon } from '@/lib/mockData';

export default function HomeTab({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  const activeDay = days[state.activeDayIndex] ?? days[0];
  const { total: budgetTotal } = computeBudget(state.bookings, state.selectedFlight, state.selectedHotel, state.selectedCar, state.extraBudget);
  const bookingTotal =
    (state.bookings.flight[state.selectedFlight]?.price ?? 0) +
    (state.bookings.hotel[state.selectedHotel]?.price ?? 0) +
    (state.bookings.car[state.selectedCar]?.price ?? 0);
  const checklistDone = state.checklist.filter((c) => c.checked).length;

  const cards: { label: string; value: string; onClick: () => void }[] = [
    {
      label: '오늘 일정 보기',
      value: activeDay.places[0] ? `${activeDay.places[0].time} ${activeDay.places[0].name}` : '-',
      onClick: () => dispatch({ type: 'GO_HOME_ITINERARY' }),
    },
    { label: '예약 현황', value: fmtWon(bookingTotal), onClick: () => dispatch({ type: 'GO_TAB_BOOKING' }) },
    { label: '예상 예산', value: fmtWon(budgetTotal), onClick: () => dispatch({ type: 'GO_TAB_BUDGET' }) },
    {
      label: '준비 체크리스트',
      value: `${checklistDone}/${state.checklist.length} 완료`,
      onClick: () => dispatch({ type: 'GO_HOME_CHECKLIST' }),
    },
  ];

  return (
    <div className="flex-1 overflow-auto px-5 pt-1 pb-5">
      <div className="card p-4">
        <div className="section-label">이번 여행</div>
        <div className="font-heading font-bold text-lg mt-1.5">
          {state.form.destination} · {state.form.nights}박 {state.form.days}일
        </div>
        <div className="text-[13px] text-ink-soft mt-1">
          {state.form.companion} 여행 · {state.form.style.join(', ')}
        </div>
      </div>

      <div className="section-label mt-4">바로가기</div>
      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="text-left card p-3.5 min-h-[84px] flex flex-col justify-between"
          >
            <span className="text-xs font-bold text-ink-soft">{c.label}</span>
            <span className="text-sm font-extrabold">{c.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}