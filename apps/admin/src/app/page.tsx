"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { ChatPanel } from "@/components/admin/chat-panel";

import type {
  Conversation,
  ConversationStatus,
  Message,
} from "@/types/conversation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:7000";

async function requestJson<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers = new Headers(options?.headers);

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
      // La réponse ne contient pas de JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType =
    response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function generateUuid(): string {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID ===
      "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusLabel(
  status: ConversationStatus,
): string {
  const labels: Record<
    ConversationStatus,
    string
  > = {
    OPEN: "Ouverte",
    IN_PROGRESS: "En cours",
    WAITING_USER: "Attente utilisateur",
    CLOSED: "Fermée",
  };

  return labels[status];
}

function getStatusClasses(
  status: ConversationStatus,
): string {
  const classes: Record<
    ConversationStatus,
    string
  > = {
    OPEN:
      "bg-green-50 text-green-700 ring-green-200",
    IN_PROGRESS:
      "bg-blue-50 text-blue-700 ring-blue-200",
    WAITING_USER:
      "bg-amber-50 text-amber-700 ring-amber-200",
    CLOSED:
      "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return classes[status];
}

export default function AdminPage() {
  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id ===
          selectedConversationId,
      ) ?? null,
    [
      conversations,
      selectedConversationId,
    ],
  );

  const loadConversations =
    useCallback(async () => {
      try {
        const data =
          await requestJson<Conversation[]>(
            "/conversations",
          );

        setConversations(data);

        setSelectedConversationId(
          (currentId) => {
            const currentStillExists =
              data.some(
                (conversation) =>
                  conversation.id ===
                  currentId,
              );

            if (currentStillExists) {
              return currentId;
            }

            return data[0]?.id ?? null;
          },
        );

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

    const intervalId =
      window.setInterval(() => {
        void loadConversations();
      }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadConversations]);

  async function sendMessage(
    conversationId: string,
    content: string,
  ): Promise<void> {
    if (isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await requestJson<Message>(
        `/conversations/${conversationId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            clientMessageId: generateUuid(),
            senderType: "TECHNICIAN",
            senderLabel:
              "Support informatique",
            content,
          }),
        },
      );

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

  async function changeStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<void> {
    setError(null);

    try {
      await requestJson<Conversation>(
        `/conversations/${conversationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        },
      );

      await loadConversations();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Impossible de modifier le statut.",
      );
    }
  }

  async function deleteConversation(
    conversationId: string,
  ): Promise<void> {
    setError(null);

    try {
      await requestJson<void>(
        `/conversations/${conversationId}`,
        {
          method: "DELETE",
        },
      );

      setConversations(
        (currentConversations) =>
          currentConversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          ),
      );

      setSelectedConversationId(null);

      await loadConversations();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la conversation.",
      );
    }
  }

  async function createGlpiTicket(
    conversationId: string,
  ): Promise<void> {
    setError(null);

    /*
     * Temporaire :
     * cette fonction sera remplacée par l'appel
     * à notre future route NestJS /glpi-ticket.
     */

    console.log(
      "Création GLPI pour la conversation :",
      conversationId,
    );

    window.alert(
      "Le bouton fonctionne. La connexion à l’API GLPI sera ajoutée ensuite.",
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      {error && (
        <div className="fixed left-1/2 top-5 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          <div className="flex items-start justify-between gap-4">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError(null)}
              className="shrink-0 font-semibold text-red-500 hover:text-red-700"
              aria-label="Fermer le message d’erreur"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <section className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200">
          <header className="border-b border-slate-200 p-5">
            <h1 className="text-lg font-bold text-slate-950">
              Support informatique
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {conversations.length}{" "}
              conversation
              {conversations.length > 1
                ? "s"
                : ""}
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
                    Une conversation apparaîtra
                    dès qu’un utilisateur ouvrira
                    le client.
                  </p>
                </div>
              )}

            {conversations.map(
              (conversation) => {
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
                        {conversation.device
                          .lastWindowsUser ??
                          conversation.openedByUsername}
                      </p>

                      <span className="shrink-0 text-[11px] text-slate-400">
                        {formatTime(
                          conversation.updatedAt,
                        )}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs font-medium text-slate-500">
                      {
                        conversation.device
                          .computerName
                      }
                    </p>

                    <p className="mt-2 truncate text-sm text-slate-500">
                      {lastMessage?.content ??
                        "Nouvelle conversation"}
                    </p>

                    <span
                      className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ring-1 ${getStatusClasses(
                        conversation.status,
                      )}`}
                    >
                      {getStatusLabel(
                        conversation.status,
                      )}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </aside>

        <ChatPanel
          conversation={selectedConversation}
          onSendMessage={sendMessage}
          onChangeStatus={changeStatus}
          onCreateGlpiTicket={
            createGlpiTicket
          }
          onDeleteConversation={
            deleteConversation
          }
        />
      </section>
    </main>
  );
}