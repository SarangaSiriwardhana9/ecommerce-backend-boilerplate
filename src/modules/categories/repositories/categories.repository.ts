import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from '../schemas/category.model';

@Injectable()
export class CategoriesRepository {
    constructor(@InjectModel(Category.name) private categoryModel: Model<Category>) { }

    async create(categoryData: Partial<Category>): Promise<Category> {
        const category = new this.categoryModel(categoryData);
        return category.save();
    }

    async findAll(includeInactive: boolean = false) {
        const filter: any = {};
        if (!includeInactive) {
            filter.isActive = true;
        }
        return this.categoryModel.find(filter).sort({ displayOrder: 1, name: 1 }).exec();
    }

    async findById(id: string): Promise<Category | null> {
        return this.categoryModel.findById(id).populate('parentCategory', 'name slug').exec();
    }

    async findBySlug(slug: string): Promise<Category | null> {
        return this.categoryModel.findOne({ slug }).populate('parentCategory', 'name slug').exec();
    }

    async findByParent(parentId: string | null): Promise<Category[]> {
        const query = parentId ? { parentCategory: new Types.ObjectId(parentId) } : { parentCategory: null };
        return this.categoryModel.find(query).sort({ displayOrder: 1, name: 1 }).exec();
    }

    async findRootCategories(): Promise<Category[]> {
        return this.categoryModel
            .find({ parentCategory: null, isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .exec();
    }

    async findFeatured(): Promise<Category[]> {
        return this.categoryModel
            .find({ isFeatured: true, isActive: true })
            .sort({ displayOrder: 1, name: 1 })
            .exec();
    }

    async update(id: string, data: Partial<Category>): Promise<Category | null> {
        return this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.categoryModel.findByIdAndDelete(id).exec();
    }

    async hasChildren(id: string): Promise<boolean> {
        const count = await this.categoryModel.countDocuments({ parentCategory: new Types.ObjectId(id) }).exec();
        return count > 0;
    }

    async countByParent(parentId: string): Promise<number> {
        return this.categoryModel.countDocuments({ parentCategory: new Types.ObjectId(parentId) }).exec();
    }
}
