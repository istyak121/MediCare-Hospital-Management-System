import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdmissionsService } from './admissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Admissions')
@ApiBearerAuth()
@Controller('admissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdmissionsController {
  constructor(private readonly service: AdmissionsService) {}

  @Get() @ApiOperation({ summary: 'List admissions' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE, UserRole.DOCTOR)
  findAll(@Query('status') status?: string) { return this.service.findAll(status); }

  @Get('wards') @ApiOperation({ summary: 'List wards with beds' })
  getWards() { return this.service.getWards(); }

  @Get('bed-availability') @ApiOperation({ summary: 'Get bed availability' })
  getBedAvailability(@Query('wardId') wardId?: string) { return this.service.getBedAvailability(wardId); }

  @Post() @ApiOperation({ summary: 'Admit patient' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.NURSE)
  admit(@Body() dto: any) { return this.service.admit(dto); }

  @Get(':id') @ApiOperation({ summary: 'Get admission details' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id/discharge') @ApiOperation({ summary: 'Discharge patient' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  discharge(@Param('id') id: string, @Body() dto: any) { return this.service.discharge(id, dto); }

  @Put(':id/transfer') @ApiOperation({ summary: 'Transfer bed' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.NURSE)
  transfer(@Param('id') id: string, @Body() dto: { newBedId: string }) { return this.service.transfer(id, dto.newBedId); }

  @Post(':id/progress-notes') @ApiOperation({ summary: 'Add progress note' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  addProgressNote(@Param('id') id: string, @Body() dto: { note: string; doctorId: string }) {
    return this.service.addProgressNote(id, dto.doctorId, dto.note);
  }
}
