import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  subject?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  openedByUsername!: string;

  @IsString()
  @IsNotEmpty()
  deviceId!: string;
}