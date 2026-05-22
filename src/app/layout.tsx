import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "SwipeCorn",
    description: "Découvre ton prochain film en swipant",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className={`${geistSans.variable} h-full`}>
            <body className="min-h-full bg-zinc-950 text-white antialiased">
                {children}
            </body>
        </html>
    );
}
