import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAppointmentStatusDto {
  @ApiProperty({ example: 'checked_in' })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  reason?: string;
}
