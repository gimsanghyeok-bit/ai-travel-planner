import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { buildUserMessage, GenerateItineraryInput, SYSTEM_PROMPT } from './systemPrompt';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL_ID = 'claude-sonnet-5';

const TipSchema = z.object({ mustTryMenu: z.string(), waitingTip: z.string(), note: z.string() });
const PlaceSchema = z.object({
  order: z.number(),
  time: z.string(),
  name: z.string(),
  category: z.enum(['sightseeing', 'food', 'shopping', 'healing', 'hotspot', 'transit']),
  durationLabel: z.string(),
  travelMode: z.string(),
  travelTimeLabel: z.string(),
  tip: TipSchema,
});
const DaySchema = z.object({
  dayIndex: z.number(),
  date: z.string(),
  weatherSummary: z.string(),
  weatherAlert: z.string().nullable(),
  breakTimeAlert: z.string().nullable(),
  places: z.array(PlaceSchema),
});
const BookingItemSchema = z.object({ name: z.string(), description: z.string(), price: z.number() });
const ItinerarySchema = z.object({
  days: z.array(DaySchema),
  bookings: z.object({
    flight: z.array(BookingItemSchema),
    hotel: z.array(BookingItemSchema),
    car: z.array(BookingItemSchema),
  }),
  budgetEstimate: z.object({
    flight: z.number(), hotel: z.number(), car: z.number(),
    food: z.number(), admission: z.number(), localTransit: z.number(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as GenerateItineraryInput;
    if (!body.destination || !body.days) {
      return NextResponse.json({ error: 'destination, days는 필수입니다.' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(body) }],
    });

    const rawText = message.content
      .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    const parsed = safeParseJson(rawText);
    if (!parsed) {
      return NextResponse.json({ error: 'AI 응답을 JSON으로 파싱하지 못했습니다.', raw: rawText }, { status: 502 });
    }

    const validation = ItinerarySchema.safeParse(parsed);
    if (!validation.success) {
      return NextResponse.json({ error: '스키마 불일치', issues: validation.error.issues }, { status: 502 });
    }

    return NextResponse.json(validation.data, { status: 200 });
  } catch (err) {
    console.error('generate-itinerary error:', err);
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
