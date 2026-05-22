import { Suspense } from "react";
import WatchlistGrid from "./WatchlistGrid";
import MovieGridSkeleton from "@/components/MovieGridSkeleton";

export default function WatchlistPage() {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-6 text-2xl font-bold text-white">Ma Watchlist</h1>
            <Suspense fallback={<MovieGridSkeleton />}>
                <WatchlistGrid />
            </Suspense>
        </div>
    );
}
