import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '../../../entities/enums';

export class QueryPatientDto {
  @ApiPropertyOptional()
  @IsOptional() @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsInt() @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional() @IsInt() @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional() @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  bloodGroup?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  dateRange?: string; // today, week, month
}
