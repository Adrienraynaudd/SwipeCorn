import Link from "next/link";
import Image from "next/image";
import { TMDB_IMAGE_BASE } from "@/lib/tmdb";

type CardMovie = { tmdbId: number; title: string; poster: string | null; year: string };

export default function WatchlistCard({ movie }: Readonly<{ movie: CardMovie }>) {
    return (
        <Link
            href={`/watchlist/${movie.tmdbId}`}
            className="group relative block aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800"
        >
            {movie.poster ? (
                <Image
                    src={`${TMDB_IMAGE_BASE}${movie.poster}`}
                    alt={movie.title}
                    fill
                    sizes="(max-width: 640px) 12vw, 100px"
                    className="object-cover transition group-hover:scale-105"
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center text-xl">🎬</div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1 opacity-0 transition group-hover:opacity-100">
                <p className="truncate text-[10px] font-medium text-white">{movie.title}</p>
            </div>
        </Link>
    );
}
