"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createConversationGlpiTicket,
  fetchConversations,
  removeConversation,
  sendTechnicianMessage,
  updateConversationStatus,
} from "@/lib/conversations-api";

import type {
  Conversation,
  ConversationStatus,
} from "@/types/conversation";

type UseConversationsOptions = {
  enabled: boolean;
};

export function useConversations({
  enabled,
}: UseConversationsOptions) {
  const [
    conversations,
    setConversations,
  ] = useState<Conversation[]>([]);

  const [
    selectedConversationId,
    setSelectedConversationId,
  ] = useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSending, setIsSending] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedConversation = useMemo(
    () =>
      conversations.find(
        (conversation) =>
          conversation.id ===
          selectedConversationId,
      ) ?? null,
    [
      conversations,
      selectedConversationId,
    ],
  );

  const loadConversations =
    useCallback(async () => {
      try {
        const data =
          await fetchConversations();

        setConversations(data);

        setSelectedConversationId(
          (currentId) => {
            const currentStillExists =
              data.some(
                (conversation) =>
                  conversation.id ===
                  currentId,
              );

            if (currentStillExists) {
              return currentId;
            }

            return data[0]?.id ?? null;
          },
        );

        setError(null);
      } catch (loadingError) {
        setError(
          loadingError instanceof Error
            ? loadingError.message
            : "Impossible de charger les conversations.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadConversations();

    const intervalId =
      window.setInterval(() => {
        void loadConversations();
      }, 2500);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    enabled,
    loadConversations,
  ]);

  async function sendMessage(
    conversationId: string,
    content: string,
  ): Promise<void> {
    if (isSending) {
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      await sendTechnicianMessage(
        conversationId,
        content,
      );

      await loadConversations();
    } catch (sendingError) {
      setError(
        sendingError instanceof Error
          ? sendingError.message
          : "Impossible d’envoyer le message.",
      );
    } finally {
      setIsSending(false);
    }
  }

  async function changeStatus(
    conversationId: string,
    status: ConversationStatus,
  ): Promise<void> {
    setError(null);

    try {
      await updateConversationStatus(
        conversationId,
        status,
      );

      await loadConversations();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Impossible de modifier le statut.",
      );
    }
  }

  async function deleteConversation(
    conversationId: string,
  ): Promise<void> {
    setError(null);

    try {
      await removeConversation(
        conversationId,
      );

      setSelectedConversationId(null);

      await loadConversations();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Impossible de supprimer la conversation.",
      );
    }
  }

  async function createGlpiTicket(
    conversationId: string,
  ): Promise<void> {
    setError(null);

    try {
      await createConversationGlpiTicket(
        conversationId,
      );

      await loadConversations();
    } catch (glpiError) {
      setError(
        glpiError instanceof Error
          ? glpiError.message
          : "Impossible de créer le ticket GLPI.",
      );
    }
  }

  return {
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
  };
}