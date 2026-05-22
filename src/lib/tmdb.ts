const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

function apiKey() {
    const key = process.env.TMDB_API_KEY;
    if (!key) throw new Error("TMDB_API_KEY is not set");
    return key;
}

export interface TmdbMovie {
    id: number;
    title: string;
    overview: string;
    poster_path: string | null;
    release_date: string;
    vote_average: number;
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
    const res = await fetch(
        `${TMDB_BASE}/search/movie?query=${encodeURIComponent(query)}&api_key=${apiKey()}&language=fr-FR&page=1`,
        { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

export async function getRecommendations(tmdbId: number): Promise<TmdbMovie[]> {
    const res = await fetch(
        `${TMDB_BASE}/movie/${tmdbId}/recommendations?api_key=${apiKey()}&language=fr-FR&page=1`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovie | null> {
    const res = await fetch(
        `${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey()}&language=fr-FR`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
}

export async function getInitialStack(watchlistIds: number[], seenIds: Set<number>): Promise<TmdbMovie[]> {
    const allRecs = await Promise.all(watchlistIds.map(getRecommendations));
    const seen = new Set(seenIds);
    const deduped: TmdbMovie[] = [];

    for (const batch of allRecs) {
        for (const movie of batch) {
            if (!seen.has(movie.id) && movie.poster_path) {
                seen.add(movie.id);
                deduped.push(movie);
            }
        }
    }

    return deduped.slice(0, 20);
}
