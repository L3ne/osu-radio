import { NextResponse } from 'next/server';
import { scanOsuFolder } from '@/lib/scanner';

export async function POST(): Promise<NextResponse> {
  try {
    const songs = await scanOsuFolder('D:/Osu!');
    return NextResponse.json({ success: true, songs });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
