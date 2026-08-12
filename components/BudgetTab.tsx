'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import { computeBudget, fmtWon } from '@/lib/mockData';

export default function BudgetTab({ state, dispatch }: { state: AppState; dispatch: Dispatch<Action> }) {
  const { budget, total } = computeBudget(state.bookings, state.selectedFlight, state.selectedHotel, state.selectedCar, state.extraBudget);
  const expenseTotal = state.expenses.reduce((a, e) => a + e.amount, 0);
  const payers = Array.from(new Set(state.expenses.map((e) => e.payer)));
  const perPerson = expenseTotal / Math.max(payers.length, 1);

  return (
    <div className="flex-1 overflow-auto px-5 pt-1 pb-6">
      <div className="section-label">예상 총 예산</div>
      <div className="font-heading font-bold text-[26px] mt-2">{fmtWon(total)}</div>
      <div className="mt-3 flex flex-col gap-2.5">
        {Object.entries(budget).map(([label, amt]) => (
          <div key={label}>
            <div className="flex justify-between text-[13px] mb-1">
              <span className="font-bold">{label}</span>
              <span className="text-ink-soft">{fmtWon(amt)}</span>
            </div>
            <div className="h-2 rounded bg-canvas overflow-hidden">
              <div className="h-full bg-accent rounded" style={{ width: `${Math.round((amt / total) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="section-label">실제 지출 내역</span>
        <span className="text-[13px] font-bold">{fmtWon(expenseTotal)}</span>
      </div>
      <div className="mt-2 flex flex-col gap-2">
        {state.expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between card px-3 py-2.5">
            <div>
              <div className="text-sm font-bold">{e.label}</div>
              <div className="text-xs text-ink-soft mt-0.5">{e.category} · {e.payer} 결제</div>
            </div>
            <div className="text-sm font-bold">{fmtWon(e.amount)}</div>
          </div>
        ))}
      </div>

      <div className="mt-3.5 card p-3.5">
        <div className="text-[13px] font-bold mb-2.5">지출 추가</div>
        <div className="flex gap-2">
          <input
            className="flex-[1.4] border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
            placeholder="항목"
            value={state.expenseForm.label}
            onChange={(e) => dispatch({ type: 'SET_EXPENSE_FIELD', field: 'label', value: e.target.value })}
          />
          <input
            className="flex-1 border border-border rounded-[10px] px-2.5 py-2.5 text-[13px]"
            placeholder="금액"
            value={state.expenseForm.amount}
            onChange={(e) => dispatch({ type: 'SET_EXPENSE_FIELD', field: 'amount', value: e.target.value })}
          />
        </div>
        <div className="flex gap-2 mt-2 items-center">
          {['민준', '서연'].map((p) => (
            <button
              key={p}
              className={`chip ${state.expenseForm.payer === p ? 'chip-on' : ''}`}
              onClick={() => dispatch({ type: 'SELECT_PAYER', value: p })}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => dispatch({ type: 'ADD_EXPENSE' })}
            className="ml-auto bg-accent text-white rounded-[10px] px-4 py-2.5 text-[13px] font-bold"
          >
            추가
          </button>
        </div>
      </div>

      <div className="section-label mt-5">{payers.length}인 정산</div>
      <div className="mt-2 flex flex-col gap-2">
        {payers.map((name) => {
          const paid = state.expenses.filter((e) => e.payer === name).reduce((a, e) => a + e.amount, 0);
          const diff = Math.round(paid - perPerson);
          const owed = diff >= 0;
          return (
            <div key={name} className="flex items-center justify-between bg-section rounded-xl px-3.5 py-3">
              <span className="text-sm font-bold">{name}</span>
              <span className={`text-[13px] font-bold ${owed ? 'text-healing' : 'text-accent'}`}>
                {owed ? `+${fmtWon(diff)} 받아야 함` : `${fmtWon(Math.abs(diff))} 보내야 함`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
