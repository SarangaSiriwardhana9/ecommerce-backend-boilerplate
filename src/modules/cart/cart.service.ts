import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CartRepository } from './repositories/cart.repository';
import { ProductsService } from '../products/products.service';
import { ProductVariantsService } from '../product-variants/product-variants.service';
import { DiscountsService } from '../discounts/discounts.service';
import { AddToCartDto, UpdateCartItemDto, ApplyCouponDto } from './dto';

@Injectable()
export class CartService {
    constructor(
        private cartRepository: CartRepository,
        private productsService: ProductsService,
        private variantsService: ProductVariantsService,
        private discountsService: DiscountsService,
    ) { }

    async getOrCreateCart(userId?: string, sessionId?: string) {
        let cart;

        if (userId) {
            cart = await this.cartRepository.findByUser(userId);
        } else if (sessionId) {
            cart = await this.cartRepository.findBySession(sessionId);
        }

        if (!cart) {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            cart = await this.cartRepository.create({
                userId: userId ? new Types.ObjectId(userId) : undefined,
                sessionId,
                expiresAt,
            });
        }

        return cart;
    }

    async getCart(userId?: string, sessionId?: string) {
        const cart = await this.getOrCreateCart(userId, sessionId);
        return cart;
    }

    async addToCart(addDto: AddToCartDto, userId?: string, sessionId?: string) {
        const cart = await this.getOrCreateCart(userId, sessionId);

        const product = await this.productsService.findById(addDto.productId);

        let price = product.basePrice;
        let variantOptions: any[] = [];
        let variantId;

        if (addDto.variantId) {
            const variant = await this.variantsService.findById(addDto.variantId);
            if (variant.productId.toString() !== addDto.productId) {
                throw new BadRequestException('Variant does not belong to this product');
            }
            price = variant.price;
            variantOptions = variant.options;
            variantId = variant._id;

            const hasStock = await this.variantsService.checkStock(addDto.variantId, addDto.quantity);
            if (!hasStock) {
                throw new BadRequestException('Insufficient stock for selected variant');
            }
        } else {
            if (product.trackInventory) {
                const hasStock = await this.productsService.checkStock(addDto.productId, addDto.quantity);
                if (!hasStock) {
                    throw new BadRequestException('Insufficient stock');
                }
            }
        }

        const existingItemIndex = (cart.items as any[]).findIndex((item: any) => {
            const sameProduct = item.productId.toString() === addDto.productId;
            const sameVariant = addDto.variantId
                ? item.variantId?.toString() === addDto.variantId
                : !item.variantId;
            return sameProduct && sameVariant;
        });

        if (existingItemIndex > -1) {
            const newQuantity = (cart.items as any[])[existingItemIndex].quantity + addDto.quantity;
            await this.cartRepository.updateItem(cart._id as any, (cart.items as any[])[existingItemIndex]._id, newQuantity);
        } else {
            const newItem: any = {
                productId: new Types.ObjectId(addDto.productId),
                variantId: variantId ? new Types.ObjectId(variantId) : undefined,
                productName: product.name,
                productSlug: product.slug,
                productImage: product.images?.[0]?.url || '',
                variantOptions,
                price,
                compareAtPrice: product.compareAtPrice,
                quantity: addDto.quantity,
            };

            await this.cartRepository.addItem(cart._id as any, newItem);
        }

        const updatedCart = await this.getCart(userId, sessionId);
        await this.calculateTotals(updatedCart._id as any);

        return this.getCart(userId, sessionId);
    }

    async updateItemQuantity(itemId: string, updateDto: UpdateCartItemDto, userId?: string, sessionId?: string) {
        const cart = await this.getCart(userId, sessionId);

        const item = (cart.items as any[]).find((i: any) => i._id.toString() === itemId);
        if (!item) {
            throw new NotFoundException('Cart item not found');
        }

        await this.cartRepository.updateItem(cart._id as any, itemId, updateDto.quantity);
        await this.calculateTotals(cart._id as any);

        return this.getCart(userId, sessionId);
    }

    async removeItem(itemId: string, userId?: string, sessionId?: string) {
        const cart = await this.getCart(userId, sessionId);

        await this.cartRepository.removeItem(cart._id as any, itemId);
        await this.calculateTotals(cart._id as any);

        return this.getCart(userId, sessionId);
    }

    async clearCart(userId?: string, sessionId?: string) {
        const cart = await this.getCart(userId, sessionId);
        await this.cartRepository.clearItems(cart._id as any);
        return { message: 'Cart cleared successfully' };
    }

    async applyCoupon(couponDto: ApplyCouponDto, userId?: string, sessionId?: string) {
        const cart = await this.getCart(userId, sessionId);

        const productIds = (cart.items as any[]).map((item: any) => item.productId.toString());

        const validation = await this.discountsService.validateCoupon({
            code: couponDto.code,
            userId,
            cartTotal: cart.subtotal,
            productIds,
            categoryIds: [],
        });

        if (!validation.valid || !validation.discount) {
            throw new BadRequestException(validation.message || 'Invalid coupon');
        }

        const alreadyApplied = (cart.appliedCoupons as any[]).some(
            (c: any) => c.code === couponDto.code
        );

        if (alreadyApplied) {
            throw new BadRequestException('Coupon already applied');
        }

        let discountAmount = 0;
        if (validation.discount.type === 'percentage') {
            discountAmount = (cart.subtotal * validation.discount.value) / 100;
        } else if (validation.discount.type === 'fixed_amount') {
            discountAmount = validation.discount.value;
        }

        const appliedCoupon = {
            discountId: new Types.ObjectId(validation.discount._id as any),
            code: couponDto.code,
            discountAmount,
        };

        await this.cartRepository.update(cart._id as any, {
            appliedCoupons: [...(cart.appliedCoupons as any[]), appliedCoupon],
        });

        await this.calculateTotals(cart._id as any);

        return this.getCart(userId, sessionId);
    }

    async removeCoupon(code: string, userId?: string, sessionId?: string) {
        const cart = await this.getCart(userId, sessionId);

        const updatedCoupons = (cart.appliedCoupons as any[]).filter(
            (c: any) => c.code !== code
        );

        await this.cartRepository.update(cart._id as any, {
            appliedCoupons: updatedCoupons,
        });

        await this.calculateTotals(cart._id as any);

        return this.getCart(userId, sessionId);
    }

    private async calculateTotals(cartId: string) {
        const cart = await this.cartRepository.findById(cartId);
        if (!cart) return;

        const subtotal = (cart.items as any[]).reduce((sum: number, item: any) => {
            return sum + (item.price * item.quantity);
        }, 0);

        const discountTotal = (cart.appliedCoupons as any[]).reduce((sum: number, coupon: any) => {
            return sum + coupon.discountAmount;
        }, 0);

        const taxRate = 0.1;
        const taxTotal = (subtotal - discountTotal) * taxRate;

        const shippingTotal = subtotal > 100 ? 0 : 10;

        const total = subtotal - discountTotal + taxTotal + shippingTotal;

        await this.cartRepository.update(cartId, {
            subtotal: Number(subtotal.toFixed(2)),
            discountTotal: Number(discountTotal.toFixed(2)),
            taxTotal: Number(taxTotal.toFixed(2)),
            shippingTotal: Number(shippingTotal.toFixed(2)),
            total: Number(total.toFixed(2)),
        });
    }
}
