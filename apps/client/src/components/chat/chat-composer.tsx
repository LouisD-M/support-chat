"use client";

import type {
  FormEvent,
  KeyboardEvent,
} from "react";

import { ChatError } from "./chat-error";

type ChatComposerProps = {
  draft: string;
  error: string | null;
  isClosed: boolean;
  isSending: boolean;
  onDraftChange: (value: string) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

export function ChatComposer({
  draft,
  error,
  isClosed,
  isSending,
  onDraftChange,
  onSubmit,
}: ChatComposerProps) {
  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <footer className="border-t border-slate-200 bg-white p-4 sm:p-5">
      {error && (
        <ChatError message={error} />
      )}

      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-2xl items-end gap-3"
      >
        <textarea
          value={draft}
          onChange={(event) =>
            onDraftChange(event.target.value)
          }
          onKeyDown={handleKeyDown}
          disabled={isClosed || isSending}
          placeholder={
            isClosed
              ? "Cette conversation est terminée."
              : "Décrivez votre problème…"
          }
          rows={2}
          className="min-h-12 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={
            !draft.trim() ||
            isSending ||
            isClosed
          }
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSending ? "Envoi…" : "Envoyer"}
        </button>
      </form>

      {!isClosed && (
        <p className="mx-auto mt-2 max-w-2xl text-xs text-slate-400">
          Entrée pour envoyer · Maj + Entrée pour revenir à la
          ligne
        </p>
      )}
    </footer>
  );
}