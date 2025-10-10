import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const filePath = request.nextUrl.searchParams.get('path');
    if (!filePath) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    return new NextResponse(fileStream as unknown as ReadableStream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
