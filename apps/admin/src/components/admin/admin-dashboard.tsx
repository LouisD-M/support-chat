"use client";

import { ChatPanel } from "./chat-panel";
import {
  ConversationSidebar,
} from "./conversation-sidebar";
import {
  DashboardError,
} from "./dashboard-error";

import {
  useAdminSession,
} from "@/hooks/use-admin-session";

import {
  useConversations,
} from "@/hooks/use-conversations";

export function AdminDashboard() {
  const {
    user,
    isCheckingSession,
    logout,
  } = useAdminSession();

  const {
    conversations,
    selectedConversation,
    selectedConversationId,
    isLoading,
    isSending,
    error,

    setError,
    setSelectedConversationId,

    sendMessage,
    changeStatus,
    deleteConversation,
    createGlpiTicket,
  } = useConversations({
    enabled: Boolean(user),
  });

  if (isCheckingSession || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">
          Vérification de la session…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      {error && (
        <DashboardError
          message={error}
          onClose={() =>
            setError(null)
          }
        />
      )}

      <section className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <ConversationSidebar
          conversations={conversations}
          selectedConversationId={
            selectedConversationId
          }
          isLoading={isLoading}
          onSelectConversation={
            setSelectedConversationId
          }
          onLogout={() => {
            void logout();
          }}
        />

        <ChatPanel
          conversation={
            selectedConversation
          }
         // isSending={isSending}
          onSendMessage={sendMessage}
          onChangeStatus={changeStatus}
          onCreateGlpiTicket={
            createGlpiTicket
          }
          onDeleteConversation={
            deleteConversation
          }
        />
      </section>
    </main>
  );
}