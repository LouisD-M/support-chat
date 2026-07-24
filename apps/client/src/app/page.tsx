"use client";

import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type NativeDeviceIdentity = {
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000";

const CONVERSATION_STORAGE_KEY =
  "support-chat:conversation-id";

const INSTALLATION_STORAGE_KEY =
  "support-chat:installation-id";

type ConversationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_USER"
  | "CLOSED";

type SenderType =
  | "CLIENT"
  | "TECHNICIAN"
  | "SYSTEM";

type Device = {
  id: string;
  installationId: string;
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;
};

type Message = {
  id: string;
  clientMessageId: string | null;
  senderType: SenderType;
  senderLabel: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

type Conversation = {
  id: string;
  subject: string | null;
  status: ConversationStatus;
  openedByUsername: string;
  deviceId: string;
  device: Device;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

let bootstrapPromise: Promise<Conversation> | null = null;

async function requestJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

  if (options?.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Erreur API ${response.status}`;

    try {
      const errorBody =
        (await response.json()) as ApiErrorBody;

      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(", ");
      } else if (errorBody.message) {
        message = errorBody.message;
      } else if (errorBody.error) {
        message = errorBody.error;
      }
    } catch {
      // La réponse ne contenait pas de JSON exploitable.
    }

    throw new ApiError(message, response.status);
  }

  return response.json() as Promise<T>;
}

function getInstallationId(): string {
  const existingInstallationId = localStorage.getItem(
    INSTALLATION_STORAGE_KEY,
  );

  if (existingInstallationId) {
    return existingInstallationId;
  }

  const installationId = generateUuid();

  localStorage.setItem(
    INSTALLATION_STORAGE_KEY,
    installationId,
  );

  return installationId;
}


async function getDeviceIdentity() {
  const searchParams = new URLSearchParams(
    window.location.search,
  );

  const launcherInstallationId =
    searchParams.get("installationId");

  const installationId =
    launcherInstallationId ?? getInstallationId();

  if (launcherInstallationId) {
    localStorage.setItem(
      INSTALLATION_STORAGE_KEY,
      launcherInstallationId,
    );
  }

  try {
    const { invoke } = await import(
      "@tauri-apps/api/core"
    );

    const identity =
      await invoke<NativeDeviceIdentity>(
        "get_device_identity",
      );

    return {
      installationId,
      computerName: identity.computerName,
      domain: identity.domain,
      lastWindowsUser: identity.lastWindowsUser,
    };
  } catch {
    /*
     * Mode navigateur lancé par PowerShell.
     */
    return {
      installationId,

      computerName:
        searchParams.get("computerName") ??
        "NAVIGATEUR-WEB",

      domain:
        searchParams.get("domain") || null,

      lastWindowsUser:
        searchParams.get("lastWindowsUser") ??
        "Utilisateur web",
    };
  }
}

async function fetchConversation(
  conversationId: string,
): Promise<Conversation> {
  return requestJson<Conversation>(
    `/conversations/${conversationId}`,
  );
}

async function createConversation(): Promise<Conversation> {
  const identity =await getDeviceIdentity();

  const device = await requestJson<Device>(
    "/devices/register",
    {
      method: "POST",
      body: JSON.stringify(identity),
    },
  );

  const conversation = await requestJson<Conversation>(
    "/conversations",
    {
      method: "POST",
      body: JSON.stringify({
        subject: "Demande d’assistance",
        openedByUsername:
          identity.lastWindowsUser ?? "Utilisateur",
        deviceId: device.id,
      }),
    },
  );

  localStorage.setItem(
    CONVERSATION_STORAGE_KEY,
    conversation.id,
  );

  return conversation;
}

async function getOrCreateConversation(): Promise<Conversation> {
  const storedConversationId = localStorage.getItem(
    CONVERSATION_STORAGE_KEY,
  );

  if (storedConversationId) {
    try {
      return await fetchConversation(
        storedConversationId,
      );
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 404
      ) {
        localStorage.removeItem(
          CONVERSATION_STORAGE_KEY,
        );
      } else {
        throw error;
      }
    }
  }

  return createConversation();
}

function formatMessageTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function generateUuid(): string {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);

    window.crypto.getRandomValues(bytes);

    // UUID version 4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hexadecimal = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    return [
      hexadecimal.slice(0, 8),
      hexadecimal.slice(8, 12),
      hexadecimal.slice(12, 16),
      hexadecimal.slice(16, 20),
      hexadecimal.slice(20),
    ].join("-");
  }

  // Dernier secours pour le développement
  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function getStatusLabel(
  status: ConversationStatus,
): string {
  const labels: Record<ConversationStatus, string> = {
    OPEN: "Demande ouverte",
    IN_PROGRESS: "Prise en charge",
    WAITING_USER: "En attente de votre réponse",
    CLOSED: "Conversation terminée",
  };

  return labels[status];
}

export default function ClientChatPage() {
  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initializeChat() {
      setIsLoading(true);
      setError(null);

      try {
        bootstrapPromise ??= getOrCreateConversation();

        const loadedConversation =
          await bootstrapPromise;

        if (!isCancelled) {
          setConversation(loadedConversation);
        }
      } catch (initializationError) {
        bootstrapPromise = null;

        if (!isCancelled) {
          setError(
            initializationError instanceof Error
              ? initializationError.message
              : "Impossible d’ouvrir la conversation.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void initializeChat();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    const conversationId = conversation.id;

    const intervalId = window.setInterval(() => {
      void fetchConversation(conversationId)
        .then((updatedConversation) => {
          setConversation(updatedConversation);
          setError(null);
        })
        .catch(() => {
          // Une erreur temporaire de rafraîchissement
          // ne masque pas immédiatement le chat.
        });
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [conversation?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages.length]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content = draft.trim();

    if (!content || !conversation || isSending) {
      return;
    }

    const conversationId = conversation.id;
    const senderLabel =
      conversation.openedByUsername;

    setIsSending(true);
    setError(null);

    try {
      await requestJson<Message>(
        `/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            clientMessageId: generateUuid(),
            senderType: "CLIENT",
            senderLabel,
            content,
          }),
        },
      );

      setDraft("");

      const updatedConversation =
        await fetchConversation(conversationId);

      setConversation(updatedConversation);
    } catch (sendingError) {
      setError(
        sendingError instanceof Error
          ? sendingError.message
          : "Le message n’a pas pu être envoyé.",
      );
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Ouverture du support…
          </p>
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <h1 className="text-xl font-semibold text-slate-950">
            Support indisponible
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error ??
              "La conversation n’a pas pu être chargée."}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  const isClosed = conversation.status === "CLOSED";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-0 sm:p-6">
      <section className="flex h-screen w-full flex-col overflow-hidden bg-white shadow-xl sm:h-[min(850px,calc(100vh-3rem))] sm:max-w-3xl sm:rounded-3xl sm:ring-1 sm:ring-slate-200">
        <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
              S
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-slate-950">
                Support informatique
              </h1>

              <div className="mt-1 flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500" />

                <p className="truncate text-xs text-slate-500">
                  {getStatusLabel(
                    conversation.status,
                  )}
                </p>
              </div>
            </div>

            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-500">
                Poste
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {conversation.device.computerName}
              </p>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <div className="flex justify-center">
              <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm ring-1 ring-slate-200">
                Conversation avec le support
              </span>
            </div>

            {conversation.messages.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-slate-200">
                  👋
                </div>

                <h2 className="mt-5 text-base font-semibold text-slate-900">
                  Comment pouvons-nous vous aider ?
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Décrivez votre problème. Votre message sera
                  transmis directement au support informatique.
                </p>
              </div>
            )}

            {conversation.messages.map((message) => {
              if (message.senderType === "SYSTEM") {
                return (
                  <p
                    key={message.id}
                    className="py-2 text-center text-xs text-slate-400"
                  >
                    {message.content}
                  </p>
                );
              }

              const isClientMessage =
                message.senderType === "CLIENT";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isClientMessage
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                      isClientMessage
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isClientMessage
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {isClientMessage
                          ? "Vous"
                          : message.senderLabel}
                      </span>

                      <span
                        className={`text-[11px] ${
                          isClientMessage
                            ? "text-blue-200"
                            : "text-slate-400"
                        }`}
                      >
                        {formatMessageTime(
                          message.createdAt,
                        )}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white p-4 sm:p-5">
          {error && (
            <div className="mx-auto mb-3 max-w-2xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-2xl items-end gap-3"
          >
            <textarea
              value={draft}
              onChange={(event) =>
                setDraft(event.target.value)
              }
              onKeyDown={handleKeyDown}
              disabled={isClosed || isSending}
              placeholder={
                isClosed
                  ? "Cette conversation est terminée."
                  : "Décrivez votre problème…"
              }
              rows={2}
              className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="submit"
              disabled={
                !draft.trim() ||
                isSending ||
                isClosed
              }
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSending ? "Envoi…" : "Envoyer"}
            </button>
          </form>

          {!isClosed && (
            <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-400">
              Entrée pour envoyer · Maj + Entrée pour revenir
              à la ligne
            </p>
          )}
        </footer>
      </section>
    </main>
  );
}