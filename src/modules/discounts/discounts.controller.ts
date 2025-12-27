import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createDiscountSchema, updateDiscountSchema, validateCouponSchema } from './schemas/discount.schema';

@Controller('discounts')
export class DiscountsController {
    constructor(private discountsService: DiscountsService) { }

    @Post('validate')
    async validateCoupon(@Body() body: unknown) {
        const dto = validateCouponSchema.parse(body);
        const result = await this.discountsService.validateCoupon(dto);
        return {
            data: result,
            message: result.valid ? 'Coupon is valid' : result.message
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async findAll(@Query('active') active?: string) {
        const activeOnly = active === 'true';
        const discounts = await this.discountsService.findAll(activeOnly);
        return {
            data: discounts,
            message: 'Discounts retrieved successfully'
        };
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async findById(@Param('id') id: string) {
        const discount = await this.discountsService.findById(id);
        return {
            data: discount,
            message: 'Discount retrieved successfully'
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async create(@Body() body: unknown, @CurrentUser() user: any) {
        const dto = createDiscountSchema.parse(body);
        const discount = await this.discountsService.create(dto, user.sub);
        return {
            data: discount,
            message: 'Discount created successfully'
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async update(@Param('id') id: string, @Body() body: unknown) {
        const dto = updateDiscountSchema.parse(body);
        const discount = await this.discountsService.update(id, dto);
        return {
            data: discount,
            message: 'Discount updated successfully'
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async delete(@Param('id') id: string) {
        const result = await this.discountsService.delete(id);
        return result;
    }
}
