import type { Device } from "./device";

export type ConversationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_USER"
  | "CLOSED";

export type SenderType =
  | "CLIENT"
  | "TECHNICIAN"
  | "SYSTEM";

export type Message = {
  id: string;
  clientMessageId: string | null;
  senderType: SenderType;
  senderLabel: string;
  content: string;
  createdAt: string;
  readAt: string | null;
};

export type Conversation = {
  id: string;
  subject: string | null;
  status: ConversationStatus;
  openedByUsername: string;
  deviceId: string;
  device: Device;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
};