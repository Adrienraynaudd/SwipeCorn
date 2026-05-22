"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { loginInputSchema, registerInputSchema } from "@/lib/validation";

export async function loginAction(formData: FormData) {
    const parsedInput = loginInputSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    });

    if (!parsedInput.success) {
        return { error: parsedInput.error.issues[0]?.message ?? "Identifiants invalides." };
    }

    try {
        await signIn("credentials", {
            email: parsedInput.data.email,
            password: parsedInput.data.password,
            redirectTo: "/swipe",
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: "Email ou mot de passe incorrect." };
        }
        throw error;
    }
}

export async function registerAction(formData: FormData) {
    const parsedInput = registerInputSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
    });

    if (!parsedInput.success) {
        return { error: parsedInput.error.issues[0]?.message ?? "Formulaire invalide." };
    }

    const { email, password, name } = parsedInput.data;

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
