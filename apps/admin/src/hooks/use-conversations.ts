"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  io,
  type Socket,
} from "socket.io-client";

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
  Message,
} from "@/types/conversation";

type UseConversationsOptions = {
  enabled: boolean;
};

type DeletedConversationPayload = {
  conversationId: string;
};

type UnreadConversations = Record<
  string,
  number
>;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:7000";

function sortConversations(
  conversations: Conversation[],
): Conversation[] {
  return [...conversations].sort(
    (first, second) =>
      new Date(second.updatedAt).getTime() -
      new Date(first.updatedAt).getTime(),
  );
}

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

  const [
    unreadByConversation,
    setUnreadByConversation,
  ] = useState<UnreadConversations>({});

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

  const totalUnread = useMemo(
    () =>
      Object.values(
        unreadByConversation,
      ).reduce(
        (total, count) =>
          total + count,
        0,
      ),
    [unreadByConversation],
  );

  const loadConversations =
    useCallback(async () => {
      try {
        const data =
          await fetchConversations();

        setConversations(
          sortConversations(data),
        );
            setSelectedConversationId(
            (currentId) => {
                const currentStillExists =
                data.some(
                    (conversation) =>
                    conversation.id === currentId,
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

    const receivedMessageIdsRef =
  useRef<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    void loadConversations();

    const intervalId =
      window.setInterval(() => {
        void loadConversations();
      }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    enabled,
    loadConversations,
  ]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket: Socket = io(
      `${API_URL}/support`,
      {
        withCredentials: true,
        transports: [
          "websocket",
          "polling",
        ],
      },
    );

    function handleConversationCreated(
      conversation: Conversation,
    ): void {
      setConversations(
        (currentConversations) => {
          const alreadyExists =
            currentConversations.some(
              (currentConversation) =>
                currentConversation.id ===
                conversation.id,
            );

          if (alreadyExists) {
            return currentConversations;
          }

          return sortConversations([
            conversation,
            ...currentConversations,
          ]);
        },
      );

      setUnreadByConversation(
        (currentUnread) => ({
          ...currentUnread,
          [conversation.id]:
            currentUnread[
              conversation.id
            ] ?? 1,
        }),
      );
    }

function handleMessageCreated(
  message: Message,
): void {
  if (
    receivedMessageIdsRef.current.has(
      message.id,
    )
  ) {
    return;
  }

  receivedMessageIdsRef.current.add(
    message.id,
  );

  setConversations(
    (currentConversations) =>
      sortConversations(
        currentConversations.map(
          (conversation) => {
            if (
              conversation.id !==
              message.conversationId
            ) {
              return conversation;
            }

            const messageAlreadyExists =
              conversation.messages.some(
                (currentMessage) =>
                  currentMessage.id ===
                  message.id,
              );

            if (messageAlreadyExists) {
              return conversation;
            }

            return {
              ...conversation,
              updatedAt:
                message.createdAt,
              messages: [
                ...conversation.messages,
                message,
              ],
            };
          },
        ),
      ),
  );

  if (
    message.senderType !== "CLIENT"
  ) {
    return;
  }

  playNotificationSound();

  setSelectedConversationId(
    (currentSelectedId) => {
      if (
        currentSelectedId ===
        message.conversationId
      ) {
        return currentSelectedId;
      }

      setUnreadByConversation(
        (currentUnread) => ({
          ...currentUnread,

          [message.conversationId]:
            (currentUnread[
              message.conversationId
            ] ?? 0) + 1,
        }),
      );

      return currentSelectedId;
    },
  );
}

    function handleConversationUpdated(
      conversation: Conversation,
    ): void {
      setConversations(
        (currentConversations) => {
          const alreadyExists =
            currentConversations.some(
              (currentConversation) =>
                currentConversation.id ===
                conversation.id,
            );

          if (!alreadyExists) {
            return sortConversations([
              conversation,
              ...currentConversations,
            ]);
          }

          return sortConversations(
            currentConversations.map(
              (currentConversation) =>
                currentConversation.id ===
                conversation.id
                  ? conversation
                  : currentConversation,
            ),
          );
        },
      );
    }

    function handleConversationDeleted({
      conversationId,
    }: DeletedConversationPayload): void {
      setConversations(
        (currentConversations) =>
          currentConversations.filter(
            (conversation) =>
              conversation.id !==
              conversationId,
          ),
      );

      setUnreadByConversation(
        (currentUnread) => {
          const nextUnread = {
            ...currentUnread,
          };

          delete nextUnread[
            conversationId
          ];

          return nextUnread;
        },
      );

        setSelectedConversationId(
        (currentSelectedId) =>
            currentSelectedId === conversationId
            ? null
            : currentSelectedId,
        );
    }

    function handleConnect(): void {
      setError(null);
    }

    function handleConnectError(): void {
      setError(
        "Connexion temps réel indisponible. Actualisation de secours active.",
      );
    }

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "connect_error",
      handleConnectError,
    );

    socket.on(
      "conversation:created",
      handleConversationCreated,
    );

    socket.on(
      "message:created",
      handleMessageCreated,
    );

    socket.on(
      "conversation:updated",
      handleConversationUpdated,
    );

    socket.on(
      "conversation:deleted",
      handleConversationDeleted,
    );

    return () => {
      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "connect_error",
        handleConnectError,
      );

      socket.off(
        "conversation:created",
        handleConversationCreated,
      );

      socket.off(
        "message:created",
        handleMessageCreated,
      );

      socket.off(
        "conversation:updated",
        handleConversationUpdated,
      );

      socket.off(
        "conversation:deleted",
        handleConversationDeleted,
      );

      socket.disconnect();
    };
  }, [enabled]);

const selectConversation =
  useCallback(
    (
      conversationId: string,
    ): void => {
      setSelectedConversationId(
        conversationId,
      );

      setUnreadByConversation(
        (currentUnread) => ({
          ...currentUnread,
          [conversationId]: 0,
        }),
      );
    },
    [],
  );

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

      /*
       * Le WebSocket mettra normalement
       * l’interface à jour.
       *
       * Ce chargement sert de sécurité
       * en cas de problème temps réel.
       */
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

function playNotificationSound() {
  const audio =
    new Audio(
      "/sounds/notification.mp3",
    );

  audio.volume = 0.5;

  void audio.play().catch(
    (error) => {
      console.warn(
        "Lecture du son bloquée :",
        error,
      );
    },
  );
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

      setUnreadByConversation(
        (currentUnread) => {
          const nextUnread = {
            ...currentUnread,
          };

          delete nextUnread[
            conversationId
          ];

          return nextUnread;
        },
      );

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

    unreadByConversation,
    totalUnread,

    isLoading,
    isSending,
    error,

    setError,
    selectConversation,

    sendMessage,
    changeStatus,
    deleteConversation,
    createGlpiTicket,
  };
}