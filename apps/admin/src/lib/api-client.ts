const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://192.168.15.40:7000";

export async function requestJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers =
    new Headers(options?.headers);

  if (options?.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }

    throw new Error(
      "Session expirée ou invalide.",
    );
  }

  if (!response.ok) {
    let message =
      `Erreur API ${response.status}`;

    try {
      const body =
        (await response.json()) as {
          message?: string | string[];
        };

      if (Array.isArray(body.message)) {
        message = body.message.join(", ");
      } else if (body.message) {
        message = body.message;
      }
    } catch {
      // Réponse non JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type");

  if (
    !contentType?.includes(
      "application/json",
    )
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getApiUrl(): string {
  return API_URL;
}