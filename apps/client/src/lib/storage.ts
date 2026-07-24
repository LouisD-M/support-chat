import { generateUuid } from "./chat-utils";

const CONVERSATION_STORAGE_KEY =
  "support-chat:conversation-id";

const INSTALLATION_STORAGE_KEY =
  "support-chat:installation-id";

export function getStoredConversationId():
  string | null {
  return localStorage.getItem(
    CONVERSATION_STORAGE_KEY,
  );
}

export function storeConversationId(
  conversationId: string,
): void {
  localStorage.setItem(
    CONVERSATION_STORAGE_KEY,
    conversationId,
  );
}

export function removeStoredConversationId():
  void {
  localStorage.removeItem(
    CONVERSATION_STORAGE_KEY,
  );
}

export function getInstallationId():
  string {
  const existingInstallationId =
    localStorage.getItem(
      INSTALLATION_STORAGE_KEY,
    );

  if (existingInstallationId) {
    return existingInstallationId;
  }

  const installationId =
    generateUuid();

  localStorage.setItem(
    INSTALLATION_STORAGE_KEY,
    installationId,
  );

  return installationId;
}

export function storeInstallationId(
  installationId: string,
): void {
  localStorage.setItem(
    INSTALLATION_STORAGE_KEY,
    installationId,
  );
}