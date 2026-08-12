import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 여행 플래너',
  description: '목적지·일정·동행 유형을 입력하면 AI가 일자별 코스와 동선을 짜드립니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitter:wght@500;600;700&family=Nunito+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body bg-canvas">{children}</body>
    </html>
  );
}