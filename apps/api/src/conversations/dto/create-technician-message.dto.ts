import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateTechnicianMessageDto {
  @IsOptional()
  @IsString()
  clientMessageId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}