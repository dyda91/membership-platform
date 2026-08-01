import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateArtistProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  presentationText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactButtonText?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'whatsappValue must be a valid phone number',
  })
  whatsappValue?: string | null;

  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['https'], require_protocol: true })
  discordUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  discordEnabled?: boolean;
}
