import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('patient-stats')
  @ApiOperation({ summary: 'Patient statistics' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getPatientStats() { return this.service.getPatientStats(); }

  @Get('revenue')
  @ApiOperation({ summary: 'Revenue report (last N days)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  getRevenue(@Query('days') days?: number) { return this.service.getRevenue(days || 30); }

  @Get('bed-occupancy')
  @ApiOperation({ summary: 'Bed occupancy report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getBedOccupancy() { return this.service.getBedOccupancy(); }

  @Get('top-diagnoses')
  @ApiOperation({ summary: 'Top 10 diagnoses' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  getTopDiagnoses() { return this.service.getTopDiagnoses(); }
}
