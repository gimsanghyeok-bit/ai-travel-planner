// 일정 공유/내보내기 유틸리티.
// PDF는 클라이언트에서 jsPDF로 즉시 생성. Notion/Kakao는 실제 연동 전까지 텍스트 클립보드 복사로 대체.

export type ShareTrip = {
  destination: string;
  nights: number;
  days: number;
  companionLabel: string;
  totalPlaces: number;
  budgetTotal: number;
  days_: Array<{ label: string; places: Array<{ time: string; name: string }> }>;
};

export function buildShareText(trip: ShareTrip): string {
  const lines = [
    `${trip.destination} · ${trip.nights}박 ${trip.days}일 · ${trip.companionLabel}`,
    `총 ${trip.totalPlaces}개 장소 · 예상 예산 ${trip.budgetTotal.toLocaleString('ko-KR')}원`,
    '',
    ...trip.days_.flatMap((d) => [`[${d.label}]`, ...d.places.map((p) => `  ${p.time} ${p.name}`)]),
  ];
  return lines.join('\n');
}

export async function exportToPdf(trip: ShareTrip): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 48;
  doc.setFontSize(18);
  doc.text(`${trip.destination} ${trip.nights}박 ${trip.days}일`, 40, y);
  y += 26;
  doc.setFontSize(10);
  doc.text(`${trip.companionLabel} · 총 ${trip.totalPlaces}개 장소`, 40, y);
  y += 24;

  for (const d of trip.days_) {
    if (y > 760) { doc.addPage(); y = 48; }
    doc.setFontSize(13);
    doc.text(d.label, 40, y);
    y += 18;
    doc.setFontSize(10);
    for (const p of d.places) {
      if (y > 780) { doc.addPage(); y = 48; }
      doc.text(`${p.time}  ${p.name}`, 52, y);
      y += 14;
    }
    y += 10;
  }
  doc.save(`${trip.destination}_${trip.nights}박${trip.days}일.pdf`);
}

// Notion — 실제 연동 시 서버 API(app/api/export-notion)를 호출한다.
export async function exportToNotion(tripId: string): Promise<{ url: string }> {
  const res = await fetch(`/api/export-notion`, { method: 'POST', body: JSON.stringify({ tripId }) });
  return res.json();
}

// 카카오톡 공유 — Kakao JS SDK(Kakao.Share.sendDefault) 사용.
declare global {
  interface Window {
    Kakao?: any;
  }
}
export function shareToKakao(trip: ShareTrip, shareUrl: string) {
  if (typeof window === 'undefined' || !window.Kakao?.isInitialized?.()) return;
  window.Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: `${trip.destination} ${trip.nights}박 ${trip.days}일 일정`,
      description: buildShareText(trip).slice(0, 120),
      link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
    },
  });
}
