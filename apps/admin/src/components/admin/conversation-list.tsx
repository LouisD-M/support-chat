import {
  CircleDot,
  Clock3,
  MessageCircle,
  Monitor,
  Search,
} from "lucide-react";

import type {
  Conversation,
  ConversationStatus,
} from "@/types/conversation";

type ConversationListProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
};

const statusLabels: Record<ConversationStatus, string> = {
  OPEN: "Ouverte",
  IN_PROGRESS: "En cours",
  WAITING_USER: "En attente",
  CLOSED: "Fermée",
};

const statusClasses: Record<ConversationStatus, string> = {
  OPEN: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  WAITING_USER: "bg-violet-50 text-violet-700 ring-violet-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">Support Chat</p>
            <h1 className="mt-1 text-xl font-semibold text-slate-950">
              Demandes utilisateurs
            </h1>
          </div>

          <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <MessageCircle className="size-5" />
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <input
            type="search"
            placeholder="Rechercher une demande..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Conversations
        </span>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {conversations.length}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => {
          const isSelected =
            conversation.id === selectedConversationId;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() => onSelectConversation(conversation.id)}
              className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                isSelected
                  ? "bg-blue-50 ring-1 ring-blue-100"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {conversation.username
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {conversation.username}
                    </p>

                    <span className="shrink-0 text-xs text-slate-400">
                      {conversation.lastMessageAt}
                    </span>
                  </div>

                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {conversation.subject}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        statusClasses[conversation.status]
                      }`}
                    >
                      <CircleDot className="size-3" />
                      {statusLabels[conversation.status]}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Monitor className="size-3" />
                      {conversation.computerName}
                    </span>
                  </div>
                </div>

                {conversation.unreadCount > 0 && (
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
        <Clock3 className="size-4" />
        Mise à jour en temps réel prochainement
      </div>
    </aside>
  );
}