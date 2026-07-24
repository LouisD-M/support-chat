import { IsIn } from "class-validator";

export const conversationStatuses = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_USER",
  "CLOSED",
] as const;

export type ConversationStatusValue =
  (typeof conversationStatuses)[number];

export class UpdateConversationStatusDto {
  @IsIn(conversationStatuses)
  status!: ConversationStatusValue;
}