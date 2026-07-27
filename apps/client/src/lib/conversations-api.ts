import type {
  Conversation,
  Message,
} from "@/types/conversation";

import type {
  Device,
  DeviceIdentity,
} from "@/types/device";

import {
  requestJson,
} from "./api-client";

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

export async function registerDevice(
  identity: DeviceIdentity,
): Promise<Device> {
  return requestJson<Device>(
    "/devices/register",
    {
      method: "POST",
      body: JSON.stringify(identity),
    },
  );
}

export async function createConversation(
  deviceId: string,
  openedByUsername: string,
): Promise<Conversation> {
  return requestJson<Conversation>(
    "/conversations",
    {
      method: "POST",

      body: JSON.stringify({
        subject: "Demande d’assistance",
        openedByUsername,
        deviceId,
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
        clientMessageId: generateUuid(),
        content: content.trim(),
      }),
    },
  );
}