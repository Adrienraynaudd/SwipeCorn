import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecommendationStack } from "@/lib/tmdb";

const REFILL_BATCH_SIZE = 12;
const SEED_LIMIT = 10;

type RefillRequestBody = {
    excludeIds?: number[];
};

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    let body: RefillRequestBody = {};

    try {
        body = (await request.json()) as RefillRequestBody;
    } catch {
        body = {};
    }

    const excludeIds = Array.isArray(body.excludeIds)
        ? body.excludeIds.filter((id): id is number => Number.isInteger(id) && id > 0)
        : [];

    const [watchlist, swipes, likedSwipes] = await Promise.all([
        db.watchlistEntry.findMany({
            where: { userId },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: SEED_LIMIT,
        }),
        db.swipe.findMany({
            where: { userId },
            select: { tmdbId: true },
        }),
        db.swipe.findMany({
            where: { userId, liked: true },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: SEED_LIMIT,
        }),
    ]);

    const watchlistIds = watchlist.map((entry) => entry.tmdbId);
    const allSwipeIds = swipes.map((swipe) => swipe.tmdbId);
    const likedSeedIds = likedSwipes.map((swipe) => swipe.tmdbId);

    const seedIds = [...new Set([...likedSeedIds, ...watchlistIds])].slice(0, SEED_LIMIT);

    if (seedIds.length === 0) {
        return Response.json([]);
    }

    const seenIds = new Set([...excludeIds, ...watchlistIds, ...allSwipeIds]);
    const movies = await getRecommendationStack(seedIds, seenIds, REFILL_BATCH_SIZE);

    return Response.json(movies);
}