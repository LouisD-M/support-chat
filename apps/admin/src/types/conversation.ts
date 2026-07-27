export type ConversationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_USER"
  | "CLOSED";

export type SenderType =
  | "CLIENT"
  | "TECHNICIAN"
  | "SYSTEM";

export type Device = {
  id: string;
  installationId: string;
  computerName: string;
  domain: string | null;
  lastWindowsUser: string | null;
  lastSeenAt: string;

  osName: string | null;
  osVersion: string | null;
  ipAddress: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderType:
    | "CLIENT"
    | "TECHNICIAN"
    | "SYSTEM";
  senderLabel: string;
  content: string;
  createdAt: string;
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
  glpiTicketId?: string | null;
};