'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { fmtWon } from '@/lib/mockData';

export default function ShoppingView({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const checked = state.shoppingList.filter((i) => i.checked).length;

  return (
    <div>
      <div className="font-heading font-bold text-[17px]">쇼핑 리스트</div>
      <div className="mt-1 text-[13px] text-ink-soft">{checked}/{state.shoppingList.length} 체크됨 · 목적지 인기 아이템 추천</div>
      <div className="mt-2.5 flex flex-col gap-2">
        {state.shoppingList.map((i) => (
          <button
            key={i.id}
            onClick={() => dispatch({ type: 'TOGGLE_SHOPPING', id: i.id })}
            className="flex items-start gap-2.5 w-full text-left card px-3.5 py-3"
          >
            <div
              className="w-5 h-5 rounded-[6px] shrink-0 flex items-center justify-center text-xs font-extrabold text-white mt-0.5"
              style={{ background: i.checked ? '#C1502E' : '#E8DFD4' }}
            >
              {i.checked ? '✓' : ''}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-bold ${i.checked ? 'text-ink-disabled line-through' : ''}`}>{i.name}</span>
                <span className="text-xs font-extrabold text-accent shrink-0">{fmtWon(i.price)}</span>
              </div>
              <div className="mt-0.5 text-[11px] text-ink-soft">{i.category} · {i.note}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
