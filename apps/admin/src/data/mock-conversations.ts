import type { Conversation } from "@/types/conversation";

export const mockConversations: Conversation[] = [
  {
    id: "conversation-1",
    username: "Julie Dupont",
    computerName: "PC-FORMATEUR-07",
    subject: "Problème d’impression",
    status: "OPEN",
    unreadCount: 2,
    lastMessageAt: "08:42",
    messages: [
      {
        id: "message-1",
        senderType: "CLIENT",
        senderLabel: "Julie Dupont",
        content:
          "Bonjour, je n’arrive plus à imprimer sur l’imprimante du deuxième étage.",
        createdAt: "08:40",
      },
      {
        id: "message-2",
        senderType: "CLIENT",
        senderLabel: "Julie Dupont",
        content: "L’impression reste bloquée dans la file d’attente.",
        createdAt: "08:42",
      },
    ],
  },
  {
    id: "conversation-2",
    username: "Marc Lefèvre",
    computerName: "PC-SECRETARIAT-02",
    subject: "Accès à MesCoursJV",
    status: "IN_PROGRESS",
    unreadCount: 0,
    lastMessageAt: "Hier",
    messages: [
      {
        id: "message-3",
        senderType: "CLIENT",
        senderLabel: "Marc Lefèvre",
        content: "Mon mot de passe MesCoursJV ne fonctionne plus.",
        createdAt: "Hier, 15:20",
      },
      {
        id: "message-4",
        senderType: "TECHNICIAN",
        senderLabel: "Support informatique",
        content:
          "Bonjour Marc, je vérifie votre compte et je reviens vers vous.",
        createdAt: "Hier, 15:24",
      },
    ],
  },
  {
    id: "conversation-3",
    username: "Sophie Martin",
    computerName: "PC-SALLE-204-03",
    subject: "Écran sans affichage",
    status: "WAITING_USER",
    unreadCount: 0,
    lastMessageAt: "Lundi",
    messages: [
      {
        id: "message-5",
        senderType: "CLIENT",
        senderLabel: "Sophie Martin",
        content: "L’écran de la salle 204 affiche Aucun signal.",
        createdAt: "Lundi, 10:12",
      },
      {
        id: "message-6",
        senderType: "TECHNICIAN",
        senderLabel: "Support informatique",
        content:
          "Pouvez-vous vérifier que le câble HDMI est correctement branché ?",
        createdAt: "Lundi, 10:15",
      },
    ],
  },
];