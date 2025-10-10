import { NextRequest, NextResponse } from 'next/server';
import { discord } from '@/lib/discordService';
import { Song } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { song, isPlaying, currentTime, duration } = await request.json() as {
      song: Song;
      isPlaying: boolean;
      currentTime: number;
      duration: number;
    };

    if (isPlaying) {
      discord.updatePlaying(song.title, song.artist, song.beatmapSetID, currentTime, duration);
    } else {
      discord.updatePaused(song.title, song.artist, song.beatmapSetID);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
