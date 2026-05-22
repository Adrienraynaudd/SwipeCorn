import { z } from "zod";

const positiveIntSchema = z.coerce.number().int().positive();

const trimmedOptionalStringSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    },
    z.string().min(1).optional()
);

const trimmedNullableStringSchema = z.preprocess(
    (value) => {
        if (value == null) return null;
        if (typeof value !== "string") return value;
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    },
    z.string().min(1).nullable().optional()
);

const emailSchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") return value;
        return value.trim().toLowerCase();
    },
    z.string().email("Email invalide.")
);

export const searchQuerySchema = z.preprocess(
    (value) => {
        if (typeof value !== "string") return value;
        return value.trim();
    },
    z.string().min(1).max(120)
);

export const trailerTmdbIdSchema = positiveIntSchema;

export const refillRequestBodySchema = z.object({
    excludeIds: z.array(positiveIntSchema).default([]),
});

export const saveSwipeInputSchema = z
    .object({
        tmdbId: positiveIntSchema,
        liked: z.boolean(),
        title: trimmedOptionalStringSchema,
        posterPath: trimmedNullableStringSchema,
    })
    .superRefine((input, ctx) => {
        if (input.liked && !input.title) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Titre invalide",
                path: ["title"],
            });
        }
    });

export const onboardingMoviesSchema = z
    .object({
        movie1: positiveIntSchema,
        movie2: positiveIntSchema,
        movie3: positiveIntSchema,
    })
    .transform(({ movie1, movie2, movie3 }) => [movie1, movie2, movie3])
    .superRefine((movieIds, ctx) => {
        if (new Set(movieIds).size !== 3) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Sélectionne exactement 3 films différents",
            });
        }
    });

export const loginInputSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Mot de passe requis."),
});

export const registerInputSchema = z.object({
    name: z.preprocess(
        (value) => {
            if (typeof value !== "string") return value;
            return value.trim();
        },
        z.string().min(1, "Tous les champs sont requis.")
    ),
    email: emailSchema,
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});