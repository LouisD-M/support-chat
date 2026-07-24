import type { Message } from "@/types/conversation";
import { formatMessageTime } from "@/lib/chat-utils";

type ChatMessageProps = {
  message: Message;
};

export function ChatMessage({
  message,
}: ChatMessageProps) {
  if (message.senderType === "SYSTEM") {
    return (
      <p className="py-2 text-center text-xs text-slate-400">
        {message.content}
      </p>
    );
  }

  const isClientMessage =
    message.senderType === "CLIENT";

  return (
    <div
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
            {formatMessageTime(message.createdAt)}
          </span>
        </div>

        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.content}
        </p>
      </div>
    </div>
  );
}