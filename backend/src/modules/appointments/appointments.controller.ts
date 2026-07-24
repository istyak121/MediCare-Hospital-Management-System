import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-status.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments with filters' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT)
  findAll(@Query() query: QueryAppointmentDto, @CurrentUser() user: any) {
    return this.appointmentsService.findAll(query, user);
  }

  @Get('today-queue')
  @ApiOperation({ summary: "Get today's queue grouped by status" })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getTodayQueue(@CurrentUser() user: any) {
    return this.appointmentsService.getTodayQueue(user);
  }

  @Get('doctor/:doctorId/schedule')
  @ApiOperation({ summary: 'Get appointments for a doctor on a date' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  getDoctorSchedule(@Param('doctorId') doctorId: string, @Query('date') date?: string) {
    return this.appointmentsService.getDoctorSchedule(doctorId, date);
  }

  @Post()
  @ApiOperation({ summary: 'Book a new appointment (with slot-locking)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.PATIENT)
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment details' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointmentsService.findOne(id, user);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update appointment status (check-in, start, complete, cancel)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateAppointmentStatusDto, @CurrentUser() user: any) {
    return this.appointmentsService.updateStatus(id, dto, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update appointment details' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  update(@Param('id') id: string, @Body() dto: Partial<CreateAppointmentDto>) {
    return this.appointmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
