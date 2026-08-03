import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export const MESSAGE_MAX_LENGTH = 4000;

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(MESSAGE_MAX_LENGTH)
  content: string;
}
