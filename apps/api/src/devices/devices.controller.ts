import { Body, Controller, Post } from "@nestjs/common";

import { DevicesService } from "./devices.service";
import { RegisterDeviceDto } from "./dto/register-device.dto";

@Controller("devices")
export class DevicesController {
  constructor(
    private readonly devicesService: DevicesService,
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDeviceDto) {
    return this.devicesService.register(dto);
  }
}