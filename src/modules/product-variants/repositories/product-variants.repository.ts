import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductVariant } from '../schemas/product-variant.model';

@Injectable()
export class ProductVariantsRepository {
    constructor(@InjectModel(ProductVariant.name) private variantModel: Model<ProductVariant>) { }

    async create(variantData: Partial<ProductVariant>): Promise<ProductVariant> {
        const variant = new this.variantModel(variantData);
        return variant.save();
    }

    async findAll(): Promise<ProductVariant[]> {
        return this.variantModel.find().populate('productId', 'name slug').exec();
    }

    async findById(id: string): Promise<ProductVariant | null> {
        return this.variantModel.findById(id).populate('productId', 'name slug').exec();
    }

    async findBySku(sku: string): Promise<ProductVariant | null> {
        return this.variantModel.findOne({ sku }).exec();
    }

    async findByProduct(productId: string): Promise<ProductVariant[]> {
        return this.variantModel
            .find({ productId: new Types.ObjectId(productId) })
            .sort({ position: 1, createdAt: 1 })
            .exec();
    }

    async update(id: string, data: Partial<ProductVariant>): Promise<ProductVariant | null> {
        return this.variantModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.variantModel.findByIdAndDelete(id).exec();
    }

    async checkStock(id: string, quantity: number): Promise<boolean> {
        const variant = await this.variantModel.findById(id).exec();
        if (!variant) return false;
        return variant.stock >= quantity;
    }

    async decrementStock(id: string, quantity: number): Promise<void> {
        await this.variantModel.findByIdAndUpdate(id, { $inc: { stock: -quantity } }).exec();
    }

    async incrementStock(id: string, quantity: number): Promise<void> {
        await this.variantModel.findByIdAndUpdate(id, { $inc: { stock: quantity } }).exec();
    }
}
