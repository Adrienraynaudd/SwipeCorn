import { NextRequest } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request: NextRequest) {
    const query = request.nextUrl.searchParams.get("q");
    if (!query || query.trim().length < 2) {
        return Response.json([]);
    }
    const movies = await searchMovies(query.trim());
    return Response.json(movies);
}
