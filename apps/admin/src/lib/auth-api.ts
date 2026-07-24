import { getApiUrl } from "./api-client";

export type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  role: "ADMIN" | "TECHNICIAN";
};

type SessionResponse = {
  user: AdminUser;
};

export async function getCurrentSession():
Promise<SessionResponse | null> {
  const response = await fetch(
    `${getApiUrl()}/auth/me`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      "Impossible de vérifier la session.",
    );
  }

  return response.json() as Promise<SessionResponse>;
}

export async function logoutAdmin():
Promise<void> {
  await fetch(
    `${getApiUrl()}/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );
}