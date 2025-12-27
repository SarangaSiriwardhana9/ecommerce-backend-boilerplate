import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { addToCartSchema, updateCartItemSchema, applyCouponSchema } from './schemas/cart.schema';
import { Request } from 'express';

@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) { }

    private getUserIdAndSession(user: any, req: Request): { userId?: string; sessionId?: string } {
        const userId = user?.sub;
        const sessionId = req.headers['x-session-id'] as string;
        return { userId, sessionId };
    }

    @Get()
    async getCart(@CurrentUser() user: any, @Req() req: Request) {
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.getCart(userId, sessionId);
        return {
            data: cart,
            message: 'Cart retrieved successfully'
        };
    }

    @Post('items')
    async addToCart(@Body() body: unknown, @CurrentUser() user: any, @Req() req: Request) {
        const dto = addToCartSchema.parse(body);
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.addToCart(dto, userId, sessionId);
        return {
            data: cart,
            message: 'Item added to cart successfully'
        };
    }

    @Put('items/:itemId')
    async updateItem(
        @Param('itemId') itemId: string,
        @Body() body: unknown,
        @CurrentUser() user: any,
        @Req() req: Request
    ) {
        const dto = updateCartItemSchema.parse(body);
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.updateItemQuantity(itemId, dto, userId, sessionId);
        return {
            data: cart,
            message: 'Cart item updated successfully'
        };
    }

    @Delete('items/:itemId')
    async removeItem(@Param('itemId') itemId: string, @CurrentUser() user: any, @Req() req: Request) {
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.removeItem(itemId, userId, sessionId);
        return {
            data: cart,
            message: 'Item removed from cart successfully'
        };
    }

    @Delete()
    async clearCart(@CurrentUser() user: any, @Req() req: Request) {
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const result = await this.cartService.clearCart(userId, sessionId);
        return result;
    }

    @Post('coupons')
    async applyCoupon(@Body() body: unknown, @CurrentUser() user: any, @Req() req: Request) {
        const dto = applyCouponSchema.parse(body);
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.applyCoupon(dto, userId, sessionId);
        return {
            data: cart,
            message: 'Coupon applied successfully'
        };
    }

    @Delete('coupons/:code')
    async removeCoupon(@Param('code') code: string, @CurrentUser() user: any, @Req() req: Request) {
        const { userId, sessionId } = this.getUserIdAndSession(user, req);
        const cart = await this.cartService.removeCoupon(code, userId, sessionId);
        return {
            data: cart,
            message: 'Coupon removed successfully'
        };
    }
}
