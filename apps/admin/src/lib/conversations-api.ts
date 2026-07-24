import { requestJson } from "./api-client";
import { generateUuid } from "./conversation-utils";

import type {
  Conversation,
  ConversationStatus,
  Message,
} from "@/types/conversation";

export function fetchConversations():
Promise<Conversation[]> {
  return requestJson<Conversation[]>(
    "/conversations",
  );
}

export function sendTechnicianMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  return requestJson<Message>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        clientMessageId:
          generateUuid(),

        senderType: "TECHNICIAN",

        senderLabel:
          "Support informatique",

        content,
      }),
    },
  );
}

export function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
): Promise<Conversation> {
  return requestJson<Conversation>(
    `/conversations/${conversationId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}

export function removeConversation(
  conversationId: string,
): Promise<void> {
  return requestJson<void>(
    `/conversations/${conversationId}`,
    {
      method: "DELETE",
    },
  );
}

export function createConversationGlpiTicket(
  conversationId: string,
): Promise<Conversation> {
  return requestJson<Conversation>(
    `/conversations/${conversationId}/glpi-ticket`,
    {
      method: "POST",
    },
  );
}