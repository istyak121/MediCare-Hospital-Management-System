import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Schedules')
@ApiBearerAuth()
@Controller('schedules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('doctor/:doctorId')
  @ApiOperation({ summary: 'Get weekly schedule for a doctor' })
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.schedulesService.findByDoctor(doctorId);
  }

  @Put('doctor/:doctorId')
  @ApiOperation({ summary: 'Set weekly schedule for a doctor' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  upsert(@Param('doctorId') doctorId: string, @Body() body: { schedules: any[] }) {
    return this.schedulesService.upsert(doctorId, body.schedules);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available time slots for a doctor on a date' })
  getAvailableSlots(@Query('doctorId') doctorId: string, @Query('date') date: string) {
    return this.schedulesService.getAvailableSlots(doctorId, new Date(date));
  }
}
