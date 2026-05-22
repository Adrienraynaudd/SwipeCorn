"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function loginAction(formData: FormData) {
    try {
        await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/swipe",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Email ou mot de passe incorrect." };
        }
        throw error;
    }
}

export async function signInWithGitHub() {
    await signIn("github", { redirectTo: "/swipe" });
}

export async function signInWithGoogle() {
    await signIn("google", { redirectTo: "/swipe" });
}

export async function registerAction(formData: FormData) {
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const name = (formData.get("name") as string)?.trim();

    if (!email || !password || !name) {
        return { error: "Tous les champs sont requis." };
    }
    if (password.length < 8) {
        return { error: "Le mot de passe doit faire au moins 8 caractères." };
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
        return { error: "Un compte existe déjà avec cet email." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({ data: { email, name, password: hashedPassword } });

    try {
        await signIn("credentials", { email, password, redirectTo: "/setup" });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Compte créé mais connexion échouée. Essaie de te connecter." };
        }
        throw error;
    }
}
