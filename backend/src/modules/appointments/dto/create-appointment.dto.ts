import { IsString, IsUUID, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AppointmentType } from '../../../entities/enums';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  doctorId: string;

  @ApiProperty()
  @IsUUID()
  scheduleId: string;

  @ApiProperty({ example: '2026-07-21' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ example: '10:00-10:20' })
  @IsString()
  timeSlot: string;

  @ApiProperty({ enum: AppointmentType, default: 'opd' })
  @IsOptional() @IsEnum(AppointmentType)
  type?: AppointmentType;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  chiefComplaint?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  notes?: string;
}
