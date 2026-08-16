'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { COMPANIONS, PACE_DESC, PACE_LABELS, STYLES } from '@/lib/mockData';
import { mapClaudeBookings, mapClaudeExtraBudget, mapClaudeResponseToDays, mapNextTripRecommendations, mapShoppingRecommendations } from '@/lib/mapClaudeResponse';
import type { Pace } from '@/lib/types';

export default function OnboardingScreen({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const { form } = state;

  async function handleGenerate() {
    dispatch({ type: 'GENERATE_START' });
    try {
      const res = await fetch('/api/generate-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: form.destination,
          nights: form.nights,
          days: form.days,
          companionType: form.companion,
          styles: form.style,
          pace: form.pace,
          startDate: form.startDate,
          travelerCount: form.travelerCount,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const issueText = Array.isArray(data?.issues)
          ? data.issues.slice(0, 3).map((i: any) => `${i.path.join('.')}: ${i.message}`).join(' / ')
          : '';
        throw new Error(issueText ? `${data?.error} — ${issueText}` : (data?.error ?? `요청 실패 (${res.status})`));
      }
      const days = mapClaudeResponseToDays(data, form.startDate, form.days);
      const bookings = mapClaudeBookings(data);
      const extraBudget = mapClaudeExtraBudget(data);
      const shoppingList = mapShoppingRecommendations(data);
      const nextTripRecs = mapNextTripRecommendations(data);
      dispatch({ type: 'GENERATE_SUCCESS', days, bookings, extraBudget, shoppingList, nextTripRecs });
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      dispatch({ type: 'GENERATE_FAIL', message: `AI 일정 생성에 실패했습니다: ${message}` });
    }
  }

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

        <div className="section-label mt-5">출발일</div>
        <input
          type="date"
          className="mt-2 w-full border border-border rounded-xl px-3.5 py-3.5 text-base bg-white"
          value={form.startDate}
          min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => dispatch({ type: 'SET_START_DATE', value: e.target.value })}
        />
        <p className="mt-1.5 text-[11px] text-ink-soft">일정에 표시되는 날짜는 이 출발일을 기준으로 자동 계산돼요.</p>

        <div className="section-label mt-5">인원</div>
        <div className="mt-2 flex items-center justify-between border border-border rounded-xl px-3.5 py-2.5 bg-white">
          <span className="text-base font-bold">{form.travelerCount}명</span>
          <div className="flex gap-2">
            <button
              className="w-8 h-8 rounded-lg border border-border bg-bg text-base"
              onClick={() => dispatch({ type: 'TRAVELER_MINUS' })}
            >
              −
            </button>
            <button
              className="w-8 h-8 rounded-lg border border-border bg-bg text-base"
              onClick={() => dispatch({ type: 'TRAVELER_PLUS' })}
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-1.5 text-[11px] text-ink-soft">예약 탭의 항공권·숙소·렌터카 가격은 이 인원 기준으로 계산돼요.</p>

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
              className={`flex-1 rounded-xl px-2 py-3 text-xs font-bold text-center border break-keep leading-snug ${
                form.pace === p ? 'border-accent bg-accent text-white' : 'border-border bg-white text-ink'
              }`}
              onClick={() => dispatch({ type: 'SELECT_PACE', value: p })}
            >
              {PACE_LABELS[p]}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">{PACE_DESC[form.pace]}</p>

        {state.generateError && (
          <div className="mt-4 bg-warn-bg text-warn rounded-xl px-3.5 py-3 text-[13px] leading-relaxed">
            {state.generateError}
          </div>
        )}

        <button
          className="mt-7 w-full bg-accent text-white rounded-2xl py-4 text-base font-extrabold disabled:opacity-60"
          onClick={handleGenerate}
          disabled={state.isGenerating}
        >
          {state.isGenerating ? 'AI가 일정을 만드는 중... (최대 1분)' : 'AI 일정 만들기'}
        </button>
      </div>
    </div>
  );
}