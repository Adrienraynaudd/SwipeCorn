export default function SwipeLoading() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
            <div className="relative h-[420px] w-72">
                {[2, 1, 0].map((i) => (
                    <div
                        key={i}
                        className="absolute inset-0 animate-pulse rounded-2xl bg-zinc-800"
                        style={{
                            transform: `rotate(${(i - 1) * 4}deg) translateY(${i * -8}px)`,
                            zIndex: i,
                        }}
                    />
                ))}
            </div>
            <p className="text-zinc-500 text-sm">Chargement des films...</p>
        </div>
    );
}
