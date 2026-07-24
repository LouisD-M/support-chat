"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  LockKeyhole,
  UserRound,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://192.168.15.40:7000";

type LoginResponse = {
  user: {
    id: string;
    username: string;
    displayName: string;
    role: "ADMIN" | "TECHNICIAN";
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

useEffect(() => {
  async function checkSession() {
    try {
      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        },
      );

      if (response.ok) {
        router.replace("/dashboard");
      }
    } catch {
      // Aucune session ou API indisponible.
    }
  }

  void checkSession();
}, [router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError(
        "Renseigne ton identifiant et ton mot de passe.",
      );

      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        },
      );

      if (!response.ok) {
        let message =
          "Identifiant ou mot de passe incorrect.";

        try {
          const body =
            (await response.json()) as {
              message?: string | string[];
            };

          if (Array.isArray(body.message)) {
            message =
              body.message.join(", ");
          } else if (body.message) {
            message = body.message;
          }
        } catch {
          // La réponse de l’API n’est pas en JSON.
        }

        throw new Error(message);
      }

      const data =
        (await response.json()) as LoginResponse;



      router.replace("/dashboard");
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Impossible de se connecter.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="border-b border-slate-100 px-8 py-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
            <LockKeyhole className="size-6" />
          </div>

          <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-950">
            Support informatique
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Connectez-vous pour accéder aux
            conversations et aux outils
            d’administration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-8 py-8"
        >
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Identifiant
            </label>

            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                disabled={isLoading}
                placeholder="admin"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Mot de passe
            </label>

            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value,
                  )
                }
                disabled={isLoading}
                placeholder="••••••••••••"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              isLoading ||
              !username.trim() ||
              !password
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connexion…
              </>
            ) : (
              <>
                <LockKeyhole className="size-4" />
                Se connecter
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
}