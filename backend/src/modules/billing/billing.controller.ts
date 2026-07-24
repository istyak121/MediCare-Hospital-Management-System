import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../entities/enums';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly service: BillingService) {}

  @Get('invoices') @ApiOperation({ summary: 'List invoices' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT, UserRole.PATIENT)
  findAll(@Query('status') status?: string, @Query('type') type?: string, @Query('page') page?: number, @CurrentUser() user?: any) {
    return this.service.findAll(status, type, page || 1, 25, user);
  }

  @Post('invoices') @ApiOperation({ summary: 'Create invoice' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT)
  create(@Body() dto: any, @CurrentUser('id') uid: string) { return this.service.create(dto, uid); }

  @Get('invoices/:id') @ApiOperation({ summary: 'Get invoice details' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT, UserRole.PATIENT)
  findOne(@Param('id') id: string, @CurrentUser() user?: any) { return this.service.findOne(id, user); }

  @Post('invoices/:id/payments') @ApiOperation({ summary: 'Add payment to invoice' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.RECEPTIONIST, UserRole.ACCOUNTANT)
  addPayment(@Param('id') id: string, @Body() dto: any, @CurrentUser('id') uid: string) {
    return this.service.addPayment(id, dto, uid);
  }

  @Get('daily-collection') @ApiOperation({ summary: 'Get daily collection report' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  getDailyCollection(@Query('date') date?: string) { return this.service.getDailyCollection(date); }

  @Get('outstanding') @ApiOperation({ summary: 'Get outstanding bills' })
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT)
  getOutstanding() { return this.service.getOutstanding(); }
}
