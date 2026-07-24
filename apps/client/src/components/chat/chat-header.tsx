import type { Conversation } from "@/types/conversation";
import { getStatusLabel } from "@/lib/chat-utils";

type ChatHeaderProps = {
  conversation: Conversation;
};

export function ChatHeader({
  conversation,
}: ChatHeaderProps) {
  return (
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
            <span
              className={`size-2 rounded-full ${
                conversation.status === "CLOSED"
                  ? "bg-slate-400"
                  : "bg-emerald-500"
              }`}
            />

            <p className="truncate text-xs text-slate-500">
              {getStatusLabel(conversation.status)}
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
  );
}