import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart, CartItem } from '../schemas/cart.model';

@Injectable()
export class CartRepository {
    constructor(@InjectModel(Cart.name) private cartModel: Model<Cart>) { }

    async create(cartData: Partial<Cart>): Promise<Cart> {
        const cart = new this.cartModel(cartData);
        return cart.save();
    }

    async findByUser(userId: string): Promise<Cart | null> {
        return this.cartModel.findOne({ userId: new Types.ObjectId(userId), status: 'active' }).exec();
    }

    async findBySession(sessionId: string): Promise<Cart | null> {
        return this.cartModel.findOne({ sessionId, status: 'active' }).exec();
    }

    async findById(id: string): Promise<Cart | null> {
        return this.cartModel.findById(id).exec();
    }

    async update(id: string, data: Partial<Cart>): Promise<Cart | null> {
        return this.cartModel.findByIdAndUpdate(
            id,
            { ...data, lastActivityAt: new Date() },
            { new: true }
        ).exec();
    }

    async addItem(cartId: string, item: any): Promise<Cart | null> {
        return this.cartModel.findByIdAndUpdate(
            cartId,
            {
                $push: { items: item },
                lastActivityAt: new Date()
            },
            { new: true }
        ).exec();
    }

    async updateItem(cartId: string, itemId: string, quantity: number): Promise<Cart | null> {
        return this.cartModel.findOneAndUpdate(
            { _id: cartId, 'items._id': new Types.ObjectId(itemId) },
            {
                $set: { 'items.$.quantity': quantity },
                lastActivityAt: new Date()
            },
            { new: true }
        ).exec();
    }

    async removeItem(cartId: string, itemId: string): Promise<Cart | null> {
        return this.cartModel.findByIdAndUpdate(
            cartId,
            {
                $pull: { items: { _id: new Types.ObjectId(itemId) } },
                lastActivityAt: new Date()
            },
            { new: true }
        ).exec();
    }

    async clearItems(cartId: string): Promise<Cart | null> {
        return this.cartModel.findByIdAndUpdate(
            cartId,
            {
                items: [],
                appliedCoupons: [],
                subtotal: 0,
                discountTotal: 0,
                taxTotal: 0,
                total: 0,
                lastActivityAt: new Date()
            },
            { new: true }
        ).exec();
    }

    async delete(id: string): Promise<void> {
        await this.cartModel.findByIdAndDelete(id).exec();
    }
}
