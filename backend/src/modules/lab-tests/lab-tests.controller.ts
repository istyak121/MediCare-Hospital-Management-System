import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LabTestsService } from './lab-tests.service';
import { CreateLabTestDto, CompleteLabTestDto } from './dto/create-lab-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Lab Tests')
@ApiBearerAuth()
@Controller('lab-tests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabTestsController {
  constructor(private readonly service: LabTestsService) {}

  @Get() @ApiOperation({ summary: 'List lab tests' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.LAB_TECHNICIAN)
  findAll(@Query('status') status?: string) { return this.service.findAll(status); }

  @Get('test-types') @ApiOperation({ summary: 'List lab test types' })
  getTestTypes() { return this.service.getTestTypes(); }

  @Post() @ApiOperation({ summary: 'Request a lab test' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR)
  create(@Body() dto: CreateLabTestDto, @CurrentUser('id') uid: string) { return this.service.create(dto, uid); }

  @Get(':id') @ApiOperation({ summary: 'Get lab test details' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Put(':id/collect') @ApiOperation({ summary: 'Mark sample as collected' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  collect(@Param('id') id: string, @CurrentUser('id') uid: string) { return this.service.updateStatus(id, 'sample_collected' as any, uid); }

  @Put(':id/start') @ApiOperation({ summary: 'Start processing' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  start(@Param('id') id: string) { return this.service.updateStatus(id, 'in_progress' as any); }

  @Put(':id/complete') @ApiOperation({ summary: 'Complete test with results' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.LAB_TECHNICIAN)
  complete(@Param('id') id: string, @Body() dto: CompleteLabTestDto, @CurrentUser('id') uid: string) { return this.service.complete(id, dto, uid); }
}
