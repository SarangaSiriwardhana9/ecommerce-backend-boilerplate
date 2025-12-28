import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductsRepository } from './repositories/products.repository';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto';

@Injectable()
export class ProductsService {
    constructor(
        private productsRepository: ProductsRepository,
        private categoriesService: CategoriesService,
    ) { }

    async create(createDto: CreateProductDto, userId?: string) {
        const existingProduct = await this.productsRepository.findBySlug(createDto.slug);
        if (existingProduct) {
            throw new ConflictException('Product with this slug already exists');
        }

        const existingSku = await this.productsRepository.findBySku(createDto.sku);
        if (existingSku) {
            throw new ConflictException('Product with this SKU already exists');
        }

        if (createDto.primaryCategory) {
            await this.categoriesService.findById(createDto.primaryCategory);
        }

        if (createDto.categories && createDto.categories.length > 0) {
            for (const categoryId of createDto.categories) {
                await this.categoriesService.findById(categoryId);
            }
        }

        const productData: any = {
            ...createDto,
            categories: createDto.categories?.map(id => new Types.ObjectId(id)) || [],
            primaryCategory: createDto.primaryCategory ? new Types.ObjectId(createDto.primaryCategory) : undefined,
            createdBy: userId ? new Types.ObjectId(userId) : undefined,
        };

        if (createDto.publishedAt) {
            productData.publishedAt = new Date(createDto.publishedAt);
        }
        if (createDto.availableFrom) {
            productData.availableFrom = new Date(createDto.availableFrom);
        }
        if (createDto.availableUntil) {
            productData.availableUntil = new Date(createDto.availableUntil);
        }

        return this.productsRepository.create(productData);
    }

    async findAll(queryDto: ProductQueryDto) {
        return this.productsRepository.findAll(queryDto);
    }

    async findById(id: string) {
        const product = await this.productsRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async findBySlug(slug: string) {
        const product = await this.productsRepository.findBySlug(slug);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.productsRepository.incrementViewCount(product._id as any);

        return product;
    }

    async findFeatured(limit: number = 10) {
        return this.productsRepository.findFeatured(limit);
    }

    async findByCategory(categoryId: string, limit: number = 20) {
        await this.categoriesService.findById(categoryId);
        return this.productsRepository.findByCategory(categoryId, limit);
    }

    async update(id: string, updateDto: UpdateProductDto) {
        const product = await this.productsRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (updateDto.slug && updateDto.slug !== product.slug) {
            const existingProduct = await this.productsRepository.findBySlug(updateDto.slug);
            if (existingProduct) {
                throw new ConflictException('Product with this slug already exists');
            }
        }

        if (updateDto.sku && updateDto.sku !== product.sku) {
            const existingSku = await this.productsRepository.findBySku(updateDto.sku);
            if (existingSku) {
                throw new ConflictException('Product with this SKU already exists');
            }
        }

        if (updateDto.primaryCategory) {
            await this.categoriesService.findById(updateDto.primaryCategory);
        }

        if (updateDto.categories && updateDto.categories.length > 0) {
            for (const categoryId of updateDto.categories) {
                await this.categoriesService.findById(categoryId);
            }
        }

        const updateData: any = { ...updateDto };

        if (updateDto.categories) {
            updateData.categories = updateDto.categories.map(id => new Types.ObjectId(id));
        }
        if (updateDto.primaryCategory) {
            updateData.primaryCategory = new Types.ObjectId(updateDto.primaryCategory);
        }
        if (updateDto.publishedAt) {
            updateData.publishedAt = new Date(updateDto.publishedAt);
        }
        if (updateDto.availableFrom) {
            updateData.availableFrom = new Date(updateDto.availableFrom);
        }
        if (updateDto.availableUntil) {
            updateData.availableUntil = new Date(updateDto.availableUntil);
        }

        return this.productsRepository.update(id, updateData);
    }

    async delete(id: string) {
        const product = await this.productsRepository.findById(id);
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Delete product images from Supabase if they exist
        if (product.images && product.images.length > 0) {
            const { deleteProductImages } = await import('../../common/utils/supabase.util');
            const imageUrls = product.images.map(img => img.url);
            await deleteProductImages(imageUrls);
        }

        await this.productsRepository.hardDelete(id);
        return { message: 'Product deleted successfully' };
    }

    async checkStock(id: string, quantity: number): Promise<boolean> {
        return this.productsRepository.checkStock(id, quantity);
    }

    async updateStats(id: string, averageRating: number, reviewCount: number) {
        return this.productsRepository.updateStats(id, averageRating, reviewCount);
    }
}
