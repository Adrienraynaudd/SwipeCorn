import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavBar from "@/components/NavBar";

export default async function PrivateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 pb-20">{children}</main>
            <NavBar />
        </div>
    );
}
