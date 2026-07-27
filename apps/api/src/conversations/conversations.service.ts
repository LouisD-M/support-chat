import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import {
  ConversationsGateway,
} from "./conversations.gateway";

import type {
  JwtPayload,
} from "../auth/auth.types";

import { GlpiService } from "../glpi/glpi.service";
import { PrismaService } from "../prisma/prisma.service";

import {
  CreateClientMessageDto,
} from "./dto/create-client-message.dto";

import {
  CreateConversationDto,
} from "./dto/create-conversation.dto";

import {
  CreateTechnicianMessageDto,
} from "./dto/create-technician-message.dto";

import type {
  ConversationStatusValue,
} from "./dto/update-conversation-status.dto";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly glpiService: GlpiService,
    private readonly conversationsGateway: ConversationsGateway,
  ) {}
  
async createClientMessage(
  conversationId: string,
  dto: CreateClientMessageDto,
) {
  const conversation =
    await this.findOne(
      conversationId,
    );

  if (
    conversation.status === "CLOSED"
  ) {
    throw new BadRequestException(
      "Cette conversation est fermée.",
    );
  }

  const [
    message,
    updatedConversation,
  ] = await this.prisma.$transaction([
    this.prisma.message.create({
      data: {
        conversationId,

        clientMessageId:
          dto.clientMessageId,

        senderType:
          "CLIENT",

        senderLabel:
          conversation.openedByUsername,

        content:
          dto.content.trim(),
      },
    }),

    this.prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        updatedAt:
          new Date(),
      },

      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
  ]);

  this.conversationsGateway
    .emitMessageCreated({
      ...message,
      conversationId,
    });

  this.conversationsGateway
    .emitConversationUpdated(
      updatedConversation,
    );

  return message;
}

async createTechnicianMessage(
  conversationId: string,
  dto: CreateTechnicianMessageDto,
  user: JwtPayload,
) {
  const conversation =
    await this.findOne(
      conversationId,
    );

  if (
    conversation.status === "CLOSED"
  ) {
    throw new BadRequestException(
      "Cette conversation est fermée.",
    );
  }

  const [
    message,
    updatedConversation,
  ] = await this.prisma.$transaction([
    this.prisma.message.create({
      data: {
        conversationId,

        clientMessageId:
          dto.clientMessageId,

        senderType:
          "TECHNICIAN",

        senderLabel:
          user.displayName,

        content:
          dto.content.trim(),
      },
    }),

    this.prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        status:
          "IN_PROGRESS",

        updatedAt:
          new Date(),
      },

      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
  ]);

  this.conversationsGateway
    .emitMessageCreated({
      ...message,
      conversationId,
    });

  this.conversationsGateway
    .emitConversationUpdated(
      updatedConversation,
    );

  return message;
}

  async findAll() {
    return this.prisma.conversation.findMany({
      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },

      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id,
        },

        include: {
          device: true,

          messages: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        "Conversation introuvable.",
      );
    }

    return conversation;
  }

async create(
  dto: CreateConversationDto,
) {
  const device =
    await this.prisma.device.findUnique({
      where: {
        id: dto.deviceId,
      },

      select: {
        id: true,
      },
    });

  if (!device) {
    throw new NotFoundException(
      "Le poste informatique est introuvable.",
    );
  }

  const conversation =
    await this.prisma.conversation.create({
      data: {
        subject:
          dto.subject ?? null,

        openedByUsername:
          dto.openedByUsername,

        deviceId:
          dto.deviceId,
      },

      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  this.conversationsGateway
    .emitConversationCreated(
      conversation,
    );

  return conversation;
}


async updateStatus(
  conversationId: string,
  status: ConversationStatusValue,
) {
  const conversation =
    await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
    });

  if (!conversation) {
    throw new NotFoundException(
      "Conversation introuvable.",
    );
  }

  if (
    conversation.status === "CLOSED" &&
    status !== "CLOSED"
  ) {
    throw new BadRequestException(
      "Une conversation fermée ne peut pas être rouverte.",
    );
  }

  const updatedConversation =
    await this.prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        status,

        closedAt:
          status === "CLOSED"
            ? new Date()
            : null,
      },

      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  this.conversationsGateway
    .emitConversationUpdated(
      updatedConversation,
    );

  return updatedConversation;
}

async remove(id: string) {
  const conversation =
    await this.prisma.conversation.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });

  if (!conversation) {
    throw new NotFoundException(
      "Conversation introuvable",
    );
  }

  await this.prisma.$transaction([
    this.prisma.message.deleteMany({
      where: {
        conversationId: id,
      },
    }),

    this.prisma.conversation.delete({
      where: {
        id,
      },
    }),
  ]);

  this.conversationsGateway
    .emitConversationDeleted(id);

  return {
    success: true,
    deletedConversationId: id,
  };
}

async createGlpiTicket(
  conversationId: string,
) {
  const conversation =
    await this.prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        device: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

  if (!conversation) {
    throw new NotFoundException(
      "Conversation introuvable",
    );
  }

  if (conversation.glpiTicketId) {
    throw new ConflictException(
      `Un ticket GLPI existe déjà pour cette conversation : ${conversation.glpiTicketId}`,
    );
  }

  const subject =
    conversation.subject?.trim() ||
    "Demande d’assistance informatique";

  const username =
    conversation.device.lastWindowsUser ||
    conversation.openedByUsername;

  const messageHistory =
    conversation.messages.length > 0
      ? conversation.messages
          .map((message) => {
            const date =
              new Intl.DateTimeFormat(
                "fr-FR",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                },
              ).format(
                message.createdAt,
              );

            return [
              `[${date}] ${message.senderLabel}`,
              message.content,
            ].join("\n");
          })
          .join("\n\n")
      : "Aucun message dans la conversation.";

  const ticketContent = [
    "Ticket créé automatiquement depuis Support Chat.",
    "",
    `Utilisateur : ${username}`,
    `Poste : ${conversation.device.computerName}`,
    `Domaine : ${conversation.device.domain ?? "Hors domaine"}`,
    `Identifiant installation : ${conversation.device.installationId}`,
    `Conversation Support Chat : ${conversation.id}`,
    "",
    "Historique de la conversation :",
    "",
    messageHistory,
  ].join("\n");

  const glpiTicket =
    await this.glpiService.createTicket({
      name: `[Support Chat] ${subject}`,
      content: ticketContent,
    });
const ticketId =
  String(glpiTicket.id);

const [, updatedConversation] =
  await this.prisma.$transaction([
    this.prisma.message.create({
      data: {
        conversationId:
          conversation.id,

        senderType:
          "SYSTEM",

        senderLabel:
          "Support Chat",

        content:
          `Le ticket GLPI n°${ticketId} a été créé. La conversation est maintenant fermée.`,
      },
    }),

    this.prisma.conversation.update({
      where: {
        id: conversation.id,
      },

      data: {
        glpiTicketId:
          ticketId,

        status:
          "CLOSED",

        closedAt:
          new Date(),
      },

      include: {
        device: true,

        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    }),
  ]);
this.conversationsGateway
  .emitConversationUpdated(
    updatedConversation,
  );
return {
  success: true,
  glpiTicketId:
    ticketId,
  conversation:
    updatedConversation,
};
}
}