import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRecommendationStack } from "@/lib/tmdb";
import { refillRequestBodySchema } from "@/lib/validation";

const REFILL_BATCH_SIZE = 12;
const SEED_LIMIT = 10;

export async function POST(request: Request) {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    let body: unknown = {};

    try {
        body = await request.json();
    } catch {
        body = {};
    }

    const parsedBody = refillRequestBodySchema.safeParse(body);
    if (!parsedBody.success) {
        return Response.json({ error: "Payload invalide" }, { status: 400 });
    }

    const { excludeIds } = parsedBody.data;

    const [swipes, likedSwipes, dislikedSwipes] = await Promise.all([
        db.swipe.findMany({ where: { userId }, select: { tmdbId: true } }),
        db.swipe.findMany({
            where: { userId, liked: true },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: SEED_LIMIT,
        }),
        db.swipe.findMany({
            where: { userId, liked: false },
            select: { tmdbId: true },
            orderBy: { createdAt: "desc" },
            take: SEED_LIMIT,
        }),
    ]);

    const allSwipeIds = swipes.map((s) => s.tmdbId);
    const likedSeedIds = likedSwipes.map((s) => s.tmdbId);
    const dislikedSeedIds = dislikedSwipes.map((s) => s.tmdbId);
    const dislikedSeedIdSet = new Set(dislikedSeedIds);

    const seedIds = likedSeedIds
        .filter((id) => !dislikedSeedIdSet.has(id))
        .slice(0, SEED_LIMIT);

    if (seedIds.length === 0) {
        return Response.json([]);
    }

    const seenIds = new Set([...excludeIds, ...allSwipeIds]);
    const movies = await getRecommendationStack(seedIds, seenIds, {
        limit: REFILL_BATCH_SIZE,
        dislikedSeedIds,
    });

    return Response.json(movies);
}