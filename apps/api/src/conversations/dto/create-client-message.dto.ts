import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateClientMessageDto {
  @IsOptional()
  @IsString()
  clientMessageId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}