import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { QueryPatientDto } from './dto/query-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  @ApiOperation({ summary: 'List patients with search, filters, pagination' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  findAll(@Query() query: QueryPatientDto, @CurrentUser() user: any) {
    return this.patientsService.findAll(query, user);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new patient' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  create(@Body() dto: CreatePatientDto) {
    return this.patientsService.create(dto);
  }

  @Get('by-phone/:phone')
  @ApiOperation({ summary: 'Find patient by phone number (duplicate check)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST)
  findByPhone(@Param('phone') phone: string) {
    return this.patientsService.findByPhone(phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient details with relations' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient information' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR)
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto, @CurrentUser() user: any) {
    return this.patientsService.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive (soft-delete) a patient' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.remove(id, user);
  }

  @Get(':id/history')
  @ApiOperation({ summary: 'Get aggregated patient history' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getHistory(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.getHistory(id, user);
  }

  @Get(':id/appointments')
  @ApiOperation({ summary: 'Get patient appointments timeline' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getAppointments(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.getAppointments(id, user);
  }

  @Get(':id/admissions')
  @ApiOperation({ summary: 'Get patient admission history' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getAdmissions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.getAdmissions(id, user);
  }

  @Get(':id/prescriptions')
  @ApiOperation({ summary: 'Get patient prescriptions' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getPrescriptions(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.getPrescriptions(id, user);
  }

  @Get(':id/lab-tests')
  @ApiOperation({ summary: 'Get patient lab tests' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE)
  getLabTests(@Param('id') id: string, @CurrentUser() user: any) {
    return this.patientsService.getLabTests(id, user);
  }

  @Get(':id/invoices')
  @ApiOperation({ summary: 'Get patient invoices' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT)
  getInvoices(@Param('id') id: string) {
    return this.patientsService.getInvoices(id);
  }
}
