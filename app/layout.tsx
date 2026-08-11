import type { Metadata } from 'next';
import { Bitter, Nunito_Sans } from 'next/font/google';
import './globals.css';

const bitter = Bitter({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-bitter' });
const nunito = Nunito_Sans({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito' });

export const metadata: Metadata = {
  title: 'AI 여행 플래너',
  description: '목적지·일정·동행 유형을 입력하면 AI가 일자별 코스와 동선을 짜드립니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${bitter.variable} ${nunito.variable} font-body bg-canvas`}>{children}</body>
    </html>
  );
}
