import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { CategoriesRepository } from './repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
    constructor(private categoriesRepository: CategoriesRepository) { }

    async create(createDto: CreateCategoryDto) {
        const existingCategory = await this.categoriesRepository.findBySlug(createDto.slug);
        if (existingCategory) {
            throw new ConflictException('Category with this slug already exists');
        }

        if (createDto.parentCategory) {
            const parent = await this.categoriesRepository.findById(createDto.parentCategory);
            if (!parent) {
                throw new NotFoundException('Parent category not found');
            }
        }

        const categoryData: any = {
            ...createDto,
            parentCategory: createDto.parentCategory ? new Types.ObjectId(createDto.parentCategory) : null,
        };

        return this.categoriesRepository.create(categoryData);
    }

    async findAll(includeInactive: boolean = false) {
        return this.categoriesRepository.findAll(includeInactive);
    }

    async findById(id: string) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async findBySlug(slug: string) {
        const category = await this.categoriesRepository.findBySlug(slug);
        if (!category) {
            throw new NotFoundException('Category not found');
        }
        return category;
    }

    async findFeatured() {
        return this.categoriesRepository.findFeatured();
    }

    async buildTree() {
        const allCategories = await this.categoriesRepository.findAll(false);
        const categoryMap = new Map();
        const tree: any[] = [];

        allCategories.forEach(category => {
            const categoryObj = category.toObject();
            categoryMap.set((category._id as Types.ObjectId).toString(), {
                ...categoryObj,
                children: []
            });
        });

        allCategories.forEach(category => {
            const categoryNode = categoryMap.get((category._id as Types.ObjectId).toString());
            if (category.parentCategory) {
                const parent = categoryMap.get(category.parentCategory.toString());
                if (parent) {
                    parent.children.push(categoryNode);
                }
            } else {
                tree.push(categoryNode);
            }
        });

        return tree;
    }

    async update(id: string, updateDto: UpdateCategoryDto) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (updateDto.slug && updateDto.slug !== category.slug) {
            const existingCategory = await this.categoriesRepository.findBySlug(updateDto.slug);
            if (existingCategory) {
                throw new ConflictException('Category with this slug already exists');
            }
        }

        if (updateDto.parentCategory) {
            if (updateDto.parentCategory === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }

            const parent = await this.categoriesRepository.findById(updateDto.parentCategory);
            if (!parent) {
                throw new NotFoundException('Parent category not found');
            }

            if (await this.wouldCreateCircularReference(id, updateDto.parentCategory)) {
                throw new BadRequestException('This would create a circular reference');
            }
        }

        const updateData: any = {
            ...updateDto,
            parentCategory: updateDto.parentCategory ? new Types.ObjectId(updateDto.parentCategory) : undefined,
        };

        return this.categoriesRepository.update(id, updateData);
    }

    async delete(id: string) {
        const category = await this.categoriesRepository.findById(id);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const hasChildren = await this.categoriesRepository.hasChildren(id);
        if (hasChildren) {
            throw new BadRequestException('Cannot delete category with subcategories');
        }

        await this.categoriesRepository.delete(id);
        return { message: 'Category deleted successfully' };
    }

    private async wouldCreateCircularReference(categoryId: string, newParentId: string): Promise<boolean> {
        let currentId = newParentId;
        while (currentId) {
            if (currentId === categoryId) {
                return true;
            }
            const parent = await this.categoriesRepository.findById(currentId);
            currentId = parent?.parentCategory?.toString() || '';
        }
        return false;
    }
}
