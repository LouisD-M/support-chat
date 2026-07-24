import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { GlpiService } from "../glpi/glpi.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly glpiService: GlpiService,
  ) {}
  
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

  async create(dto: CreateConversationDto) {
    const device = await this.prisma.device.findUnique({
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

    return this.prisma.conversation.create({
      data: {
        subject: dto.subject ?? null,
        openedByUsername: dto.openedByUsername,
        deviceId: dto.deviceId,
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

  const updatedConversation =
    await this.prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        glpiTicketId:
          String(glpiTicket.id),
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

  return {
    success: true,
    glpiTicketId:
      String(glpiTicket.id),
    conversation:
      updatedConversation,
  };
}
}