import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  try {
    console.warn('[API] /api/connect called - DiscordService auto-connects on init');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] /api/connect error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
