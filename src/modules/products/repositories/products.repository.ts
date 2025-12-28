import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, Types } from 'mongoose';
import { Product } from '../schemas/product.model';
import { ProductQueryDto } from '../dto';

@Injectable()
export class ProductsRepository {
    constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

    async create(productData: Partial<Product>): Promise<Product> {
        const product = new this.productModel(productData);
        return product.save();
    }

    async findAll(queryDto: ProductQueryDto) {
        const {
            page = 1,
            limit = 20,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            categories,
            minPrice,
            maxPrice,
            inStock,
            isFeatured,
            search,
            tags,
            brand,
            status,
        } = queryDto;

        const filter: FilterQuery<Product> = { deletedAt: null, isActive: true };

        if (categories && categories.length > 0) {
            filter.categories = { $in: categories.map(id => new Types.ObjectId(id)) };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.basePrice = {};
            if (minPrice !== undefined) filter.basePrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.basePrice.$lte = maxPrice;
        }

        if (inStock !== undefined) {
            if (inStock) {
                filter.stock = { $gt: 0 };
            }
        }

        if (isFeatured !== undefined) {
            filter.isFeatured = isFeatured;
        }

        if (search) {
            filter.$text = { $search: search };
        }

        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }

        if (brand) {
            filter.brand = brand;
        }

        if (status) {
            filter.status = status;
        }

        const skip = (page - 1) * limit;
        const sortOptions: any = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const [products, total] = await Promise.all([
            this.productModel
                .find(filter)
                .populate('categories', 'name slug')
                .populate('primaryCategory', 'name slug')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.productModel.countDocuments(filter).exec(),
        ]);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findById(id: string): Promise<Product | null> {
        return this.productModel
            .findOne({ _id: id, deletedAt: null })
            .populate('categories', 'name slug')
            .populate('primaryCategory', 'name slug')
            .exec();
    }

    async findBySlug(slug: string): Promise<Product | null> {
        return this.productModel
            .findOne({ slug, deletedAt: null })
            .populate('categories', 'name slug')
            .populate('primaryCategory', 'name slug')
            .exec();
    }

    async findBySku(sku: string): Promise<Product | null> {
        return this.productModel.findOne({ sku, deletedAt: null }).exec();
    }

    async findFeatured(limit: number = 10): Promise<Product[]> {
        return this.productModel
            .find({ isFeatured: true, isActive: true, deletedAt: null })
            .populate('categories', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    async findByCategory(categoryId: string, limit: number = 20): Promise<Product[]> {
        return this.productModel
            .find({
                categories: new Types.ObjectId(categoryId),
                isActive: true,
                deletedAt: null,
            })
            .populate('categories', 'name slug')
            .sort({ createdAt: -1 })
            .limit(limit)
            .exec();
    }

    async update(id: string, data: Partial<Product>): Promise<Product | null> {
        return this.productModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true })
            .exec();
    }

    async softDelete(id: string): Promise<void> {
        await this.productModel
            .findByIdAndUpdate(id, { deletedAt: new Date(), isActive: false })
            .exec();
    }

    async incrementViewCount(id: string): Promise<void> {
        await this.productModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }).exec();
    }

    async updateStats(id: string, averageRating: number, reviewCount: number): Promise<void> {
        await this.productModel
            .findByIdAndUpdate(id, { averageRating, reviewCount })
            .exec();
    }

    async decrementStock(id: string, quantity: number): Promise<void> {
        await this.productModel
            .findByIdAndUpdate(id, { $inc: { stock: -quantity, salesCount: quantity } })
            .exec();
    }

    async checkStock(id: string, quantity: number): Promise<boolean> {
        const product = await this.productModel.findById(id).exec();
        if (!product) return false;
        if (!product.trackInventory) return true;
        return product.stock >= quantity || product.allowBackorder;
    }

    async hardDelete(id: string): Promise<Product | null> {
        return this.productModel.findByIdAndDelete(id).exec();
    }
}
