export default function WatchlistSkeleton() {
    return (
        <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 16 }, (_, i) => `s${i}`).map((id) => (
                <div key={id} className="aspect-[2/3] animate-pulse rounded-lg bg-zinc-800" />
            ))}
        </div>
    );
}
