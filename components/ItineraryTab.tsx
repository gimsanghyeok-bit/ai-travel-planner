'use client';

import { useRef, useState, type Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import type { Category, DayPlan } from '@/lib/types';
import { CATEGORY_COLOR, PLACE_CATEGORIES, RAIN_ALT_REPLACEMENT, RAIN_ALT_TARGET } from '@/lib/mockData';

export default function ItineraryTab({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-5 pt-1">
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_SUBVIEW', value: 'timeline' })}
            className={`flex-1 rounded-[10px] py-2.5 text-[13px] font-bold border ${
              state.itinerarySubView === 'timeline' ? 'border-accent bg-accent text-white' : 'border-border bg-white text-ink'
            }`}
          >
            타임라인
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_SUBVIEW', value: 'map' })}
            className={`flex-1 rounded-[10px] py-2.5 text-[13px] font-bold border ${
              state.itinerarySubView === 'map' ? 'border-accent bg-accent text-white' : 'border-border bg-white text-ink'
            }`}
          >
            지도
          </button>
        </div>
      </div>
      {state.itinerarySubView === 'timeline' ? (
        <TimelineView state={state} days={days} dispatch={dispatch} />
      ) : (
        <MapView state={state} days={days} dispatch={dispatch} />
      )}
    </div>
  );
}

function DayPills({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1.5 pb-3.5">
      {days.map((d, i) => (
        <button
          key={d.label}
          onClick={() => dispatch({ type: 'SET_DAY', value: i })}
          className={`shrink-0 rounded-pill px-4 py-2 text-[13px] font-bold whitespace-nowrap border ${
            i === state.activeDayIndex ? 'border-accent bg-accent text-white' : 'border-border bg-white text-ink'
          }`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

function TimelineView({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  const day = days[state.activeDayIndex] ?? days[0];
  const hasRainAlt = day.places.some((p) => p.name === RAIN_ALT_TARGET);
  const showRainAlt = !!day.weatherAlert && hasRainAlt && !state.rainApplied;
  const dragIndex = useRef<number | null>(null);

  return (
    <div className="flex-1 overflow-auto px-5 pb-5">
      <DayPills state={state} days={days} dispatch={dispatch} />

      <div className="flex items-center justify-between bg-section rounded-xl px-3.5 py-2.5 text-[13px] text-[#574F47]">
        <span>{day.date} · {day.weather}</span>
        {day.weatherAlert && <span className="text-accent font-bold">{day.weatherAlert}</span>}
      </div>

      {day.breakAlert && (
        <div className="mt-2.5 bg-warn-bg rounded-xl px-3.5 py-2.5 text-[13px] text-warn">
          <span className="font-bold">확인 필요 · </span>{day.breakAlert}
        </div>
      )}

      {showRainAlt && (
        <div className="mt-2.5 bg-section rounded-xl px-3.5 py-3">
          <div className="text-[13px] font-bold">우천 시 대체 일정 제안</div>
          <div className="mt-1 text-xs text-[#574F47] leading-relaxed">
            {RAIN_ALT_TARGET} 대신 {RAIN_ALT_REPLACEMENT.name}로 대체하는 것을 추천해요.
          </div>
          <button
            onClick={() => dispatch({ type: 'APPLY_RAIN_ALT' })}
            className="mt-2 bg-accent text-white rounded-pill px-3.5 py-2 text-xs font-bold"
          >
            이 날 일정에 적용
          </button>
        </div>
      )}
      {state.rainApplied && <div className="mt-2.5 text-xs text-healing">실내 일정으로 대체 적용됨</div>}

      <div className="mt-3.5 flex flex-col gap-2.5">
        {day.places.map((place, idx) => {
          const c = CATEGORY_COLOR[place.category] || '#C1502E';
          const open = state.tipOpenKey === place.key;
          const memo = state.placeMemos[place.key] || '';
          return (
            <div
              key={place.key}
              draggable
              onDragStart={() => { dragIndex.current = idx; }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex.current === null || dragIndex.current === idx) return;
                dispatch({ type: 'REORDER_PLACES', from: dragIndex.current, to: idx });
                dragIndex.current = null;
              }}
              className="card p-3.5 cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-start gap-2.5">
                <div className="w-[22px] h-[22px] rounded-full bg-accent-soft text-accent text-[11px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                  {place.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-ink-soft font-bold">{place.time}</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[11px] font-extrabold px-2 py-0.5 rounded-pill"
                        style={{ background: `${c}22`, color: c }}
                      >
                        {place.category}
                      </span>
                      <button
                        onClick={() => dispatch({ type: 'DELETE_PLACE', key: place.key })}
                        className="text-ink-disabled text-[15px] leading-none px-0.5"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-base font-bold font-heading">{place.name}</div>
                  <div className="mt-0.5 text-[13px] text-ink-soft">{place.duration} · {place.travel}</div>
                  <button
                    onClick={() => dispatch({ type: 'TOGGLE_TIP', value: place.key })}
                    className="mt-2 text-xs font-bold text-accent"
                  >
                    {open ? '팁 닫기 ▲' : '인플루언서 팁 보기 ▾'}
                  </button>
                  {open && (
                    <div className="mt-2 bg-bg rounded-[10px] px-3 py-2.5 text-[13px] text-[#574F47] leading-relaxed">
                      <div><span className="font-bold">필수메뉴</span> · {place.tip.menu}</div>
                      <div><span className="font-bold">웨이팅 팁</span> · {place.tip.wait}</div>
                      <div><span className="font-bold">참고</span> · {place.tip.note}</div>
                    </div>
                  )}
                  <input
                    className="mt-2 w-full border-0 border-b border-dashed border-border bg-transparent py-1 text-xs text-[#574F47] outline-none"
                    placeholder="메모 추가..."
                    defaultValue={memo}
                    onChange={(e) => dispatch({ type: 'SET_MEMO', key: place.key, value: e.target.value })}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {state.addingPlace ? (
        <AddPlaceForm state={state} dispatch={dispatch} />
      ) : (
        <button
          onClick={() => dispatch({ type: 'TOGGLE_ADD_PLACE' })}
          className="mt-2.5 w-full border border-dashed border-border rounded-xl py-3 text-[13px] font-bold text-accent"
        >
          + 일정 추가
        </button>
      )}
    </div>
  );
}

function AddPlaceForm({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  return (
    <div className="mt-2.5 card p-3.5">
      <div className="flex gap-2">
        <input
          className="flex-1 border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="시간 (예: 15:30)"
          value={state.newPlace.time}
          onChange={(e) => dispatch({ type: 'SET_NEW_PLACE_FIELD', field: 'time', value: e.target.value })}
        />
        <input
          className="flex-[1.6] border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="장소 이름"
          value={state.newPlace.name}
          onChange={(e) => dispatch({ type: 'SET_NEW_PLACE_FIELD', field: 'name', value: e.target.value })}
        />
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {PLACE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip ${state.newPlace.category === cat ? 'chip-on' : ''}`}
            onClick={() => dispatch({ type: 'SELECT_NEW_PLACE_CATEGORY', value: cat as Category })}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2.5">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_ADD_PLACE' })}
          className="flex-1 border border-border bg-white rounded-[10px] py-2.5 text-[13px] font-bold"
        >
          취소
        </button>
        <button
          onClick={() => dispatch({ type: 'ADD_PLACE' })}
          className="flex-1 bg-accent text-white rounded-[10px] py-2.5 text-[13px] font-bold"
        >
          추가
        </button>
      </div>
    </div>
  );
}

function MapView({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  const day = days[state.activeDayIndex] ?? days[0];
  return (
    <div className="flex-1 overflow-auto px-5 pb-5">
      <DayPills state={state} days={days} dispatch={dispatch} />
      <div
        className="h-[220px] rounded-2xl flex items-center justify-center text-center p-4"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ECE3D6 0 12px, #F5EEE3 12px 24px)' }}
      >
        <span className="font-mono text-xs text-ink-faint leading-relaxed">
          지도 영역<br />Google Maps / Mapbox 연동
        </span>
      </div>
      <div className="section-label mt-4">이동 경로</div>
      <div className="mt-2 flex flex-col">
        {day.legs.map((leg, i) => (
          <div key={i} className="flex items-center gap-2.5 py-2.5 border-b border-canvas">
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-[18px] h-[18px] rounded-full bg-accent-soft text-accent text-[10px] font-extrabold flex items-center justify-center">
                {leg.fromOrder}
              </div>
              <div className="w-px h-3.5 bg-border" />
              <div className="w-[18px] h-[18px] rounded-full bg-accent-soft text-accent text-[10px] font-extrabold flex items-center justify-center">
                {leg.toOrder}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{leg.from} → {leg.to}</div>
              <div className="text-xs text-ink-soft mt-0.5">{leg.mode} · {leg.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
