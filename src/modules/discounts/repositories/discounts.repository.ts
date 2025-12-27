import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Discount } from '../schemas/discount.model';

@Injectable()
export class DiscountsRepository {
    constructor(@InjectModel(Discount.name) private discountModel: Model<Discount>) { }

    async create(discountData: Partial<Discount>): Promise<Discount> {
        const discount = new this.discountModel(discountData);
        return discount.save();
    }

    async findAll(activeOnly: boolean = false): Promise<Discount[]> {
        const filter: any = {};
        if (activeOnly) {
            filter.isActive = true;
            filter.startDate = { $lte: new Date() };
            filter.endDate = { $gte: new Date() };
        }
        return this.discountModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    async findById(id: string): Promise<Discount | null> {
        return this.discountModel.findById(id).exec();
    }

    async findByCode(code: string): Promise<Discount | null> {
        return this.discountModel.findOne({ code: code.toUpperCase() }).exec();
    }

    async findActive(): Promise<Discount[]> {
        const now = new Date();
        return this.discountModel.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
        }).exec();
    }

    async update(id: string, data: Partial<Discount>): Promise<Discount | null> {
        return this.discountModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.discountModel.findByIdAndDelete(id).exec();
    }

    async incrementUsage(id: string): Promise<void> {
        await this.discountModel.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec();
    }

    async getUserUsageCount(discountId: string, userId: string): Promise<number> {
        return 0;
    }
}
