import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

const privateRoutes = ["/setup", "/swipe", "/watchlist", "/dislikes"];

export default auth((request) => {
    const session = request.auth;
    const path = (request as NextRequest).nextUrl.pathname;
    const isPrivate = privateRoutes.some((r) => path.startsWith(r));

    if (isPrivate && !session?.user) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (path === "/login" && session?.user) {
        return NextResponse.redirect(new URL("/swipe", request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
