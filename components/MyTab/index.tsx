'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import type { DayPlan } from '@/lib/types';
import { MY_MENU } from '@/lib/mockData';
import InfoView from './InfoView';
import ShoppingView from './ShoppingView';
import RecordView from './RecordView';
import ShareView from './ShareView';

export default function MyTab({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  if (!state.myViewKey) {
    return (
      <div className="flex-1 overflow-auto px-5 pt-1 pb-6">
        <div className="flex flex-col gap-2">
          {MY_MENU.map((m) => (
            <button
              key={m.key}
              onClick={() => dispatch({ type: 'OPEN_MY_VIEW', value: m.key })}
              className="text-left w-full card p-4"
            >
              <div className="text-[15px] font-extrabold">{m.label}</div>
              <div className="mt-0.5 text-xs text-ink-soft">{m.sub}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto px-5 pt-1 pb-6">
      <button onClick={() => dispatch({ type: 'MY_BACK' })} className="text-[13px] text-ink-soft mb-3">
        ‹ MY로 돌아가기
      </button>
      {state.myViewKey === 'info' && <InfoView state={state} dispatch={dispatch} />}
      {state.myViewKey === 'shopping' && <ShoppingView state={state} dispatch={dispatch} />}
      {state.myViewKey === 'record' && <RecordView state={state} dispatch={dispatch} />}
      {state.myViewKey === 'share' && <ShareView state={state} days={days} dispatch={dispatch} />}
    </div>
  );
}
