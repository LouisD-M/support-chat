import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  clientMessageId?: string;

  @IsIn(["CLIENT", "TECHNICIAN", "SYSTEM"])
  senderType!: "CLIENT" | "TECHNICIAN" | "SYSTEM";

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  senderLabel!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}