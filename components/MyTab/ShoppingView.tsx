'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { fmtWon } from '@/lib/mockData';

export default function ShoppingView({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const checked = state.shoppingList.filter((i) => i.checked).length;

  return (
    <div>
      <div className="font-heading font-bold text-[17px]">쇼핑 리스트</div>
      <div className="mt-1 text-[13px] text-ink-soft">
        {state.shoppingList.length === 0 ? '직접 추가해서 나만의 쇼핑 리스트를 만들어보세요' : `${checked}/${state.shoppingList.length} 체크됨`}
      </div>

      <div className="mt-2.5 flex flex-col gap-2">
        {state.shoppingList.length === 0 ? (
          <div className="card px-3.5 py-3 text-[13px] text-ink-soft leading-relaxed">
            아직 추가된 아이템이 없어요. 아래 폼으로 사고 싶은 것들을 직접 추가해보세요.
          </div>
        ) : (
          state.shoppingList.map((i) => (
            <div key={i.id} className="flex items-start gap-2.5 w-full card px-3.5 py-3">
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SHOPPING', id: i.id })}
                className="w-5 h-5 rounded-[6px] shrink-0 flex items-center justify-center text-xs font-extrabold text-white mt-0.5"
                style={{ background: i.checked ? '#C1502E' : '#E8DFD4' }}
              >
                {i.checked ? '✓' : ''}
              </button>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_SHOPPING', id: i.id })}
                className="flex-1 min-w-0 text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-bold ${i.checked ? 'text-ink-disabled line-through' : ''}`}>{i.name}</span>
                  {i.price > 0 && <span className="text-xs font-extrabold text-accent shrink-0">{fmtWon(i.price)}</span>}
                </div>
                {(i.category || i.note) && (
                  <div className="mt-0.5 text-[11px] text-ink-soft">
                    {i.category}{i.category && i.note ? ' · ' : ''}{i.note}
                  </div>
                )}
              </button>
              <button
                onClick={() => dispatch({ type: 'DELETE_SHOPPING_ITEM', id: i.id })}
                className="text-ink-disabled text-[15px] leading-none px-1 shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      <div className="mt-3.5 card p-3.5">
        <div className="text-[13px] font-bold mb-2.5">직접 추가하기</div>
        <div className="flex gap-2">
          <input
            className="flex-[1.4] border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
            placeholder="아이템 이름"
            value={state.shoppingForm.name}
            onChange={(e) => dispatch({ type: 'SET_SHOPPING_FIELD', field: 'name', value: e.target.value })}
          />
          <input
            className="flex-1 border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
            placeholder="가격(원, 선택)"
            value={state.shoppingForm.price}
            onChange={(e) => dispatch({ type: 'SET_SHOPPING_FIELD', field: 'price', value: e.target.value })}
          />
        </div>
        <input
          className="mt-2 w-full border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="어디서 파나요? (선택, 예: 시장, 편의점)"
          value={state.shoppingForm.category}
          onChange={(e) => dispatch({ type: 'SET_SHOPPING_FIELD', field: 'category', value: e.target.value })}
        />
        <input
          className="mt-2 w-full border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
          placeholder="메모 (선택)"
          value={state.shoppingForm.note}
          onChange={(e) => dispatch({ type: 'SET_SHOPPING_FIELD', field: 'note', value: e.target.value })}
        />
        <button
          onClick={() => dispatch({ type: 'ADD_SHOPPING_ITEM' })}
          className="mt-2.5 w-full bg-accent text-white rounded-[10px] py-2.5 text-[13px] font-bold"
        >
          + 추가
        </button>
      </div>
    </div>
  );
}