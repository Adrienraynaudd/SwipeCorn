"use client";

import { useActionState, useState } from "react";
import { loginAction, registerAction } from "./actions";
import { signIn} from "next-auth/react"

type Mode = "login" | "register";

const empty = { error: undefined as string | undefined };

export default function AuthForm() {
    const [mode, setMode] = useState<Mode>("login");

    const [loginState, loginDispatch, loginPending] = useActionState(
        async (_: typeof empty, fd: FormData) => (await loginAction(fd)) ?? empty,
        empty
    );
    const [registerState, registerDispatch, registerPending] = useActionState(
        async (_: typeof empty, fd: FormData) => (await registerAction(fd)) ?? empty,
        empty
    );

    const pending = loginPending || registerPending;
    const error = mode === "login" ? loginState?.error : registerState?.error;

    const inputCls =
        "w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-yellow-400 transition";

    return (
        <div className="flex flex-col gap-5">
            {/* Mode toggle */}
            <div className="flex rounded-xl border border-zinc-700 bg-zinc-800/50 p-1">
                {(["login", "register"] as Mode[]).map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
                            mode === m
                                ? "bg-yellow-400 text-zinc-900"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        {m === "login" ? "Se connecter" : "S'inscrire"}
                    </button>
                ))}
            </div>

            {mode === "login" ? (
                <><form action={loginDispatch} className="flex flex-col gap-3">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className={inputCls} />
                    <input
                        name="password"
                        type="password"
                        placeholder="Mot de passe"
                        required
                        className={inputCls} />
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-zinc-900 transition hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
                    >
                        {loginPending ? "Connexion..." : "Se connecter"}
                    </button>
                </form><button onClick={() => signIn("github", { callbackUrl: "/swipe" })}>
                        Se connecter avec GitHub
                    </button></>
            ) : (
                <form action={registerDispatch} className="flex flex-col gap-3">
                    <input
                        name="name"
                        type="text"
                        placeholder="Ton prénom"
                        required
                        className={inputCls}
                    />
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        required
                        className={inputCls}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Mot de passe (8 caractères min.)"
                        required
                        minLength={8}
                        className={inputCls}
                    />
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full rounded-xl bg-yellow-400 py-3 font-semibold text-zinc-900 transition hover:bg-yellow-300 active:scale-95 disabled:opacity-50"
                    >
                        {registerPending ? "Création..." : "Créer mon compte"}
                    </button>
                </form>
            )}
        </div>
    );
}

function ErrorMsg({ children }: { children: string }) {
    return (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {children}
        </p>
    );
}
