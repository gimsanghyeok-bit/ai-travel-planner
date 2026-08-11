'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { ESSENTIALS, fmtWon, TRANSIT_PASSES } from '@/lib/mockData';

export default function InfoView({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const done = state.checklist.filter((c) => c.checked).length;
  const krwNum = parseInt(String(state.currencyKrw).replace(/[^0-9]/g, ''), 10) || 0;
  const jpy = Math.round(krwNum / 9.3).toLocaleString('ko-KR') + '엔';

  return (
    <div>
      <div className="font-heading font-bold text-[17px]">여행 준비 체크리스트</div>
      <div className="mt-1 text-[13px] text-ink-soft">{done}/{state.checklist.length} 완료</div>
      <div className="mt-2.5 flex flex-col gap-2">
        {state.checklist.map((c) => (
          <button
            key={c.id}
            onClick={() => dispatch({ type: 'TOGGLE_CHECKLIST', id: c.id })}
            className="flex items-center gap-2.5 w-full text-left card px-3.5 py-3"
          >
            <div
              className="w-5 h-5 rounded-[6px] shrink-0 flex items-center justify-center text-xs font-extrabold text-white"
              style={{ background: c.checked ? '#C1502E' : '#E8DFD4' }}
            >
              {c.checked ? '✓' : ''}
            </div>
            <span className={`text-sm ${c.checked ? 'text-ink-disabled line-through' : ''}`}>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="font-heading font-bold text-[15px] mt-[26px]">환율 계산기</div>
      <div className="section-label mt-2.5">원화 (KRW)</div>
      <input
        className="mt-1.5 w-full border border-border rounded-xl px-3.5 py-3.5 text-base"
        placeholder="예: 100000"
        value={state.currencyKrw}
        onChange={(e) => dispatch({ type: 'SET_CURRENCY', value: e.target.value })}
      />
      <div className="mt-2.5 bg-section rounded-xl p-3.5 flex items-center justify-between">
        <span className="text-[13px] text-ink-soft">일본 엔 (JPY) 환산</span>
        <span className="text-lg font-extrabold">{jpy}</span>
      </div>
      <p className="mt-2.5 text-xs text-[#574F47] leading-relaxed">
        소규모 식당·시장은 카드 결제가 안 되는 곳이 많아 현금 30~40%, 카드 60~70% 비중을 권장합니다.
      </p>

      <div className="font-heading font-bold text-[15px] mt-[26px]">필수 앱 · 교통카드</div>
      <div className="mt-2.5 flex flex-col gap-2">
        {ESSENTIALS.map((e) => (
          <div key={e.name} className="card px-3.5 py-3">
            <div className="text-sm font-bold">{e.name}</div>
            <div className="mt-0.5 text-xs text-ink-soft">{e.desc}</div>
          </div>
        ))}
      </div>

      <div className="font-heading font-bold text-[15px] mt-[26px]">현지 교통패스 정보</div>
      <div className="mt-2.5 flex flex-col gap-2">
        {TRANSIT_PASSES.map((p) => (
          <div key={p.name} className="card px-3.5 py-3">
            <div className="flex justify-between gap-2">
              <span className="text-sm font-bold">{p.name}</span>
              <span className="text-[13px] font-extrabold text-accent">{fmtWon(p.price)}</span>
            </div>
            <div className="mt-0.5 text-xs text-ink-soft">{p.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
