"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";

const links = [
    { href: "/swipe", label: "Swipe", icon: "🎬" },
    { href: "/watchlist", label: "Watchlist", icon: "❤️" },
    { href: "/dislikes", label: "Dislikes", icon: "💔" },
];

export default function NavBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur">
            <div className="flex items-center justify-around px-4 py-2">
                {links.map(({ href, label, icon }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 px-6 py-2 text-xs font-medium transition ${
                                active ? "text-yellow-400" : "text-zinc-500 hover:text-zinc-300"
                            }`}
                        >
                            <span className="text-xl">{icon}</span>
                            {label}
                        </Link>
                    );
                })}
                <form action={logout}>
                    <button
                        type="submit"
                        className="flex flex-col items-center gap-1 px-6 py-2 text-xs font-medium text-zinc-500 transition hover:text-red-400"
                    >
                        <span className="text-xl">🚪</span>{"Logout"}
                    </button>
                </form>
            </div>
        </nav>
    );
}
