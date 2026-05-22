import MovieGridSkeleton from "@/components/MovieGridSkeleton";

export default function WatchlistLoading() {
    return (
        <div className="px-6 py-8">
            <div className="mb-6 h-7 w-40 animate-pulse rounded-lg bg-zinc-800" />
            <MovieGridSkeleton />
        </div>
    );
}
