import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateMessageDto } from "./dto/create-message.dto";

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    conversationId: string,
    dto: CreateMessageDto,
  ) {
    const conversation =
      await this.prisma.conversation.findUnique({
        where: {
          id: conversationId,
        },

        select: {
          id: true,
        },
      });

    if (!conversation) {
      throw new NotFoundException(
        "Conversation introuvable.",
      );
    }

    /*
     * Si le client renvoie accidentellement le même
     * message, on retourne celui déjà enregistré.
     */
    if (dto.clientMessageId) {
      const existingMessage =
        await this.prisma.message.findUnique({
          where: {
            clientMessageId: dto.clientMessageId,
          },
        });

      if (existingMessage) {
        return existingMessage;
      }
    }

    const [message] = await this.prisma.$transaction([
      this.prisma.message.create({
        data: {
          conversationId,
          clientMessageId:
            dto.clientMessageId ?? null,
          senderType: dto.senderType,
          senderLabel: dto.senderLabel,
          content: dto.content,
        },
      }),

      /*
       * La conversation remonte en tête de la liste
       * lorsqu'un nouveau message est envoyé.
       */
      this.prisma.conversation.update({
        where: {
          id: conversationId,
        },

        data: {
          updatedAt: new Date(),
        },
      }),
    ]);

    return message;
  }
}