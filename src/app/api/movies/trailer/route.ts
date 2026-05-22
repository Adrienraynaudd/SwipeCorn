import { NextResponse } from 'next/server';
import { getTrailer } from '@/lib/tmdb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tmdbId = url.searchParams.get('tmdbId');
    if (!tmdbId) return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });

    const trailer = await getTrailer(Number(tmdbId));
    return NextResponse.json({ trailer });
  } catch (err) {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
