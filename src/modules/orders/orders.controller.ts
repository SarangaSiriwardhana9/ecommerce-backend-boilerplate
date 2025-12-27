import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createOrderSchema, updateOrderStatusSchema } from './schemas/order.schema';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
    constructor(private ordersService: OrdersService) { }

    @Post('checkout')
    async checkout(@Body() body: unknown, @CurrentUser() user: any, @Req() req: Request) {
        const dto = createOrderSchema.parse(body);
        const userId = user?.sub;
        const sessionId = req.headers['x-session-id'] as string;
        const order = await this.ordersService.checkout(dto, userId, sessionId);
        return {
            data: order,
            message: 'Order created successfully'
        };
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findAll(@CurrentUser() user: any) {
        const isAdmin = user.role === 'admin' || user.role === 'super_admin';
        const userId = isAdmin ? undefined : user.sub;
        const orders = await this.ordersService.findAll(userId, isAdmin);
        return {
            data: orders,
            message: 'Orders retrieved successfully'
        };
    }

    @Get(':orderNumber')
    async findByOrderNumber(
        @Param('orderNumber') orderNumber: string,
        @CurrentUser() user: any
    ) {
        const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
        const userId = user?.sub;
        const order = await this.ordersService.findByOrderNumber(orderNumber, userId, isAdmin);
        return {
            data: order,
            message: 'Order retrieved successfully'
        };
    }

    @Put(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async updateStatus(@Param('id') id: string, @Body() body: unknown) {
        const dto = updateOrderStatusSchema.parse(body);
        const order = await this.ordersService.updateStatus(id, dto);
        return {
            data: order,
            message: 'Order status updated successfully'
        };
    }

    @Put(':id/cancel')
    @UseGuards(JwtAuthGuard)
    async cancelOrder(@Param('id') id: string, @CurrentUser() user: any) {
        const isAdmin = user.role === 'admin' || user.role === 'super_admin';
        const userId = isAdmin ? undefined : user.sub;
        const order = await this.ordersService.cancelOrder(id, userId);
        return {
            data: order,
            message: 'Order cancelled successfully'
        };
    }
}
