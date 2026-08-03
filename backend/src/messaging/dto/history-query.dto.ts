import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class HistoryQueryDto {
  /**
   * Cursor in the format `<iso-createdAt>|<messageId>`. Returns messages
   * strictly older than the cursor, ordered chronologically for display.
   */
  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 30;
}
