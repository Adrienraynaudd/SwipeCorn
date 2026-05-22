import MovieGridSkeleton from "@/components/MovieGridSkeleton";

export default function DislikesLoading() {
    return (
        <div className="px-6 py-8">
            <div className="mb-6 h-8 w-40 animate-pulse rounded-lg bg-zinc-800" />
            <MovieGridSkeleton />
        </div>
    );
}
