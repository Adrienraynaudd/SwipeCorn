export default function MovieDetailSkeleton() {
    return (
        <div className="min-h-screen pb-8">
            <div className="relative h-52 w-full animate-pulse bg-zinc-800" />

            <div className="px-5">
                <div className="relative z-10 -mt-16 flex gap-4">
                    <div className="h-36 w-24 flex-shrink-0 animate-pulse rounded-xl bg-zinc-700 shadow-xl" />
                    <div className="flex flex-col justify-end gap-2 pb-1">
                        <div className="h-6 w-48 animate-pulse rounded-lg bg-zinc-700" />
                        <div className="h-4 w-36 animate-pulse rounded bg-zinc-800" />
                        <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
                    </div>
                </div>

                <div className="mt-4 flex gap-2">
                    <div className="h-7 w-20 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-7 w-16 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-7 w-24 animate-pulse rounded-full bg-zinc-800" />
                </div>

                <div className="mt-6 flex flex-col gap-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-full animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-4/5 animate-pulse rounded bg-zinc-800" />
                    <div className="h-3 w-3/4 animate-pulse rounded bg-zinc-800" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    {(["a", "b", "c", "d"] as const).map((k) => (
                        <div key={k} className="rounded-xl bg-zinc-800/60 p-3">
                            <div className="h-3 w-16 animate-pulse rounded bg-zinc-700" />
                            <div className="mt-1.5 h-4 w-24 animate-pulse rounded bg-zinc-700" />
                        </div>
                    ))}
                </div>

                <div className="mt-6 h-12 w-full animate-pulse rounded-xl bg-zinc-800" />
            </div>
        </div>
    );
}
