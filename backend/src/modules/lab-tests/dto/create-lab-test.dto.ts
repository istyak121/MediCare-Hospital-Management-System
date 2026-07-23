import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty() @IsUUID() patientId: string;
  @ApiProperty() @IsUUID() testTypeId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CompleteLabTestDto {
  @ApiPropertyOptional({ type: Object }) @IsOptional() results?: Record<string, string>;
  @ApiPropertyOptional() @IsOptional() @IsString() resultNotes?: string;
}
