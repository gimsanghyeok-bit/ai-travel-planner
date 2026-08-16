'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { fmtWon } from '@/lib/mockData';

export default function RecordView({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const savingsTargetNum = parseInt(String(state.savingsTarget).replace(/[^0-9]/g, ''), 10) || 0;
  const monthly = fmtWon(Math.ceil(savingsTargetNum / Math.max(state.savingsMonths, 1))) + ' / 월';

  return (
    <div>
      <div className="font-heading font-bold text-[17px]">맛집 기록</div>
      <p className="mt-1 text-[13px] text-ink-soft">사진과 함께 기록해두면 나중에 추천/재방문에 참고할 수 있어요.</p>

      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {state.foodLogs.map((f) => (
          <div key={f.id} className="card overflow-hidden">
            <div className="w-full h-[100px] bg-gradient-to-br from-section to-canvas flex items-center justify-center text-[11px] text-ink-faint font-mono">
              맛집 사진
            </div>
            <div className="p-2.5">
              <div className="text-[13px] font-bold">{f.name}</div>
              <div className="mt-0.5 text-xs text-accent">{'★'.repeat(f.stars)}{'☆'.repeat(5 - f.stars)}</div>
              <div className="mt-0.5 text-[11px] text-ink-soft">{f.memo}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 card p-3.5">
        <div className="text-[13px] font-bold mb-2.5">새 기록 추가</div>
        <div className="w-full h-[120px] rounded-xl bg-gradient-to-br from-section to-canvas flex items-center justify-center text-[11px] text-ink-faint font-mono">
          맛집 사진 드롭
        </div>
        <input
          className="mt-2.5 w-full border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="가게 이름"
          value={state.foodForm.name}
          onChange={(e) => dispatch({ type: 'SET_FOOD_FIELD', field: 'name', value: e.target.value })}
        />
        <input
          className="mt-2 w-full border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="메모 (필수메뉴, 느낀점 등)"
          value={state.foodForm.memo}
          onChange={(e) => dispatch({ type: 'SET_FOOD_FIELD', field: 'memo', value: e.target.value })}
        />
        <div className="mt-2 flex gap-1.5 items-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => dispatch({ type: 'SELECT_FOOD_STARS', value: n })}
              className="text-base"
              style={{ color: n <= state.foodForm.stars ? '#C1502E' : '#E8DFD4' }}
            >
              ★
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: 'ADD_FOOD_LOG' })}
            className="ml-auto bg-accent text-white rounded-[10px] px-4 py-2.5 text-[13px] font-bold"
          >
            기록 추가
          </button>
        </div>
      </div>

      <div className="font-heading font-bold text-[15px] mt-[26px]">다음 여행 추천</div>
      <p className="mt-1 text-[11px] text-ink-soft">
        {state.form.companion} · {state.form.style.join(', ')} · {state.form.nights}박{state.form.days}일 조건을 반영한 AI 추천이에요.
      </p>
      <div className="mt-2 flex flex-col gap-2">
        {state.nextTripRecs.map((r) => (
          <div key={r.name} className="card px-3.5 py-3">
            <div className="text-sm font-bold">{r.name}</div>
            <div className="mt-0.5 text-xs text-ink-soft">{r.reason}</div>
          </div>
        ))}
      </div>

      <div className="font-heading font-bold text-[15px] mt-[18px]">다음 여행 저축 계산기</div>
      <p className="mt-1 text-[11px] text-ink-soft">기본값은 방금 만든 여행의 예상 예산으로 채워져 있어요. 직접 수정할 수 있습니다.</p>
      <div className="section-label mt-2.5">목표 예상 비용</div>
      <input
        className="mt-1.5 w-full border border-border rounded-xl px-3.5 py-3.5 text-base"
        value={state.savingsTarget}
        onChange={(e) => dispatch({ type: 'SET_SAVINGS_TARGET', value: e.target.value })}
      />
      <div className="mt-2.5 flex items-center justify-between border border-border rounded-xl px-3.5 py-2.5 bg-white">
        <span className="text-sm font-bold">{state.savingsMonths}개월 안에 모으기</span>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'SAVINGS_MONTHS_MINUS' })}
            className="w-8 h-8 rounded-lg border border-border bg-bg"
          >
            −
          </button>
          <button
            onClick={() => dispatch({ type: 'SAVINGS_MONTHS_PLUS' })}
            className="w-8 h-8 rounded-lg border border-border bg-bg"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-2.5 bg-section rounded-xl p-3.5 flex items-center justify-between">
        <span className="text-[13px] text-ink-soft">월 저축 목표액</span>
        <span className="text-lg font-extrabold">{monthly}</span>
      </div>
    </div>
  );
}