import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";
import { RegisterDeviceDto } from "./dto/register-device.dto";

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async register(dto: RegisterDeviceDto) {
    return this.prisma.device.upsert({
      where: {
        installationId: dto.installationId,
      },

      update: {
        computerName: dto.computerName,
        domain: dto.domain ?? null,
        lastWindowsUser: dto.lastWindowsUser ?? null,
        lastSeenAt: new Date(),
      },

      create: {
        installationId: dto.installationId,
        computerName: dto.computerName,
        domain: dto.domain ?? null,
        lastWindowsUser: dto.lastWindowsUser ?? null,
      },
    });
  }
}