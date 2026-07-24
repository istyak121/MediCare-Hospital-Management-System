import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Staff')
@ApiBearerAuth()
@Controller('staff')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'List all staff, optionally filtered by department' })
  findAll(@Query('departmentId') departmentId?: string) {
    return this.staffService.findAll(departmentId);
  }

  @Get('doctors')
  @ApiOperation({ summary: 'List doctors, optionally filtered by department' })
  findDoctors(@Query('departmentId') departmentId?: string) {
    return this.staffService.findDoctors(departmentId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get staff details with schedule' })
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }
}
