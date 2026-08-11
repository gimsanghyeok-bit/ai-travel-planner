# AI 여행 플래너

`design_handoff_ai_travel_planner` 디자인 핸드오프를 기반으로 만든 Next.js 14(App Router) + TypeScript + Tailwind 프로젝트입니다. VS Code에서 열어 바로 개발을 이어갈 수 있는 구조입니다.

## 폴더 구조
```
app/                        # Next.js App Router
  page.tsx                  # 진입점 (TravelPlannerApp 렌더)
  layout.tsx                # 폰트(Bitter/Nunito Sans) 로드
  globals.css                # Tailwind 지시문 + 공용 클래스
  api/
    generate-itinerary/     # Claude API로 일정 생성
    optimize-route/         # Google Distance Matrix + 2-opt 동선 최적화
    export-notion/          # 노션 페이지 생성

components/
  TravelPlannerApp.tsx      # 최상위 상태(useReducer) + 화면 라우팅
  OnboardingScreen.tsx
  HomeTab.tsx / ItineraryTab.tsx / BookingTab.tsx / BudgetTab.tsx
  MyTab/                     # 여행정보 · 쇼핑 · 기록 · 공유 서브뷰

lib/
  reducer.ts                 # 전역 상태와 액션 (state 변경 로직 전부 여기에)
  mockData.ts                 # 오사카 목업 데이터 (Claude 응답으로 교체 예정)
  routeOptimizer.ts            # 동선 최적화 알고리즘
  types.ts / exportUtils.ts

db/supabase_schema.sql       # 1차 범위 DB 스키마
docs/                          # 원본 핸드오프 문서(claude_prompt.md 등) 보관
```

## 1. VS Code에서 열기
1. 이 폴더를 통째로 로컬 디스크에 압축 해제합니다.
2. VS Code에서 `File > Open Folder...`로 `ai-travel-planner` 폴더를 엽니다.
3. 처음 열면 우측 하단에 "권장 확장 설치" 알림이 뜹니다 — Tailwind CSS IntelliSense, ESLint, Prettier가 포함되어 있으니 설치해두면 편합니다 (`.vscode/extensions.json`에 정의됨).

## 2. 실행하기
VS Code 하단의 **터미널(Terminal > New Terminal)**을 열고 순서대로:

```bash
# 1) 의존성 설치 (최초 1회, Node.js 18+ 필요)
npm install

# 2) 환경 변수 파일 생성 후 API 키 채우기
cp .env.example .env.local
# .env.local을 열어 ANTHROPIC_API_KEY 등 값을 입력 (지금 당장은 비워둬도 화면은 목업 데이터로 동작합니다)

# 3) 개발 서버 실행
npm run dev
```
브라우저에서 `http://localhost:3000` 접속하면 앱이 보입니다. 코드를 수정하면 자동으로 새로고침됩니다(HMR).

**주의**: 지금은 화면이 `lib/mockData.ts`의 오사카 목업 데이터로 동작합니다. `app/api/generate-itinerary`를 실제로 호출해 받아온 데이터로 교체하려면, `TravelPlannerApp.tsx`의 `GENERATE` 액션 발생 시점에 이 API를 fetch하고 응답을 `days`에 매핑하는 로직을 추가하면 됩니다.

## 3. Git으로 버전 관리하기
이 프로젝트는 이미 로컬 Git 저장소로 초기화되어 있고(`git log`로 확인 가능), 첫 커밋도 되어 있습니다. 이어서 작업하는 방법:

```bash
# 현재 상태 확인
git status
git log --oneline

# 코드를 수정한 뒤 변경사항 커밋
git add .
git commit -m "작업 내용 설명"
```

### GitHub 등 원격 저장소에 올리기
1. GitHub에서 새 빈 저장소를 만듭니다 (README/gitignore 없이 "Create repository"만).
2. 터미널에서:
```bash
git remote add origin https://github.com/<your-id>/ai-travel-planner.git
git branch -M main
git push -u origin main
```
3. 이후에는 `git add . && git commit -m "..." && git push`만 반복하면 됩니다.

### VS Code에서 Git을 마우스로 다루기
- 왼쪽 사이드바의 **Source Control(가지 모양 아이콘, 단축키 Ctrl+Shift+G)**을 클릭하면 변경된 파일 목록이 보입니다.
- 파일 옆 `+`를 눌러 스테이징 → 상단 입력창에 커밋 메시지 입력 → 체크(✓) 버튼으로 커밋.
- 우측 하단 `Publish Branch` 또는 `Sync Changes` 버튼으로 GitHub에 push할 수 있습니다(최초 1회 GitHub 로그인 필요).

### 브랜치를 나눠 작업하고 싶다면
```bash
git checkout -b feature/booking-api-연동   # 새 브랜치 생성 + 이동
# 작업 후
git add . && git commit -m "예약 탭 실 API 연동"
git push -u origin feature/booking-api-연동
# GitHub에서 Pull Request 생성 → main에 merge
```

## 4. 실제 서비스로 확장하려면 (우선순위 순)
1. **일정 생성 연동**: `TravelPlannerApp.tsx`에서 `GENERATE` 시 `/api/generate-itinerary`를 호출하도록 교체 (`ANTHROPIC_API_KEY` 필요).
2. **Supabase 연결**: `db/supabase_schema.sql`을 Supabase 프로젝트에 실행하고, `@supabase/supabase-js` 클라이언트로 trips/expenses/checklist_items 등을 실제로 저장.
3. **지도 연동**: `ItineraryTab.tsx`의 지도 placeholder를 Google Maps/Mapbox 컴포넌트로 교체, `app/api/optimize-route`로 실제 좌표 기반 동선 재계산.
4. **날씨 연동**: OpenWeatherMap으로 `weatherSummary`/`weatherAlert`를 실측치로 덮어쓰기 (모델 환각 방지).
5. **공유 연동**: `lib/exportUtils.ts`의 Notion/Kakao 부분을 실제 Notion Integration Token, Kakao JS SDK로 교체.

## 5. 배포하기 (선택)
가장 쉬운 방법은 Vercel입니다:
1. GitHub에 push한 저장소를 https://vercel.com 에서 Import.
2. Environment Variables에 `.env.local`과 동일한 키/값을 등록.
3. Deploy — 이후 GitHub에 push할 때마다 자동 재배포됩니다.
