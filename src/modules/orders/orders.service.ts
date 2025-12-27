import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrdersRepository } from './repositories/orders.repository';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../products/products.service';
import { ProductVariantsService } from '../product-variants/product-variants.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';

@Injectable()
export class OrdersService {
    constructor(
        private ordersRepository: OrdersRepository,
        private cartService: CartService,
        private productsService: ProductsService,
        private variantsService: ProductVariantsService,
    ) { }

    async checkout(createDto: CreateOrderDto, userId?: string, sessionId?: string) {
        const cart = await this.cartService.getCart(userId, sessionId);

        if (!cart.items || (cart.items as any[]).length === 0) {
            throw new BadRequestException('Cart is empty');
        }

        for (const item of cart.items as any[]) {
            if (item.variantId) {
                const hasStock = await this.variantsService.checkStock(
                    item.variantId.toString(),
                    item.quantity
                );
                if (!hasStock) {
                    throw new BadRequestException(`Insufficient stock for ${item.productName}`);
                }
            } else {
                const hasStock = await this.productsService.checkStock(
                    item.productId.toString(),
                    item.quantity
                );
                if (!hasStock) {
                    throw new BadRequestException(`Insufficient stock for ${item.productName}`);
                }
            }
        }

        const orderNumber = await this.ordersRepository.generateOrderNumber();

        const orderItems = (cart.items as any[]).map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productSlug: item.productSlug,
            productImage: item.productImage,
            sku: item.variantId ? `VAR-${item.variantId}` : `PROD-${item.productId}`,
            variantOptions: item.variantOptions || [],
            quantity: item.quantity,
            price: item.price,
            compareAtPrice: item.compareAtPrice,
            discountAmount: item.discountAmount || 0,
            taxAmount: (item.price * item.quantity * 0.1),
            total: item.price * item.quantity,
        }));

        const appliedDiscounts = (cart.appliedCoupons as any[]).map((coupon: any) => ({
            discountId: coupon.discountId,
            code: coupon.code,
            name: coupon.code,
            type: 'coupon',
            amount: coupon.discountAmount,
        }));

        let paymentStatus = 'pending';
        let paymentDetails: any = {};
        let orderStatus = 'pending_payment';

        if (createDto.paymentMethod === 'mock') {
            const mockPaymentResult = await this.processMockPayment(orderNumber, cart.total);
            paymentStatus = mockPaymentResult.status;
            paymentDetails = mockPaymentResult.details;
            orderStatus = mockPaymentResult.status === 'paid' ? 'confirmed' : 'payment_failed';
        }

        const orderData: any = {
            orderNumber,
            customer: {
                userId: userId ? new Types.ObjectId(userId) : undefined,
                email: createDto.customer.email,
                firstName: createDto.customer.firstName,
                lastName: createDto.customer.lastName,
                phone: createDto.customer.phone,
            },
            shippingAddress: createDto.shippingAddress,
            billingAddress: createDto.billingAddress,
            items: orderItems,
            subtotal: cart.subtotal,
            discountTotal: cart.discountTotal,
            taxTotal: cart.taxTotal,
            shippingTotal: cart.shippingTotal,
            total: cart.total,
            appliedDiscounts,
            paymentMethod: createDto.paymentMethod,
            paymentStatus,
            paymentDetails,
            status: orderStatus,
            shippingMethod: 'Standard',
            customerNote: createDto.customerNote,
        };

        const order = await this.ordersRepository.create(orderData);

        for (const item of cart.items as any[]) {
            if (item.variantId) {
                await this.variantsService.decrementStock(item.variantId.toString(), item.quantity);
            } else {
                const product = await this.productsService.findById(item.productId.toString());
                if (product.trackInventory) {
                    await this.productsService.findById(item.productId.toString());
                }
            }
        }

        await this.cartService.clearCart(userId, sessionId);

        return order;
    }

    private async processMockPayment(orderNumber: string, amount: number) {
        return {
            status: 'paid',
            details: {
                transactionId: `MOCK-${Date.now()}-${orderNumber}`,
                paymentGateway: 'Mock Payment Gateway',
                paidAt: new Date(),
            },
        };
    }

    async findAll(userId?: string, isAdmin: boolean = false) {
        if (isAdmin) {
            return this.ordersRepository.findAll();
        } else if (userId) {
            return this.ordersRepository.findByUser(userId);
        }
        return [];
    }

    async findById(id: string, userId?: string, isAdmin: boolean = false) {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!isAdmin && userId) {
            if (!order.customer.userId || order.customer.userId.toString() !== userId) {
                throw new NotFoundException('Order not found');
            }
        }

        return order;
    }

    async findByOrderNumber(orderNumber: string, userId?: string, isAdmin: boolean = false) {
        const order = await this.ordersRepository.findByOrderNumber(orderNumber);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (!isAdmin && userId) {
            if (!order.customer.userId || order.customer.userId.toString() !== userId) {
                throw new NotFoundException('Order not found');
            }
        }

        return order;
    }

    async updateStatus(id: string, updateDto: UpdateOrderStatusDto) {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        const updateData: any = {};

        if (updateDto.status) {
            updateData.status = updateDto.status;
        }

        if (updateDto.paymentStatus) {
            updateData.paymentStatus = updateDto.paymentStatus;
        }

        if (updateDto.fulfillmentStatus) {
            updateData.fulfillmentStatus = updateDto.fulfillmentStatus;
        }

        if (updateDto.trackingNumber) {
            updateData.trackingNumber = updateDto.trackingNumber;
        }

        if (updateDto.trackingUrl) {
            updateData.trackingUrl = updateDto.trackingUrl;
        }

        if (updateDto.shippingCarrier) {
            updateData.shippingCarrier = updateDto.shippingCarrier;
        }

        if (updateDto.internalNote) {
            updateData.internalNote = updateDto.internalNote;
        }

        if (updateDto.status === 'shipped' && !order.shippedAt) {
            updateData.shippedAt = new Date();
        }

        if (updateDto.status === 'delivered' && !order.deliveredAt) {
            updateData.deliveredAt = new Date();
        }

        return this.ordersRepository.update(id, updateData);
    }

    async cancelOrder(id: string, userId?: string) {
        const order = await this.ordersRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (userId && (!order.customer.userId || order.customer.userId.toString() !== userId)) {
            throw new NotFoundException('Order not found');
        }

        if (['shipped', 'delivered'].includes(order.status)) {
            throw new BadRequestException('Cannot cancel order that has been shipped or delivered');
        }

        return this.ordersRepository.updateStatus(id, 'cancelled');
    }
}
