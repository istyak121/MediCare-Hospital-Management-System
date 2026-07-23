import { IsString, IsOptional, IsDateString, IsEnum, IsPhoneNumber, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender, BloodGroup } from '../../../entities/enums';

export class CreatePatientDto {
  @ApiProperty({ example: 'Mohammad Ali' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: 'মোহাম্মদ আলী' })
  @IsOptional() @IsString()
  fullNameBn?: string;

  @ApiProperty({ example: '01712345678' })
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  email?: string;

  @ApiProperty({ example: '1980-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ enum: Gender })
  @IsEnum(Gender)
  gender: Gender;

  @ApiPropertyOptional({ enum: BloodGroup })
  @IsOptional() @IsEnum(BloodGroup)
  bloodGroup?: BloodGroup;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  emergencyContactName?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  emergencyContactPhone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsString({ each: true })
  allergies?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsString({ each: true })
  chronicDiseases?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsString({ each: true })
  currentMedications?: string[];
}
