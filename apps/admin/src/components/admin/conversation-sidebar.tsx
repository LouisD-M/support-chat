import {
  ConversationListItem,
} from "./conversation-list-item";

import type {
  Conversation,
} from "@/types/conversation";

type ConversationSidebarProps = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  unreadByConversation: Record<string, number>;
  totalUnread: number;
  isLoading: boolean;
  onSelectConversation: (
    conversationId: string,
  ) => void;
  onLogout: () => void;
};
export function ConversationSidebar({
  conversations,
  selectedConversationId,
  unreadByConversation,
  totalUnread,
  isLoading,
  onSelectConversation,
  onLogout,
}: ConversationSidebarProps) {
  return (
    <aside className="flex w-80 shrink-0 flex-col border-r border-slate-200">
      <header className="border-b border-slate-200 p-5">
        <h1 className="text-lg font-bold text-slate-950">
          Support informatique
        </h1>

<div className="mt-1 flex items-center gap-2">
  <p className="text-sm text-slate-500">
    {conversations.length} conversation
    {conversations.length > 1
      ? "s"
      : ""}
  </p>

  {totalUnread > 0 && (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-semibold text-white">
      {totalUnread}
    </span>
  )}
</div>

        <button
          type="button"
          onClick={onLogout}
          className="mt-4 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Déconnexion
        </button>
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
                Une conversation apparaîtra dès
                qu’un utilisateur ouvrira le
                client.
              </p>
            </div>
          )}

        {conversations.map(
          (conversation) => (
<ConversationListItem
  key={conversation.id}
  conversation={conversation}
  isSelected={
    conversation.id ===
    selectedConversationId
  }
  unreadCount={
    unreadByConversation[
      conversation.id
    ] ?? 0
  }
  onSelect={() =>
    onSelectConversation(
      conversation.id,
    )
  }
/>
          ),
        )}
      </div>
    </aside>
  );
}