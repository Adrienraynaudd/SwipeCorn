import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github"
import {PrismaAdapter} from "@auth/prisma-adapter"
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

declare module "next-auth" {
    interface Session {
        user: { id: string } & DefaultSession["user"];
    }
}

const prismaAdapter = PrismaAdapter(db);
const adapter = {
    ...prismaAdapter,
    createUser: ({ image, emailVerified, ...data }: Parameters<NonNullable<typeof prismaAdapter.createUser>>[0]) =>
        prismaAdapter.createUser!(data as any),
};

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter,
    session: { strategy: "jwt" },
    providers: [
        Github({
            clientId : process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                type UserRow = { id: string; name: string; email: string; password: string };

                const user = await db.user.findUnique({  where: { email: credentials.email as string },  }) as UserRow | null;

                if (!user) return null;

                const valid = await bcrypt.compare(
                    credentials.password as string,
                    user.password
                );

                if (!valid) return null;

                return { id: user.id, email: user.email, name: user.name };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user?.id) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
