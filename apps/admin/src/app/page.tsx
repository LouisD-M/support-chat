"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000";

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
  lastSeenAt: string;
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

function generateUuid(): string {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID === "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

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
      const body = (await response.json()) as {
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

  return response.json() as Promise<T>;
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusLabel(
  status: ConversationStatus,
): string {
  const labels: Record<ConversationStatus, string> = {
    OPEN: "Ouverte",
    IN_PROGRESS: "En cours",
    WAITING_USER: "Attente utilisateur",
    CLOSED: "Fermée",
  };

  return labels[status];
}

export default function AdminPage() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id === selectedConversationId,
      ) ?? null,
    [conversations, selectedConversationId],
  );

  const loadConversations = useCallback(async () => {
    try {
      const data = await requestJson<Conversation[]>(
        "/conversations",
      );

      setConversations(data);

      setSelectedConversationId((currentId) => {
        const currentStillExists = data.some(
          (conversation) =>
            conversation.id === currentId,
        );

        if (currentStillExists) {
          return currentId;
        }

        return data[0]?.id ?? null;
      });

      setError(null);
    } catch (loadingError) {
      setError(
        loadingError instanceof Error
          ? loadingError.message
          : "Impossible de charger les conversations.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();

    const intervalId = window.setInterval(() => {
      void loadConversations();
    }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [
    selectedConversationId,
    selectedConversation?.messages.length,
  ]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content = draft.trim();

    if (
      !content ||
      !selectedConversation ||
      isSending
    ) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await requestJson<Message>(
        `/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            clientMessageId: generateUuid(),
            senderType: "TECHNICIAN",
            senderLabel: "Support informatique",
            content,
          }),
        },
      );

      setDraft("");

      await loadConversations();
    } catch (sendingError) {
      setError(
        sendingError instanceof Error
          ? sendingError.message
          : "Impossible d’envoyer le message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <section className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200">
          <header className="border-b border-slate-200 p-5">
            <h1 className="text-lg font-bold text-slate-950">
              Support informatique
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {conversations.length} conversation
              {conversations.length > 1 ? "s" : ""}
            </p>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading && (
              <p className="p-5 text-sm text-slate-500">
                Chargement…
              </p>
            )}

            {!isLoading &&
              conversations.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Aucune demande
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Une conversation apparaîtra dès qu’un
                    utilisateur ouvrira le client.
                  </p>
                </div>
              )}

            {conversations.map((conversation) => {
              const lastMessage =
                conversation.messages.at(-1);

              const isSelected =
                conversation.id ===
                selectedConversationId;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    setSelectedConversationId(
                      conversation.id,
                    )
                  }
                  className={`w-full border-b border-slate-100 p-4 text-left transition ${
                    isSelected
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {conversation.openedByUsername}
                    </p>

                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatTime(
                        conversation.updatedAt,
                      )}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-xs font-medium text-slate-500">
                    {conversation.device.computerName}
                  </p>

                  <p className="mt-2 truncate text-sm text-slate-500">
                    {lastMessage?.content ??
                      "Nouvelle conversation"}
                  </p>

                  <span className="mt-3 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                    {getStatusLabel(
                      conversation.status,
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          {!selectedConversation ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-800">
                  Aucune conversation sélectionnée
                </p>

                <p className="mt-2 text-sm text-slate-400">
                  Ouvre le client puis envoie un message.
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between gap-6">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      {selectedConversation.subject ??
                        "Demande d’assistance"}
                    </h2>

<div className="mt-2 grid gap-1 text-sm text-slate-500">
  <p>
    <span className="font-medium text-slate-700">
      Poste :
    </span>{" "}
    {selectedConversation.device.computerName}
  </p>

  <p>
    <span className="font-medium text-slate-700">
      Utilisateur Windows :
    </span>{" "}
    {selectedConversation.device.lastWindowsUser ??
      selectedConversation.openedByUsername}
  </p>

  <p>
    <span className="font-medium text-slate-700">
      Domaine :
    </span>{" "}
    {selectedConversation.device.domain ??
      "Hors domaine"}
  </p>

  <p>
    <span className="font-medium text-slate-700">
      ID installation :
    </span>{" "}
    <span className="font-mono text-xs">
      {selectedConversation.device.installationId}
    </span>
  </p>
</div>
                  </div>

                  <div className="text-right text-xs text-slate-400">
                    <p>
                      {getStatusLabel(
                        selectedConversation.status,
                      )}
                    </p>

                    <p className="mt-1">
                      Ouverte le{" "}
                      {formatDate(
                        selectedConversation.createdAt,
                      )}
                    </p>
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-6">
                <div className="mx-auto flex max-w-3xl flex-col gap-4">
                  {selectedConversation.messages.length ===
                    0 && (
                    <p className="py-10 text-center text-sm text-slate-400">
                      Aucun message pour le moment.
                    </p>
                  )}

                  {selectedConversation.messages.map(
                    (message) => {
                      if (
                        message.senderType === "SYSTEM"
                      ) {
                        return (
                          <p
                            key={message.id}
                            className="text-center text-xs text-slate-400"
                          >
                            {message.content}
                          </p>
                        );
                      }

                      const isTechnician =
                        message.senderType ===
                        "TECHNICIAN";

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isTechnician
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                              isTechnician
                                ? "rounded-br-md bg-blue-600 text-white"
                                : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-semibold opacity-75">
                                {message.senderLabel}
                              </span>

                              <span className="text-[11px] opacity-60">
                                {formatTime(
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
                    },
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <footer className="border-t border-slate-200 bg-white p-5">
                {error && (
                  <p className="mx-auto mb-3 max-w-3xl rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="mx-auto flex max-w-3xl gap-3"
                >
                  <textarea
                    value={draft}
                    onChange={(event) =>
                      setDraft(event.target.value)
                    }
                    disabled={
                      isSending ||
                      selectedConversation.status ===
                        "CLOSED"
                    }
                    placeholder="Répondre à l’utilisateur…"
                    rows={2}
                    className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
                  />

                  <button
                    type="submit"
                    disabled={
                      !draft.trim() ||
                      isSending ||
                      selectedConversation.status ===
                        "CLOSED"
                    }
                    className="rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSending
                      ? "Envoi…"
                      : "Envoyer"}
                  </button>
                </form>
              </footer>
            </>
          )}
        </section>
      </section>
    </main>
  );
}