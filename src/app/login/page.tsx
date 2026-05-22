import AuthForm from "./AuthForm";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <div className="text-5xl">🍿</div>
                    <h1 className="mt-4 text-3xl font-bold text-white">
                        Swipe<span className="text-yellow-400">Corn</span>
                    </h1>
                    <p className="mt-2 text-zinc-400">Connecte-toi ou crée ton compte</p>
                </div>
                <AuthForm />
            </div>
        </main>
    );
}
