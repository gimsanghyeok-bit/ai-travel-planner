import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const NOTION_PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID!;

export async function POST(req: NextRequest) {
  try {
    const { trip } = (await req.json()) as {
      trip: { title: string; days: { label: string; places: { time: string; name: string }[] }[] };
    };

    const children: any[] = [];
    for (const day of trip.days) {
      children.push({
        object: 'block', type: 'heading_2',
        heading_2: { rich_text: [{ text: { content: day.label } }] },
      });
      for (const place of day.places) {
        children.push({
          object: 'block', type: 'to_do',
          to_do: { rich_text: [{ text: { content: `${place.time} ${place.name}` } }], checked: false },
        });
      }
    }

    const page = await notion.pages.create({
      parent: { page_id: NOTION_PARENT_PAGE_ID },
      properties: { title: { title: [{ text: { content: trip.title } }] } },
      children,
    });

    return NextResponse.json({ url: (page as any).url }, { status: 200 });
  } catch (err) {
    console.error('export-notion error:', err);
    return NextResponse.json({ error: '노션 내보내기 실패' }, { status: 500 });
  }
}
