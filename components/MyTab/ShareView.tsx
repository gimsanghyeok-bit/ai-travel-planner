'use client';

import type { Dispatch } from 'react';
import type { Action, AppState } from '@/lib/reducer';
import type { DayPlan } from '@/lib/types';
import { computeBudget, fmtWon } from '@/lib/mockData';
import { buildShareText, exportToPdf } from '@/lib/exportUtils';

export default function ShareView({ state, days, dispatch }: { state: AppState; days: DayPlan[]; dispatch: Dispatch<Action> }) {
  const totalPlaces = days.reduce((a, d) => a + d.places.length, 0);
  const { total } = computeBudget(state.bookings, state.selectedFlight, state.selectedHotel, state.selectedCar, state.extraBudget);

  const trip = {
    destination: state.form.destination,
    nights: state.form.nights,
    days: state.form.days,
    companionLabel: `${state.form.companion} 여행`,
    totalPlaces,
    budgetTotal: total,
    days_: days.map((d) => ({ label: d.label, places: d.places.map((p) => ({ time: p.time, name: p.name })) })),
  };

  function handleShare(kind: 'pdf' | 'notion' | 'kakao') {
    dispatch({ type: 'SHARE', value: kind });
    if (kind === 'pdf') exportToPdf(trip);
    if (kind === 'notion') {
      // TODO: /api/export-notion 호출로 교체 (Notion Integration 연동 후)
      navigator.clipboard?.writeText(buildShareText(trip)).catch(() => {});
    }
    if (kind === 'kakao') {
      // TODO: Kakao JS SDK 로드 후 Kakao.Share.sendDefault(...)로 교체
      console.log(buildShareText(trip));
    }
  }

  return (
    <div>
      <div className="section-label">일정 내보내기</div>
      <div className="mt-2.5 flex flex-col gap-2.5">
        <button onClick={() => handleShare('pdf')} className="w-full rounded-xl py-3.5 text-sm font-bold border border-border bg-white text-left">
          PDF로 내보내기
        </button>
        <button onClick={() => handleShare('notion')} className="w-full rounded-xl py-3.5 text-sm font-bold border border-border bg-white text-left">
          노션 템플릿으로 내보내기
        </button>
        <button onClick={() => handleShare('kakao')} className="w-full rounded-xl py-3.5 text-sm font-bold border border-border bg-white text-left">
          카카오톡 공유 링크 생성
        </button>
      </div>
      {state.shareToast && (
        <div className="mt-3.5 bg-accent-soft text-warn rounded-xl px-3.5 py-3 text-[13px]">{state.shareToast}</div>
      )}
      <div className="section-label mt-6">일정 요약</div>
      <div className="mt-2 card p-3.5 text-[13px] text-[#574F47] leading-loose">
        {state.form.destination} · {state.form.nights}박 {state.form.days}일 · {state.form.companion} 여행<br />
        총 {totalPlaces}개 장소 · 항공/숙소/렌터카 포함 예상 예산 {fmtWon(total)}
      </div>
    </div>
  );
}
