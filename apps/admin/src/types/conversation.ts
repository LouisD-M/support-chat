export type ConversationStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_USER"
  | "CLOSED";

export type MessageSender = "CLIENT" | "TECHNICIAN" | "SYSTEM";

export type Message = {
  id: string;
  senderType: MessageSender;
  senderLabel: string;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  username: string;
  computerName: string;
  subject: string;
  status: ConversationStatus;
  unreadCount: number;
  lastMessageAt: string;
  messages: Message[];
};