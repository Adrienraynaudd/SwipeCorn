import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SetupForm from "./SetupForm";

export default async function SetupPage() {
    const session = await auth();
    const userId = session!.user!.id!;

    const count = await db.watchlistEntry.count({ where: { userId } });
    if (count > 0) redirect("/swipe");

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg">
                <div className="mb-8 text-center">
                    <div className="text-4xl">🎬</div>
                    <h1 className="mt-3 text-2xl font-bold text-white">
                        Tes 3 films préférés
                    </h1>
                    <p className="mt-2 text-zinc-400">
                        Choisis 3 films que tu adores pour initialiser tes recommandations
                    </p>
                </div>
                <SetupForm />
            </div>
        </div>
    );
}
