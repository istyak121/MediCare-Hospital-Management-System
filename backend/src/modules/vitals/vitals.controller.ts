import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VitalsService } from './vitals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Vitals')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class VitalsController {
  constructor(private readonly vitalsService: VitalsService) {}

  @Post('appointments/:id/vitals')
  @ApiOperation({ summary: 'Record vitals for an appointment (nurse)' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.NURSE)
  create(
    @Param('id') appointmentId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: any,
  ) {
    return this.vitalsService.create(appointmentId, userId, dto);
  }

  @Get('appointments/:id/vitals')
  @ApiOperation({ summary: 'Get vitals for an appointment' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE)
  findByAppointment(@Param('id') appointmentId: string, @CurrentUser() user?: any) {
    return this.vitalsService.findByAppointment(appointmentId, user);
  }

  @Put('vitals/:id')
  @ApiOperation({ summary: 'Update vitals record' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.NURSE)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.vitalsService.update(id, dto);
  }
}
