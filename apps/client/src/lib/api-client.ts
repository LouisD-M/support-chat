const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:7000";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);

    this.name = "ApiError";
  }
}

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
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message =
      `Erreur API ${response.status}`;

    try {
      const errorBody =
        (await response.json()) as ApiErrorBody;

      if (
        Array.isArray(errorBody.message)
      ) {
        message =
          errorBody.message.join(", ");
      } else if (errorBody.message) {
        message = errorBody.message;
      } else if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // Réponse non JSON.
    }

    throw new ApiError(
      message,
      response.status,
    );
  }

  return response.json() as Promise<T>;
}