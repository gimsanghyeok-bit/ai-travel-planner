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
  const html2canvas = (await import('html2canvas')).default;

  // jsPDF 기본 폰트(Helvetica 등)는 한글을 지원하지 않아 그대로 쓰면 텍스트가 깨진다.
  // 한글 폰트 파일을 통째로 심는 대신, 브라우저가 실제로 그린 한글 화면을 이미지로
  // 캡처해서 PDF 페이지에 붙여넣는 방식(html2canvas)으로 우회한다.
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-99999px';
  container.style.left = '0';
  container.style.width = '800px';
  container.style.padding = '32px';
  container.style.background = '#FFFFFF';
  container.style.color = '#2B2420';
  container.style.fontFamily = "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif";

  const daysHtml = trip.days_.map((d) => `
    <div style="margin-top:18px;">
      <div style="font-size:16px;font-weight:700;border-bottom:2px solid #C1502E;padding-bottom:4px;margin-bottom:8px;">${d.label}</div>
      ${d.places.map((p) => `
        <div style="font-size:13px;padding:4px 0;display:flex;gap:10px;">
          <span style="color:#C1502E;font-weight:700;min-width:48px;">${p.time}</span>
          <span>${p.name}</span>
        </div>
      `).join('')}
    </div>
  `).join('');

  container.innerHTML = `
    <div style="font-size:24px;font-weight:800;">${trip.destination} ${trip.nights}박 ${trip.days}일</div>
    <div style="font-size:13px;color:#7A6F65;margin-top:6px;">${trip.companionLabel} · 총 ${trip.totalPlaces}개 장소 · 예상 예산 ${trip.budgetTotal.toLocaleString('ko-KR')}원</div>
    ${daysHtml}
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#FFFFFF' });
    document.body.removeChild(container);

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const pageHeightPx = Math.floor(canvas.width * (pdfHeight / pdfWidth));

    // 캡처한 이미지가 한 페이지보다 길면, 페이지 높이만큼씩 잘라서 여러 페이지로 나눠 붙인다.
    let renderedHeight = 0;
    let pageIndex = 0;
    while (renderedHeight < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - renderedHeight);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      const ctx = pageCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, renderedHeight, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const pageImgData = pageCanvas.toDataURL('image/png');
      if (pageIndex > 0) doc.addPage();
      const sliceImgHeight = sliceHeight * (imgWidth / canvas.width);
      doc.addImage(pageImgData, 'PNG', 0, 0, imgWidth, sliceImgHeight);
      renderedHeight += sliceHeight;
      pageIndex++;
    }

    const filename = `${trip.destination}_${trip.nights}박${trip.days}일.pdf`;

    // 모바일(특히 카카오톡/인스타그램 등 인앱 브라우저)에서는 강제 다운로드(doc.save)가
    // 막히거나 무한 "다운로드중" 상태에 빠지는 경우가 많다.
    // 새 탭에서 PDF를 직접 열어, 사용자가 뷰어 안의 공유/저장 버튼으로 저장하게 하는 방식이 훨씬 안정적이다.
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl as unknown as string, '_blank');
    } else {
      doc.save(filename);
    }
  } catch (err) {
    if (document.body.contains(container)) document.body.removeChild(container);
    throw err;
  }
}

// Notion — 실제 연동 시 서버 API(app/api/export-notion)를 호출한다.
export async function exportToNotion(tripId: string): Promise<{ url: string }> {
  const res = await fetch(`/api/export-notion`, { method: 'POST', body: JSON.stringify({ tripId }) });
  return res.json();
}

// 카카오톡 공유 — Kakao JS SDK(Kakao.Share.sendDefault) 사용.
// 현재 UI에서는 호출하지 않음 (버튼 비활성화 상태). 실제 연동 시 카카오 개발자센터에서
// 앱 등록 + JS 키 발급 + 플랫폼(웹) 도메인 등록 후, layout.tsx에 SDK 스크립트를 추가하고
// ShareView.tsx에서 이 함수를 다시 연결하면 된다.
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