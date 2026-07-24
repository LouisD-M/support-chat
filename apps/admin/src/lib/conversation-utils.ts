import type {
  ConversationStatus,
} from "@/types/conversation";

export function generateUuid(): string {
  if (
    typeof window !== "undefined" &&
    typeof window.crypto?.randomUUID ===
      "function"
  ) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function formatTime(
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
    OPEN: "Ouverte",
    IN_PROGRESS: "En cours",
    WAITING_USER:
      "Attente utilisateur",
    CLOSED: "Fermée",
  };

  return labels[status];
}

export function getStatusClasses(
  status: ConversationStatus,
): string {
  const classes: Record<
    ConversationStatus,
    string
  > = {
    OPEN:
      "bg-green-50 text-green-700 ring-green-200",

    IN_PROGRESS:
      "bg-blue-50 text-blue-700 ring-blue-200",

    WAITING_USER:
      "bg-amber-50 text-amber-700 ring-amber-200",

    CLOSED:
      "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return classes[status];
}