import { IsString, IsUUID, IsOptional, IsArray, ValidateNested, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MedicineEntryDto {
  @ApiProperty() @IsUUID() medicineId: string;
  @ApiProperty({ example: '1-0-1' }) @IsString() dosage: string;
  @ApiProperty({ example: '7 days' }) @IsString() duration: string;
  @ApiPropertyOptional() @IsOptional() @IsString() instructions?: string;
  @ApiProperty() @IsInt() quantity: number;
}

export class CreatePrescriptionDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() appointmentId?: string;
  @ApiProperty() @IsUUID() patientId: string;
  @ApiProperty() @IsString() diagnosis: string;
  @ApiPropertyOptional() @IsOptional() @IsString() chiefComplaint?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() advice?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() followUpDate?: string;
  @ApiProperty({ type: [MedicineEntryDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => MedicineEntryDto) medicines: MedicineEntryDto[];
}
