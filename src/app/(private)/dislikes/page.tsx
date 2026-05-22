import { Suspense } from "react";
import DislikeGrid from "./DislikeGrid";
import MovieGridSkeleton from "@/components/MovieGridSkeleton";

export default function DislikesPage() {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-6 text-2xl font-bold text-white">Mes Dislikes</h1>
            <Suspense fallback={<MovieGridSkeleton />}>
                <DislikeGrid />
            </Suspense>
        </div>
    );
}
