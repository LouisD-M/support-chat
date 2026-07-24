import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  installationId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  computerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  domain?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  lastWindowsUser?: string | null;
}