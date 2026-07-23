import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PharmacyController {
  constructor(private readonly service: PharmacyService) {}

  @Get('medicines') @ApiOperation({ summary: 'List medicines' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  findAll(@Query('category') category?: string, @Query('search') search?: string) {
    return this.service.findAll(category, search);
  }

  @Get('medicines/low-stock') @ApiOperation({ summary: 'Low stock alerts' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  getLowStock() { return this.service.getLowStock(); }

  @Get('medicines/:id') @ApiOperation({ summary: 'Get medicine details' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post('medicines') @ApiOperation({ summary: 'Add medicine' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  create(@Body() dto: any) { return this.service.create(dto); }

  @Put('medicines/:id') @ApiOperation({ summary: 'Update medicine' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  update(@Param('id') id: string, @Body() dto: any) { return this.service.update(id, dto); }

  @Put('medicines/:id/adjust-stock') @ApiOperation({ summary: 'Adjust stock' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  adjustStock(@Param('id') id: string, @Body() body: { quantity: number; reason?: string }) {
    return this.service.adjustStock(id, body.quantity, body.reason);
  }

  @Post('dispense') @ApiOperation({ summary: 'Dispense medicines' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PHARMACIST)
  dispense(@Body() body: { items: { medicineId: string; quantity: number }[] }) {
    return this.service.dispense(body.items);
  }
}
