import type {
  ConversationStatus,
} from "@/types/conversation";

export function formatMessageTime(
  date: string,
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(date));
}

export function getStatusLabel(
  status: ConversationStatus,
): string {
  const labels: Record<
    ConversationStatus,
    string
  > = {
    OPEN: "Demande ouverte",
    IN_PROGRESS: "Prise en charge",
    WAITING_USER:
      "En attente de votre réponse",
    CLOSED: "Conversation terminée",
  };

  return labels[status];
}

export function generateUuid():
  string {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID ===
      "function"
  ) {
    return window.crypto.randomUUID();
  }

  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.getRandomValues ===
      "function"
  ) {
    const bytes =
      new Uint8Array(16);

    window.crypto.getRandomValues(
      bytes,
    );

    bytes[6] =
      (bytes[6] & 0x0f) | 0x40;

    bytes[8] =
      (bytes[8] & 0x3f) | 0x80;

    const hexadecimal =
      Array.from(
        bytes,
        (byte) =>
          byte
            .toString(16)
            .padStart(2, "0"),
      ).join("");

    return [
      hexadecimal.slice(0, 8),
      hexadecimal.slice(8, 12),
      hexadecimal.slice(12, 16),
      hexadecimal.slice(16, 20),
      hexadecimal.slice(20),
    ].join("-");
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}