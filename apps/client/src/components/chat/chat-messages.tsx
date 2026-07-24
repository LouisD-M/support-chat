import type { RefObject } from "react";

import type { Message } from "@/types/conversation";

import { ChatEmptyState } from "./chat-empty-state";
import { ChatMessage } from "./chat-message";

type ChatMessagesProps = {
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
};

export function ChatMessages({
  messages,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-4">
        <div className="flex justify-center">
          <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-400 shadow-sm ring-1 ring-slate-200">
            Conversation avec le support
          </span>
        </div>

        {messages.length === 0 && (
          <ChatEmptyState />
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}