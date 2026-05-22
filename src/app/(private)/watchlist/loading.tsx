export default function WatchlistLoading() {
    return (
        <div className="px-6 py-8">
            <div className="mb-6 h-7 w-40 animate-pulse rounded-lg bg-zinc-800" />
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-zinc-800" />
                ))}
            </div>
        </div>
    );
}
