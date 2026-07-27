import {
  formatTime,
  getStatusClasses,
  getStatusLabel,
} from "@/lib/conversation-utils";

import type {
  Conversation,
} from "@/types/conversation";

type ConversationListItemProps = {
  conversation: Conversation;
  isSelected: boolean;
  unreadCount: number;
  onSelect: () => void;
};

export function ConversationListItem({
  conversation,
  isSelected,
  unreadCount,
  onSelect,
}: ConversationListItemProps) {
  const lastMessage =
    conversation.messages.at(-1);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full border-b border-slate-100 p-4 text-left transition ${
        isSelected
          ? "bg-blue-50"
          : unreadCount > 0
            ? "bg-blue-50/50 hover:bg-blue-50"
            : "hover:bg-slate-50"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={`truncate text-sm text-slate-900 ${
            unreadCount > 0
              ? "font-bold"
              : "font-semibold"
          }`}
        >
          {conversation.device
            .lastWindowsUser ??
            conversation.openedByUsername}
        </p>

        <div className="flex shrink-0 items-center gap-2">
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {unreadCount}
            </span>
          )}

          <span className="text-[11px] text-slate-400">
            {formatTime(
              conversation.updatedAt,
            )}
          </span>
        </div>
      </div>

      <p className="mt-1 truncate text-xs font-medium text-slate-500">
        {conversation.device.computerName}
      </p>

      <p
        className={`mt-2 truncate text-sm ${
          unreadCount > 0
            ? "font-medium text-slate-700"
            : "text-slate-500"
        }`}
      >
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
}