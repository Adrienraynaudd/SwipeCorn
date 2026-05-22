export default function SetupLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg">
                <div className="mb-8 flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />
                    <div className="h-7 w-52 animate-pulse rounded-lg bg-zinc-800" />
                    <div className="h-4 w-72 animate-pulse rounded bg-zinc-800" />
                </div>

                <div className="h-12 w-full animate-pulse rounded-xl bg-zinc-800" />

                <div className="mt-3 flex flex-col gap-2">
                    {(["w-4/5", "w-2/3", "w-3/4", "w-1/2"] as const).map((w) => (
                        <div key={w} className="flex items-center gap-3 rounded-xl border border-zinc-800 p-3">
                            <div className="h-[60px] w-[40px] animate-pulse rounded bg-zinc-700" />
                            <div className="flex flex-col gap-2">
                                <div className={`h-4 animate-pulse rounded bg-zinc-700 ${w}`} />
                                <div className="h-3 w-10 animate-pulse rounded bg-zinc-700" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-zinc-800" />
            </div>
        </div>
    );
}
