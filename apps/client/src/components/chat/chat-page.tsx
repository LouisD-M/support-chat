"use client";

import {
  FormEvent,
  useEffect,
  useRef,
} from "react";

import { useClientChat } from "@/hooks/use-client-chat";

import { ChatComposer } from "./chat-composer";
import { ChatError } from "./chat-error";
import { ChatHeader } from "./chat-header";
import { ChatLoading } from "./chat-loading";
import { ChatMessages } from "./chat-messages";

export function ChatPage() {
  const {
    conversation,
    draft,
    error,
    isLoading,
    isSending,
    setDraft,
    sendMessage,
  } = useClientChat();

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages.length]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    void sendMessage();
  }

  if (isLoading) {
    return <ChatLoading />;
  }

  if (!conversation) {
    return (
      <ChatError
        fullPage
        message={
          error ??
          "La conversation n’a pas pu être chargée."
        }
        onRetry={() =>
          window.location.reload()
        }
      />
    );
  }

  const isClosed =
    conversation.status === "CLOSED";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-0 sm:p-6">
      <section className="flex h-screen w-full flex-col overflow-hidden bg-white shadow-xl sm:h-[min(850px,calc(100vh-3rem))] sm:max-w-3xl sm:rounded-3xl sm:ring-1 sm:ring-slate-200">
        <ChatHeader
          conversation={conversation}
        />

        <ChatMessages
          messages={conversation.messages}
          messagesEndRef={messagesEndRef}
        />

        <ChatComposer
          draft={draft}
          error={error}
          isClosed={isClosed}
          isSending={isSending}
          onDraftChange={setDraft}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
}