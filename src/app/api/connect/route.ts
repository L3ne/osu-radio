import { NextResponse } from 'next/server';
import { connectDiscord } from '@/lib/discord';

export async function POST(): Promise<NextResponse> {
  try {
    console.warn('[API] /api/connect called');
    await connectDiscord();
    console.warn('[API] /api/connect success');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] /api/connect error:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
