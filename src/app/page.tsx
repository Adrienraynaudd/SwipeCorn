import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await auth();
    if (session?.user) redirect("/swipe");

    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6">
            <div className="flex flex-col items-center gap-8 text-center">
                <div className="text-7xl">🍿</div>
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                        Swipe<span className="text-yellow-400">Corn</span>
                    </h1>
                    <p className="mt-4 max-w-sm text-lg text-zinc-400">
                        Découvre ton prochain film. Swipe à droite pour sauvegarder, à gauche pour passer.
                    </p>
                </div>
                <Link
                    href="/login"
                    className="rounded-full bg-yellow-400 px-8 py-3 text-base font-semibold text-zinc-900 transition hover:bg-yellow-300 active:scale-95"
                >
                    Commencer
                </Link>
            </div>
        </main>
    );
}
