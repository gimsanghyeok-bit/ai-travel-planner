'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { fmtWon } from '@/lib/mockData';
import type { BookingOption } from '@/lib/types';

function BookingSection({
  title, options, selectedIndex, expanded, onSelect, onToggleMore,
}: {
  title: string;
  options: BookingOption[];
  selectedIndex: number;
  expanded: boolean;
  onSelect: (i: number) => void;
  onToggleMore: () => void;
}) {
  const visible = expanded ? options.length : Math.min(3, options.length);
  return (
    <div className="mt-[18px]">
      <div className="font-heading font-bold text-[15px] mb-2">{title}</div>
      <div className="flex flex-col gap-2">
        {options.slice(0, visible).map((o, i) => (
          <button
            key={o.name}
            onClick={() => onSelect(i)}
            className={`text-left w-full card p-3.5 ${i === selectedIndex ? 'border-accent' : ''}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold">{o.name}</span>
              <span className="text-sm font-extrabold text-accent shrink-0">{o.price ? fmtWon(o.price) : '추가 비용 없음'}</span>
            </div>
            <div className="mt-1 text-xs text-ink-soft">{o.desc}</div>
          </button>
        ))}
      </div>
      {options.length > 3 && (
        <button onClick={onToggleMore} className="mt-2 w-full py-1.5 text-xs font-bold text-accent">
          {expanded ? '접기' : `가격 낮은 순으로 ${options.length - 3}개 더보기`}
        </button>
      )}
    </div>
  );
}

export default function BookingTab({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const { flight, hotel, car } = state.bookings;
  const total =
    (flight[state.selectedFlight]?.price ?? 0) +
    (hotel[state.selectedHotel]?.price ?? 0) +
    (car[state.selectedCar]?.price ?? 0);

  return (
    <div className="flex-1 overflow-auto px-5 pt-1 pb-6">
      <div className="flex items-center justify-between">
        <span className="section-label">예약 예상 비용</span>
        <span className="text-[15px] font-extrabold">{fmtWon(total)}</span>
      </div>

      <BookingSection
        title="항공권 추천"
        options={flight}
        selectedIndex={state.selectedFlight}
        expanded={state.bookingExpanded.flight}
        onSelect={(i) => dispatch({ type: 'SELECT_FLIGHT', value: i })}
        onToggleMore={() => dispatch({ type: 'TOGGLE_BOOKING_EXPAND', value: 'flight' })}
      />
      <BookingSection
        title="숙소 추천"
        options={hotel}
        selectedIndex={state.selectedHotel}
        expanded={state.bookingExpanded.hotel}
        onSelect={(i) => dispatch({ type: 'SELECT_HOTEL', value: i })}
        onToggleMore={() => dispatch({ type: 'TOGGLE_BOOKING_EXPAND', value: 'hotel' })}
      />
      <BookingSection
        title="렌터카 추천"
        options={car}
        selectedIndex={state.selectedCar}
        expanded={state.bookingExpanded.car}
        onSelect={(i) => dispatch({ type: 'SELECT_CAR', value: i })}
        onToggleMore={() => dispatch({ type: 'TOGGLE_BOOKING_EXPAND', value: 'car' })}
      />
    </div>
  );
}