import { NextRequest } from "next/server";
import { searchMovies } from "@/lib/tmdb";
import { searchQuerySchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
    const parsedQuery = searchQuerySchema.safeParse(request.nextUrl.searchParams.get("q"));
    if (!parsedQuery.success) {
        return Response.json([]);
    }
    const movies = await searchMovies(parsedQuery.data);
    return Response.json(movies, {
        headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
    });
}
