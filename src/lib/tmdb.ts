const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";
export const TMDB_BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const RECOMMENDATION_PAGES = [1, 2];
const MAX_POSITIVE_SEEDS = 12;
const MAX_NEGATIVE_SEEDS = 10;
const MAX_DISCOVER_GENRES = 3;

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
    genre_ids?: number[];
    popularity?: number;
}

export interface TmdbMovieDetails extends TmdbMovie {
    genres?: Array<{ id: number; name: string }>;
    backdrop_path?: string | null;
    tagline?: string;
    runtime?: number;
    vote_count?: number;
    original_title?: string;
    original_language?: string;
    status?: string;
    budget?: number;
    revenue?: number;
    homepage?: string | null;
    imdb_id?: string | null;
    belongs_to_collection?: {
        id: number;
        name: string;
        poster_path: string | null;
        backdrop_path: string | null;
    } | null;
    production_companies?: Array<{
        id: number;
        name: string;
        logo_path: string | null;
        origin_country: string;
    }>;
    spoken_languages?: Array<{ english_name: string; iso_639_1: string; name: string }>;
    origin_country?: string[];
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

export async function getRecommendations(tmdbId: number, page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
        `${TMDB_BASE}/movie/${tmdbId}/recommendations?api_key=${apiKey()}&language=fr-FR&page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

export async function getMovieDetails(tmdbId: number): Promise<TmdbMovieDetails | null> {
    const res = await fetch(
        `${TMDB_BASE}/movie/${tmdbId}?api_key=${apiKey()}&language=fr-FR`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    return res.json();
}

export async function getPopularMovies(page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
        `${TMDB_BASE}/movie/popular?api_key=${apiKey()}&language=fr-FR&page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

async function discoverMoviesByGenre(genreId: number, page = 1): Promise<TmdbMovie[]> {
    const res = await fetch(
        `${TMDB_BASE}/discover/movie?api_key=${apiKey()}&language=fr-FR&sort_by=popularity.desc&include_adult=false&vote_count.gte=50&with_genres=${genreId}&page=${page}`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.results ?? [];
}

type RecommendationOptions = {
    limit?: number;
    dislikedSeedIds?: number[];
};

type RecommendationCandidate = {
    movie: TmdbMovie;
    baseScore: number;
};

type GenreAwareMovie = TmdbMovie & {
    genres?: Array<{ id: number; name: string }>;
};

function extractGenreIds(movie: GenreAwareMovie | null | undefined): number[] {
    if (!movie) return [];
    if (movie.genre_ids && movie.genre_ids.length > 0) {
        return movie.genre_ids.filter((genreId) => genreId > 0);
    }
    if (movie.genres && movie.genres.length > 0) {
        return movie.genres
            .map((genre: { id: number }) => genre.id)
            .filter((genreId: number) => genreId > 0);
    }
    return [];
}

function buildGenreScoreMap(movies: Array<TmdbMovieDetails | null>) {
    const scores = new Map<number, number>();

    for (const movie of movies) {
        for (const genreId of extractGenreIds(movie)) {
            scores.set(genreId, (scores.get(genreId) ?? 0) + 1);
        }
    }

    return scores;
}

function getGenreAffinity(
    genreIds: number[],
    positiveGenreScores: Map<number, number>,
    negativeGenreScores: Map<number, number>
) {
    return genreIds.reduce(
        (total: number, genreId: number) =>
            total +
            (positiveGenreScores.get(genreId) ?? 0) * 1.4 -
            (negativeGenreScores.get(genreId) ?? 0) * 1.8,
        0
    );
}

function selectDiverseMovies(candidates: RecommendationCandidate[], limit: number) {
    const remaining = [...candidates];
    const selected: TmdbMovie[] = [];
    const genreUsage = new Map<number, number>();

    while (selected.length < limit && remaining.length > 0) {
        let bestIndex = 0;
        let bestScore = -Infinity;

        for (let index = 0; index < remaining.length; index += 1) {
            const candidate = remaining[index];
            const genreIds = extractGenreIds(candidate.movie);
            const diversityPenalty = genreIds.reduce(
                (total: number, genreId: number) => total + (genreUsage.get(genreId) ?? 0),
                0
            );
            const dynamicScore = candidate.baseScore - diversityPenalty * 1.35;

            if (dynamicScore > bestScore) {
                bestScore = dynamicScore;
                bestIndex = index;
            }
        }

        const [winner] = remaining.splice(bestIndex, 1);
        selected.push(winner.movie);

        for (const genreId of extractGenreIds(winner.movie)) {
            genreUsage.set(genreId, (genreUsage.get(genreId) ?? 0) + 1);
        }
    }

    return selected;
}

export async function getRecommendationStack(
    seedIds: number[],
    seenIds: Set<number>,
    options: RecommendationOptions = {}
): Promise<TmdbMovie[]> {
    const limit = options.limit ?? 20;
    const uniqueSeedIds = [...new Set(seedIds)].filter((id) => id > 0).slice(0, MAX_POSITIVE_SEEDS);
    const uniqueDislikedSeedIds = [...new Set(options.dislikedSeedIds ?? [])]
        .filter((id) => id > 0)
        .slice(0, MAX_NEGATIVE_SEEDS);

    if (uniqueSeedIds.length === 0) {
        return [];
    }

    const [positiveSeedDetails, dislikedSeedDetails, directRecommendationBatches] =
        await Promise.all([
            Promise.all(uniqueSeedIds.map(getMovieDetails)),
            Promise.all(uniqueDislikedSeedIds.map(getMovieDetails)),
            Promise.all(
                uniqueSeedIds.flatMap((seedId) =>
                    RECOMMENDATION_PAGES.map((page) => getRecommendations(seedId, page))
                )
            ),
        ]);

    const positiveGenreScores = buildGenreScoreMap(positiveSeedDetails);
    const negativeGenreScores = buildGenreScoreMap(dislikedSeedDetails);
    const topPositiveGenres = [...positiveGenreScores.entries()]
        .map(([genreId, score]) => ({
            genreId,
            score: score - (negativeGenreScores.get(genreId) ?? 0) * 0.8,
        }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_DISCOVER_GENRES)
        .map((entry) => entry.genreId);

    const [discoverBatches, popularMovies] = await Promise.all([
        Promise.all(topPositiveGenres.map((genreId) => discoverMoviesByGenre(genreId))),
        getPopularMovies(),
    ]);

    const seen = new Set(seenIds);
    const candidateMap = new Map<number, RecommendationCandidate>();

    const registerCandidates = (movies: TmdbMovie[], sourceBonus: number) => {
        for (const movie of movies) {
            if (!movie.poster_path || seen.has(movie.id)) {
                continue;
            }

            const genreIds = extractGenreIds(movie);
            const positiveScore = genreIds.reduce(
                (total: number, genreId: number) => total + (positiveGenreScores.get(genreId) ?? 0),
                0
            );
            const negativeScore = genreIds.reduce(
                (total: number, genreId: number) => total + (negativeGenreScores.get(genreId) ?? 0),
                0
            );

            if (negativeScore > positiveScore + 1) {
                continue;
            }

            const affinityScore = getGenreAffinity(
                genreIds,
                positiveGenreScores,
                negativeGenreScores
            );
            const baseScore =
                sourceBonus +
                affinityScore +
                (movie.vote_average || 0) / 2 +
                Math.min((movie.popularity ?? 0) / 40, 2.5);

            const existing = candidateMap.get(movie.id);
            if (!existing || baseScore > existing.baseScore) {
                candidateMap.set(movie.id, {
                    movie,
                    baseScore,
                });
            }
        }
    };

    for (const batch of directRecommendationBatches) {
        registerCandidates(batch, 3);
    }

    for (const batch of discoverBatches) {
        registerCandidates(batch, 1.8);
    }

    registerCandidates(popularMovies, 0.8);

    return selectDiverseMovies([...candidateMap.values()], limit);
}

export async function getInitialStack(
    seedIds: number[],
    seenIds: Set<number>,
    dislikedSeedIds: number[] = []
): Promise<TmdbMovie[]> {
    return getRecommendationStack(seedIds, seenIds, {
        limit: 20,
        dislikedSeedIds,
    });
}


export async function getTrailer(tmdbId: number): Promise<string | null> {
    const res = await fetch(
        `${TMDB_BASE}/movie/${tmdbId}/videos?api_key=${apiKey()}&language=fr-FR`,
        { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const trailer = data.results.find((video: any) => video.type === "Trailer" && video.site === "YouTube");
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}