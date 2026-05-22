import { NextResponse } from 'next/server';
import { getTrailer } from '@/lib/tmdb';
import { trailerTmdbIdSchema } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsedTmdbId = trailerTmdbIdSchema.safeParse(url.searchParams.get('tmdbId'));

    if (!parsedTmdbId.success) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    const tmdbId = parsedTmdbId.data;
    const trailer = await getTrailer(tmdbId);
    if (!trailer) {
      return NextResponse.json({ error: 'trailer not found' }, { status: 404 });
    }

    return NextResponse.redirect(new URL(trailer));
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
