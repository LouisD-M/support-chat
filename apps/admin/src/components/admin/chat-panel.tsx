import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  Monitor,
  Send,
  TicketPlus,
  UserRound,
} from "lucide-react";

import type {
  Conversation,
  ConversationStatus,
} from "@/types/conversation";

type ChatPanelProps = {
  conversation: Conversation | null;
  onSendMessage: (conversationId: string, content: string) => void;
  onChangeStatus: (
    conversationId: string,
    status: ConversationStatus,
  ) => void;
};

const statusLabels: Record<ConversationStatus, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  WAITING_USER: "En attente utilisateur",
  CLOSED: "Fermée",
};

export function ChatPanel({
  conversation,
  onSendMessage,
  onChangeStatus,
}: ChatPanelProps) {
  const [content, setContent] = useState("");

  if (!conversation) {
    return (
      <section className="flex items-center justify-center bg-slate-50 p-8">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <TicketPlus className="size-6 text-slate-500" />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">
            Sélectionnez une conversation
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choisissez une demande utilisateur dans la liste pour consulter
            les messages et répondre.
          </p>
        </div>
      </section>
    );
  }
  const conversationId = conversation.id;
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    onSendMessage(conversationId, trimmedContent);
    setContent("");
  }

  return (
    <section className="flex min-h-0 flex-col bg-slate-50">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            {conversation.subject}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3.5" />
              {conversation.username}
            </span>

            <span className="inline-flex items-center gap-1">
              <Monitor className="size-3.5" />
              {conversation.computerName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={conversation.status}
            onChange={(event) =>
              onChangeStatus(
                conversation.id,
                event.target.value as ConversationStatus,
              )
            }
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled
            title="Disponible dans une prochaine version"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-500 opacity-60"
          >
            <TicketPlus className="size-4" />
            Créer GLPI
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <div className="flex justify-center">
            <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm ring-1 ring-slate-200">
              Début de la conversation
            </span>
          </div>

          {conversation.messages.map((message) => {
            const isTechnician = message.senderType === "TECHNICIAN";
            const isSystem = message.senderType === "SYSTEM";

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
                  isTechnician ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                    isTechnician
                      ? "rounded-br-md bg-slate-950 text-white"
                      : "rounded-bl-md bg-white text-slate-800 ring-1 ring-slate-200"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        isTechnician
                          ? "text-slate-200"
                          : "text-slate-500"
                      }`}
                    >
                      {message.senderLabel}
                    </span>

                    <span
                      className={`text-[11px] ${
                        isTechnician
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      {message.createdAt}
                    </span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {message.content}
                  </p>

                  {isTechnician && (
                    <div className="mt-1 flex justify-end">
                      <CheckCircle2 className="size-3.5 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white p-4"
      >
        <div className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Écrire une réponse..."
            rows={2}
            className="min-h-12 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />

          <button
            type="submit"
            disabled={!content.trim()}
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