import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly rxService: PrescriptionsService) {}

  @Get() @ApiOperation({ summary: 'List prescriptions' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  findAll(@Query() q: any) { return this.rxService.findAll(q); }

  @Get('search-medicines') @ApiOperation({ summary: 'Search medicines for prescribing' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  searchMedicines(@Query('q') q: string) { return this.rxService.searchMedicines(q); }

  @Post() @ApiOperation({ summary: 'Create prescription' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() dto: CreatePrescriptionDto, @CurrentUser('id') uid: string, @CurrentUser('staffId') sid: string) {
    return this.rxService.create(dto, sid || uid);
  }

  @Get(':id') @ApiOperation({ summary: 'Get prescription details' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.PATIENT)
  findOne(@Param('id') id: string) { return this.rxService.findOne(id); }
}
