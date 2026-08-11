# Claude API — 일정 생성 시스템 프롬프트 & API 라우트

## 시스템 프롬프트

```
당신은 여행 일정 설계 전문가입니다. 사용자가 입력한 여행 조건을 바탕으로
일자별·시간대별 코스, 숙소/항공/렌터카 추천, 인플루언서 팁을 포함한
JSON을 생성합니다.

규칙:
- 페이스(pace)에 따라 하루 장소 개수를 조정합니다: tight=5~6곳, normal=4~5곳, relaxed=2~3곳.
- 각 장소 사이 이동 수단과 예상 이동 시간을 현실적으로 추정합니다.
- 관광지/식당의 휴무일, 브레이크타임, 매표 마감 시간이 알려진 경우 breakTimeAlert에 반드시 기재합니다.
- 각 장소에 인플루언서/블로그 리뷰 기반 팁(필수메뉴, 웨이팅 팁, 할인 정보)을 요약합니다. 확실하지 않으면 빈 문자열로 둡니다.
- 아래 JSON 스키마 외의 텍스트를 출력하지 않습니다.
```

## 사용자 입력 → 응답 JSON 스키마

```json
{
  "days": [
    {
      "dayIndex": 1,
      "date": "2026-08-12",
      "weatherSummary": "맑음 32°/25°",
      "weatherAlert": null,
      "breakTimeAlert": null,
      "places": [
        {
          "order": 1,
          "time": "15:00",
          "name": "string",
          "category": "sightseeing|food|shopping|healing|hotspot|transit",
          "durationLabel": "string",
          "travelMode": "string",
          "travelTimeLabel": "string",
          "tip": { "mustTryMenu": "string", "waitingTip": "string", "note": "string" }
        }
      ]
    }
  ],
  "bookings": {
    "flight": [{ "name": "string", "description": "string", "price": 0 }],
    "hotel": [{ "name": "string", "description": "string", "price": 0 }],
    "car": [{ "name": "string", "description": "string", "price": 0 }]
  },
  "budgetEstimate": { "flight": 0, "hotel": 0, "car": 0, "food": 0, "admission": 0, "localTransit": 0 }
}
```

## Next.js API 라우트 예시 (`app/api/generate-itinerary/route.ts`)

```ts
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `...위 시스템 프롬프트 전문...`;

export async function POST(req: Request) {
  const { destination, nights, days, companionType, styles, pace } = await req.json();

  const userMessage = `
목적지: ${destination}
일정: ${nights}박 ${days}일
동행 유형: ${companionType}
여행 스타일: ${styles.join(", ")}
페이스: ${pace}
`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-latest",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  const itinerary = JSON.parse(text); // 스키마 검증(zod 등) 추가 권장

  return Response.json(itinerary);
}
```

## 동선 최적화 연동 메모
- Claude가 생성한 장소 순서를 그대로 쓰지 않고, Google Maps Directions API(또는 Distance Matrix API)로 각 구간의 실제 이동 시간을 재계산해 `travelTimeLabel`을 보정한다.
- 이동 시간이 비정상적으로 길게 나오는 순서 조합은 재정렬을 제안(예: TSP 근사 알고리즘 또는 Claude에 재요청)하는 것을 고려한다.
- 날씨는 OpenWeatherMap API로 별도 조회해 `weatherAlert`를 서버에서 덮어쓰는 것을 권장(모델의 환각 방지).
