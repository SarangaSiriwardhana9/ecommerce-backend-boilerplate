import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../schemas/order.model';

@Injectable()
export class OrdersRepository {
    constructor(@InjectModel(Order.name) private orderModel: Model<Order>) { }

    async create(orderData: Partial<Order>): Promise<Order> {
        const order = new this.orderModel(orderData);
        return order.save();
    }

    async findAll(filters?: any): Promise<Order[]> {
        const query: any = {};

        if (filters?.userId) {
            query['customer.userId'] = new Types.ObjectId(filters.userId);
        }

        if (filters?.status) {
            query.status = filters.status;
        }

        if (filters?.paymentStatus) {
            query.paymentStatus = filters.paymentStatus;
        }

        return this.orderModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async findById(id: string): Promise<Order | null> {
        return this.orderModel.findById(id).exec();
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        return this.orderModel.findOne({ orderNumber }).exec();
    }

    async findByUser(userId: string): Promise<Order[]> {
        return this.orderModel
            .find({ 'customer.userId': new Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .exec();
    }

    async update(id: string, data: Partial<Order>): Promise<Order | null> {
        return this.orderModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async updateStatus(id: string, status: string, paymentStatus?: string): Promise<Order | null> {
        const updateData: any = { status };
        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }
        return this.orderModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }

    async generateOrderNumber(): Promise<string> {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await this.orderModel.countDocuments({
            orderNumber: new RegExp(`^ORD-${dateStr}`)
        }).exec();
        const sequence = String(count + 1).padStart(4, '0');
        return `ORD-${dateStr}-${sequence}`;
    }
}
