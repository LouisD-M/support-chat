import type {
  Conversation,
  Message,
} from "@/types/conversation";

import type {
  Device,
} from "@/types/device";

import {
  requestJson,
} from "./api-client";

import {
  getDeviceIdentity,
} from "./device-identity";

import {
  generateUuid,
} from "./chat-utils";

export async function fetchConversation(
  conversationId: string,
): Promise<Conversation> {
  return requestJson<Conversation>(
    `/conversations/${conversationId}`,
  );
}

export async function createConversation():
  Promise<Conversation> {
  const identity =
    await getDeviceIdentity();

  const device =
    await requestJson<Device>(
      "/devices/register",
      {
        method: "POST",

        body: JSON.stringify(
          identity,
        ),
      },
    );

  return requestJson<Conversation>(
    "/conversations",
    {
      method: "POST",

      body: JSON.stringify({
        subject:
          "Demande d’assistance",

        openedByUsername:
          identity.lastWindowsUser ??
          "Utilisateur",

        deviceId:
          device.id,
      }),
    },
  );
}

export async function sendClientMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  return requestJson<Message>(
    `/conversations/${conversationId}/messages/client`,
    {
      method: "POST",

      body: JSON.stringify({
        clientMessageId:
          generateUuid(),

        content:
          content.trim(),
      }),
    },
  );
}