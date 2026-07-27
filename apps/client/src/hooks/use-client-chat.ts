"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
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

  const notificationAudioRef =
    useRef<HTMLAudioElement | null>(
      null,
    );

  const knownMessageIdsRef =
    useRef<Set<string>>(
      new Set(),
    );

 useEffect(() => {
  const audio = new Audio(
    "./sounds/notification.mp3",
  );

  audio.volume = 0.5;
  audio.preload = "auto";

  audio.addEventListener(
    "canplaythrough",
    () => {
      console.log(
        "Son chargé correctement",
      );
    },
  );

  audio.addEventListener(
    "error",
    () => {
      console.error(
        "Erreur chargement audio",
        audio.error,
        audio.src,
      );
    },
  );

  audio.load();

  notificationAudioRef.current =
    audio;

  return () => {
    audio.pause();
    notificationAudioRef.current =
      null;
  };
}, []);

  useEffect(() => {
    let isCancelled = false;

    async function getOrCreateConversation():
      Promise<Conversation> {
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

    async function initializeChat():
      Promise<void> {
      setIsLoading(true);
      setError(null);

      try {
        bootstrapPromise ??=
          getOrCreateConversation();

        const loadedConversation =
          await bootstrapPromise;

        if (isCancelled) {
          return;
        }

        knownMessageIdsRef.current =
          new Set(
            loadedConversation.messages.map(
              (message) =>
                message.id,
            ),
          );

        setConversation(
          loadedConversation,
        );
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
              const newTechnicianMessages =
                updatedConversation.messages.filter(
                  (message) =>
                    message.senderType ===
                      "TECHNICIAN" &&
                    !knownMessageIdsRef.current.has(
                      message.id,
                    ),
                );

              for (
                const message
                of updatedConversation.messages
              ) {
                knownMessageIdsRef.current.add(
                  message.id,
                );
              }

if (
  newTechnicianMessages.length > 0
) {
  playNotificationSound();

  const latestMessage =
    newTechnicianMessages[
      newTechnicianMessages.length - 1
    ];

  void showDesktopNotification(
    latestMessage,
  );
}

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

async function showDesktopNotification(
  message: Message,
): Promise<void> {
  try {
    let permissionGranted =
      await isPermissionGranted();

    if (!permissionGranted) {
      const permission =
        await requestPermission();

      permissionGranted =
        permission === "granted";
    }

    if (!permissionGranted) {
      return;
    }

    sendNotification({
      title: "Support informatique",
      body:
        message.content ||
        "Vous avez reçu une nouvelle réponse.",
    });
  } catch (notificationError) {
    console.warn(
      "Notification Windows impossible :",
      notificationError,
    );
  }
}

  function playNotificationSound():
    void {
    const audio =
      notificationAudioRef.current;

    if (!audio) {
      return;
    }

    audio.currentTime = 0;

    void audio.play().catch(
      (audioError) => {
        console.warn(
          "Lecture du son bloquée :",
          audioError,
        );
      },
    );
  }

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

      for (
        const currentMessage
        of updatedConversation.messages
      ) {
        knownMessageIdsRef.current.add(
          currentMessage.id,
        );
      }

      setConversation(
        updatedConversation,
      );

      return message;
    } catch (sendingError) {
      setError(
        sendingError instanceof Error
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