export interface CurrencyInfo {
  code: string;
  name: string;
  krwToUnit: number; // 1원을 이 통화로 환산했을 때의 값 (근사치)
  decimals: number;  // 표시할 소수점 자리수
}

// 목적지 텍스트에 포함된 도시/국가명 키워드로 통화를 추정한다.
// 실시간 환율 API가 아니라 근사치 상수이므로, 화면에는 항상 "추정치" 문구를 함께 보여준다.
const CURRENCY_TABLE: { keywords: string[]; info: CurrencyInfo }[] = [
  { keywords: ['오사카', '도쿄', '후쿠오카', '삿포로', '교토', '오키나와', '나고야', '요코하마', '고베', '일본'], info: { code: 'JPY', name: '일본 엔', krwToUnit: 1 / 9.3, decimals: 0 } },
  { keywords: ['다낭', '나트랑', '하노이', '호치민', '호이안', '달랏', '푸꾸옥', '베트남'], info: { code: 'VND', name: '베트남 동', krwToUnit: 18, decimals: 0 } },
  { keywords: ['방콕', '치앙마이', '푸켓', '파타야', '태국'], info: { code: 'THB', name: '태국 바트', krwToUnit: 0.026, decimals: 2 } },
  { keywords: ['발리', '자카르타', '족자카르타', '인도네시아'], info: { code: 'IDR', name: '인도네시아 루피아', krwToUnit: 11.5, decimals: 0 } },
  { keywords: ['세부', '마닐라', '보라카이', '팔라완', '필리핀'], info: { code: 'PHP', name: '필리핀 페소', krwToUnit: 0.042, decimals: 2 } },
  { keywords: ['싱가포르'], info: { code: 'SGD', name: '싱가포르 달러', krwToUnit: 0.001, decimals: 2 } },
  { keywords: ['홍콩'], info: { code: 'HKD', name: '홍콩 달러', krwToUnit: 0.0058, decimals: 2 } },
  { keywords: ['타이베이', '타이페이', '대만'], info: { code: 'TWD', name: '대만 달러', krwToUnit: 0.024, decimals: 2 } },
  { keywords: ['상하이', '베이징', '광저우', '청두', '시안', '항저우', '중국'], info: { code: 'CNY', name: '중국 위안', krwToUnit: 0.0053, decimals: 2 } },
  { keywords: ['파리', '로마', '밀라노', '바르셀로나', '마드리드', '베를린', '뮌헨', '암스테르담', '비엔나', '프라하'], info: { code: 'EUR', name: '유로', krwToUnit: 1 / 1450, decimals: 2 } },
  { keywords: ['런던', '영국'], info: { code: 'GBP', name: '영국 파운드', krwToUnit: 1 / 1700, decimals: 2 } },
  { keywords: ['시드니', '멜버른', '브리즈번', '호주'], info: { code: 'AUD', name: '호주 달러', krwToUnit: 0.00111, decimals: 2 } },
  { keywords: ['뉴욕', 'LA', '로스앤젤레스', '괌', '사이판', '하와이', '라스베가스', '샌프란시스코', '미국'], info: { code: 'USD', name: '미국 달러', krwToUnit: 1 / 1350, decimals: 2 } },
];

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', name: '미국 달러', krwToUnit: 1 / 1350, decimals: 2 };

export function guessCurrency(destination: string): CurrencyInfo {
  const d = (destination || '').trim();
  for (const row of CURRENCY_TABLE) {
    if (row.keywords.some((k) => d.includes(k))) return row.info;
  }
  return DEFAULT_CURRENCY; // 매칭되는 도시가 없으면 달러 기준으로 안내
}

export function formatCurrency(amount: number, info: CurrencyInfo): string {
  const formatted = info.decimals === 0
    ? Math.round(amount).toLocaleString('ko-KR')
    : amount.toLocaleString('ko-KR', { minimumFractionDigits: info.decimals, maximumFractionDigits: info.decimals });
  return `${formatted} ${info.code}`;
}