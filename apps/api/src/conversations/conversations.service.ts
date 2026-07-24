import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { CreateConversationDto } from "./dto/create-conversation.dto";

@Injectable()
export class ConversationsService {
  constructor(private readonly prisma: PrismaService) {}

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
}