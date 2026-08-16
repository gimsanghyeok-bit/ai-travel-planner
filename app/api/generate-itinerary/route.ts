import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { buildUserMessage, GenerateItineraryInput, SYSTEM_PROMPT } from './systemPrompt';

// Google AI Studio(aistudio.google.com/apikey)에서 무료로 발급받은 키를 사용한다.
// 무료 티어: 카드 등록 불필요, 일일 요청 한도 있음 (개인/데모 용도로는 충분)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const MODEL_ID = 'gemini-3.6-flash';

const TipSchema = z.object({
  mustTryMenu: z.string().optional().default(''),
  waitingTip: z.string().optional().default(''),
  note: z.string().optional().default(''),
});
const PlaceSchema = z.object({
  order: z.coerce.number(),
  time: z.string(),
  name: z.string(),
  category: z.string(),
  durationLabel: z.string().optional().default(''),
  travelMode: z.string().optional().default(''),
  travelTimeLabel: z.string().optional().default(''),
  tip: TipSchema.optional().default({ mustTryMenu: '', waitingTip: '', note: '' }),
});
const DaySchema = z.object({
  dayIndex: z.coerce.number(),
  date: z.string(),
  weatherSummary: z.string().optional().default(''),
  weatherAlert: z.string().nullable().optional().default(null),
  breakTimeAlert: z.string().nullable().optional().default(null),
  places: z.array(PlaceSchema),
});
const BookingItemSchema = z.object({ name: z.string(), description: z.string().optional().default(''), price: z.coerce.number().optional().default(0) });
const ShoppingRecSchema = z.object({ name: z.string(), note: z.string().optional().default('') });
const NextTripRecSchema = z.object({ name: z.string(), reason: z.string().optional().default('') });
const ItinerarySchema = z.object({
  days: z.array(DaySchema),
  bookings: z.object({
    flight: z.array(BookingItemSchema).optional().default([]),
    hotel: z.array(BookingItemSchema).optional().default([]),
    car: z.array(BookingItemSchema).optional().default([]),
  }).optional().default({ flight: [], hotel: [], car: [] }),
  budgetEstimate: z.object({
    flight: z.coerce.number().optional().default(0),
    hotel: z.coerce.number().optional().default(0),
    car: z.coerce.number().optional().default(0),
    food: z.coerce.number().optional().default(0),
    admission: z.coerce.number().optional().default(0),
    localTransit: z.coerce.number().optional().default(0),
  }).optional().default({ flight: 0, hotel: 0, car: 0, food: 0, admission: 0, localTransit: 0 }),
  shoppingRecommendations: z.array(ShoppingRecSchema).optional().default([]),
  nextTripRecommendations: z.array(NextTripRecSchema).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateItineraryInput;
    if (!body.destination || !body.days) {
      return NextResponse.json({ error: 'destination, days는 필수입니다.' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: MODEL_ID,
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = await generateWithRetry(model, buildUserMessage(body));

    const parsed = safeParseJson(rawText);
    if (!parsed) {
      return NextResponse.json({ error: 'AI 응답을 JSON으로 파싱하지 못했습니다.', raw: rawText }, { status: 502 });
    }

    const validation = ItinerarySchema.safeParse(parsed);
    if (!validation.success) {
      console.error('Itinerary schema validation failed:', JSON.stringify(validation.error.issues, null, 2));
      console.error('Raw AI response was:', rawText);
      return NextResponse.json({ error: '스키마 불일치', issues: validation.error.issues }, { status: 502 });
    }

    return NextResponse.json(validation.data, { status: 200 });
  } catch (err) {
    console.error('generate-itinerary error:', err);
    const status = (err as { status?: number })?.status;
    if (status === 503 || status === 429) {
      return NextResponse.json({ error: 'AI 서버가 잠시 붐비고 있어요. 몇 초 후 다시 시도해주세요.' }, { status: 503 });
    }
    return NextResponse.json({ error: '일정 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

function safeParseJson(raw: string): unknown | null {
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try { return JSON.parse(match[0]); } catch { return null; }
  }
}

// Gemini 무료 티어는 사용량이 몰리면 503(서버 과부하)을 잠깐 반환할 때가 있다.
// 사용자가 매번 직접 재시도 버튼을 누르지 않아도 되도록, 서버에서 짧게 자동 재시도한다.
async function generateWithRetry(model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>, prompt: string, maxAttempts = 3): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      lastErr = err;
      const status = (err as { status?: number })?.status;
      const isRetryable = status === 503 || status === 429;
      if (!isRetryable || attempt === maxAttempts) throw err;
      const waitMs = 1000 * attempt;
      console.warn(`Gemini 응답 실패(status ${status}), ${waitMs}ms 후 재시도 (${attempt}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  throw lastErr;
}