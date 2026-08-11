'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { COMPANIONS, PACE_DESC, PACE_LABELS, STYLES } from '@/lib/mockData';
import type { Pace } from '@/lib/types';

export default function OnboardingScreen({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const { form } = state;

  return (
    <div className="flex-1 overflow-auto">
      <div className="pt-14 px-[22px] pb-6">
        <div className="font-heading font-bold text-[26px] tracking-tight">AI 여행 플래너</div>
        <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">여행 조건을 입력하면 AI가 일자별 동선까지 짜드려요.</p>

        <div className="section-label mt-7">목적지</div>
        <input
          className="mt-2 w-full border border-border rounded-xl px-3.5 py-3.5 text-base bg-white"
          value={form.destination}
          onChange={(e) => dispatch({ type: 'SET_DESTINATION', value: e.target.value })}
        />

        <div className="section-label mt-5">일정</div>
        <div className="mt-2 flex items-center justify-between border border-border rounded-xl px-3.5 py-2.5 bg-white">
          <span className="text-base font-bold">{form.nights}박 {form.days}일</span>
          <div className="flex gap-2">
            <button
              className="w-8 h-8 rounded-lg border border-border bg-bg text-base"
              onClick={() => dispatch({ type: 'NIGHTS_MINUS' })}
            >
              −
            </button>
            <button
              className="w-8 h-8 rounded-lg border border-border bg-bg text-base"
              onClick={() => dispatch({ type: 'NIGHTS_PLUS' })}
            >
              +
            </button>
          </div>
        </div>

        <div className="section-label mt-5">동행 유형</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMPANIONS.map((c) => (
            <button
              key={c}
              className={`chip ${form.companion === c ? 'chip-on' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_COMPANION', value: c })}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="section-label mt-5">여행 스타일 (복수 선택)</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {STYLES.map((s) => (
            <button
              key={s}
              className={`chip ${form.style.includes(s) ? 'chip-on' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_STYLE', value: s })}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="section-label mt-5">여행 페이스</div>
        <div className="mt-2 flex gap-2">
          {(['tight', 'normal', 'relaxed'] as Pace[]).map((p) => (
            <button
              key={p}
              className={`flex-1 rounded-xl px-2 py-3 text-xs font-bold text-center border ${
                form.pace === p ? 'border-accent bg-accent text-white' : 'border-border bg-white text-ink'
              }`}
              onClick={() => dispatch({ type: 'SELECT_PACE', value: p })}
            >
              {PACE_LABELS[p]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">{PACE_DESC[form.pace]}</p>

        <button
          className="mt-7 w-full bg-accent text-white rounded-2xl py-4 text-base font-extrabold"
          onClick={() => dispatch({ type: 'GENERATE' })}
        >
          AI 일정 만들기
        </button>
      </div>
    </div>
  );
}
