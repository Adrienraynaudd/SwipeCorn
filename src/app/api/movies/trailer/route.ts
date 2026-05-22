import { NextResponse } from 'next/server';
import { getTrailer } from '@/lib/tmdb';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const tmdbId = Number(url.searchParams.get('tmdbId'));

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    const trailer = await getTrailer(tmdbId);
    if (!trailer) {
      return NextResponse.json({ error: 'trailer not found' }, { status: 404 });
    }

    return NextResponse.redirect(new URL(trailer));
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
