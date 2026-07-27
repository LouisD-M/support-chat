"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  Conversation,
  Message,
} from "@/types/conversation";

import {
  ApiError,
} from "@/lib/api-client";

import {
  createConversation,
  fetchConversation,
  registerDevice,
  sendClientMessage,
} from "@/lib/conversations-api";

import {
  getDeviceIdentity,
} from "@/lib/device-identity";

import {
  getStoredConversationId,
  removeStoredConversationId,
  storeConversationId,
} from "@/lib/storage";

let bootstrapPromise:
  Promise<Conversation> | null = null;

export function useClientChat() {
  const [
    conversation,
    setConversation,
  ] =
    useState<Conversation | null>(
      null,
    );

  const [
    draft,
    setDraft,
  ] =
    useState("");

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true);

  const [
    isSending,
    setIsSending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function getOrCreateConversation() {
      const identity =
        await getDeviceIdentity();

      console.log(
        "Identité récupérée :",
        identity,
      );

      const device =
        await registerDevice(
          identity,
        );

      console.log(
        "Device enregistré :",
        device,
      );

      const storedConversationId =
        getStoredConversationId();

      if (storedConversationId) {
        try {
          return await fetchConversation(
            storedConversationId,
          );
        } catch (fetchError) {
          if (
            fetchError instanceof
              ApiError &&
            fetchError.status === 404
          ) {
            removeStoredConversationId();
          } else {
            throw fetchError;
          }
        }
      }

      const createdConversation =
        await createConversation(
          device.id,
          identity.lastWindowsUser ??
            "Utilisateur",
        );

      storeConversationId(
        createdConversation.id,
      );

      return createdConversation;
    }

    async function initializeChat() {
      setIsLoading(true);
      setError(null);

      try {
        bootstrapPromise ??=
          getOrCreateConversation();

        const loadedConversation =
          await bootstrapPromise;

        if (!isCancelled) {
          setConversation(
            loadedConversation,
          );
        }
      } catch (
        initializationError
      ) {
        bootstrapPromise = null;

        console.error(
          "Erreur initialisation :",
          initializationError,
        );

        if (!isCancelled) {
          setError(
            initializationError
              instanceof Error
              ? initializationError
                  .message
              : "Impossible d’ouvrir la conversation.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void initializeChat();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    const conversationId =
      conversation.id;

    const intervalId =
      window.setInterval(() => {
        void fetchConversation(
          conversationId,
        )
          .then(
            (
              updatedConversation,
            ) => {
              setConversation(
                updatedConversation,
              );

              setError(null);
            },
          )
          .catch(() => {
            // Une erreur temporaire
            // de polling ne masque pas le chat.
          });
      }, 2500);

    return () => {
      window.clearInterval(
        intervalId,
      );
    };
  }, [conversation?.id]);

  async function sendMessage():
    Promise<Message | null> {
    const content =
      draft.trim();

    if (
      !content ||
      !conversation ||
      isSending ||
      conversation.status ===
        "CLOSED"
    ) {
      return null;
    }

    setIsSending(true);
    setError(null);

    try {
      const message =
        await sendClientMessage(
          conversation.id,
          content,
        );

      setDraft("");

      const updatedConversation =
        await fetchConversation(
          conversation.id,
        );

      setConversation(
        updatedConversation,
      );

      return message;
    } catch (sendingError) {
      setError(
        sendingError
          instanceof Error
          ? sendingError.message
          : "Le message n’a pas pu être envoyé.",
      );

      return null;
    } finally {
      setIsSending(false);
    }
  }

  return {
    conversation,
    draft,
    error,
    isLoading,
    isSending,
    setDraft,
    sendMessage,
  };
}