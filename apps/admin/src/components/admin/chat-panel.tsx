import {
  FormEvent,
  useState,
} from "react";

import {
  CheckCircle2,
  Cpu,
  Monitor,
  Network,
  Send,
  TicketPlus,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  Conversation,
  ConversationStatus,
} from "@/types/conversation";

type ChatPanelProps = {
  conversation: Conversation | null;

  onSendMessage: (
    conversationId: string,
    content: string,
  ) => void;

  onChangeStatus: (
    conversationId: string,
    status: ConversationStatus,
  ) => void;

  onCreateGlpiTicket: (
    conversationId: string,
  ) => void;

  onDeleteConversation: (
    conversationId: string,
  ) => void;
};

const statusLabels: Record<
  ConversationStatus,
  string
> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  WAITING_USER:
    "En attente utilisateur",
  CLOSED: "Fermée",
};

function formatTime(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(date));
}

export function ChatPanel({
  conversation,
  onSendMessage,
  onChangeStatus,
  onCreateGlpiTicket,
  onDeleteConversation,
}: ChatPanelProps) {
  const [content, setContent] =
    useState("");

  if (!conversation) {
    return (
      <section className="flex min-w-0 flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <TicketPlus className="size-6 text-slate-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Sélectionnez une conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choisissez une demande
            utilisateur dans la liste pour
            consulter les messages et
            répondre.
          </p>
        </div>
      </section>
    );
  }

  const conversationId =
    conversation.id;

  const device =
    conversation.device;

  const systemLabel = [
    device.osName,
    device.osVersion,
  ]
    .filter(Boolean)
    .join(" ");

  const hardwareLabel = [
    device.manufacturer,
    device.model,
  ]
    .filter(Boolean)
    .join(" ");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedContent =
      content.trim();

    if (!trimmedContent) {
      return;
    }

    onSendMessage(
      conversationId,
      trimmedContent,
    );

    setContent("");
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950">
              {conversation.subject ??
                "Demande d’assistance"}
            </h2>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="size-3.5" />

                {device.lastWindowsUser ??
                  conversation.openedByUsername}
              </span>

              <span className="inline-flex items-center gap-1.5">
                <Monitor className="size-3.5" />

                {device.computerName}
              </span>

              {device.domain && (
                <span>
                  Domaine :{" "}
                  <span className="font-medium text-slate-700">
                    {device.domain}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={
                conversation.status
              }
              onChange={(event) =>
                onChangeStatus(
                  conversation.id,
                  event.target
                    .value as ConversationStatus,
                )
              }
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            >
              {Object.entries(
                statusLabels,
              ).map(
                ([value, label]) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {label}
                  </option>
                ),
              )}
            </select>

            <button
              type="button"
              onClick={() =>
                onCreateGlpiTicket(
                  conversation.id,
                )
              }
              disabled={
                conversation.status ===
                  "CLOSED" ||
                Boolean(
                  conversation.glpiTicketId,
                )
              }
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <TicketPlus className="size-4" />

              {conversation.glpiTicketId
                ? `GLPI n°${conversation.glpiTicketId}`
                : "Créer GLPI"}
            </button>

            <button
              type="button"
              onClick={() => {
                const confirmed =
                  window.confirm(
                    "Supprimer définitivement cette conversation et tous ses messages ?",
                  );

                if (confirmed) {
                  onDeleteConversation(
                    conversation.id,
                  );
                }
              }}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <Trash2 className="size-4" />

              Supprimer
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <Cpu className="size-3.5" />
              Système
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {systemLabel ||
                "Non renseigné"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <Network className="size-3.5" />
              Adresse IP
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {device.ipAddress ??
                "Non renseignée"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <Monitor className="size-3.5" />
              Matériel
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {hardwareLabel ||
                "Non renseigné"}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Numéro de série
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700">
              {device.serialNumber ??
                "Non renseigné"}
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="flex justify-center">
            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm ring-1 ring-slate-200">
              Début de la conversation
            </span>
          </div>

          {conversation.messages
            .length === 0 && (
            <p className="py-10 text-center text-sm text-slate-400">
              Aucun message pour le
              moment.
            </p>
          )}

          {conversation.messages.map(
            (message) => {
              const isTechnician =
                message.senderType ===
                "TECHNICIAN";

              const isSystem =
                message.senderType ===
                "SYSTEM";

              if (isSystem) {
                return (
                  <p
                    key={message.id}
                    className="text-center text-xs text-slate-400"
                  >
                    {message.content}
                  </p>
                );
              }

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
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isTechnician
                        ? "rounded-br-md bg-blue-600 text-white"
                        : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold ${
                          isTechnician
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {
                          message.senderLabel
                        }
                      </span>

                      <span
                        className={`text-[11px] ${
                          isTechnician
                            ? "text-blue-200"
                            : "text-slate-400"
                        }`}
                      >
                        {formatTime(
                          message.createdAt,
                        )}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>

                    {isTechnician && (
                      <div className="mt-1 flex justify-end">
                        <CheckCircle2 className="size-3.5 text-blue-200" />
                      </div>
                    )}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white p-4"
      >
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value,
              )
            }
            placeholder={
              conversation.status ===
              "CLOSED"
                ? "Cette conversation est fermée."
                : "Écrire une réponse..."
            }
            rows={2}
            disabled={
              conversation.status ===
              "CLOSED"
            }
            className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          />

          <button
            type="submit"
            disabled={
              !content.trim() ||
              conversation.status ===
                "CLOSED"
            }
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="size-4" />

            Envoyer
          </button>
        </div>
      </form>
    </section>
  );
}