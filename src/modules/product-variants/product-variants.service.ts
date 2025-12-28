import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductsService } from '../products/products.service';
import { CreateProductVariantDto, UpdateProductVariantDto } from './dto';

@Injectable()
export class ProductVariantsService {
    constructor(
        private variantsRepository: ProductVariantsRepository,
        private productsService: ProductsService,
    ) { }

    async create(createDto: CreateProductVariantDto) {
        const existingVariant = await this.variantsRepository.findBySku(createDto.sku);
        if (existingVariant) {
            throw new ConflictException('Variant with this SKU already exists');
        }

        const product = await this.productsService.findById(createDto.productId);
        if (!product.hasVariants) {
            throw new BadRequestException('Product does not support variants');
        }

        const variantData: any = {
            ...createDto,
            productId: new Types.ObjectId(createDto.productId),
        };

        return this.variantsRepository.create(variantData);
    }

    async findAll() {
        return this.variantsRepository.findAll();
    }

    async findById(id: string) {
        const variant = await this.variantsRepository.findById(id);
        if (!variant) {
            throw new NotFoundException('Variant not found');
        }
        return variant;
    }

    async findByProduct(productId: string) {
        await this.productsService.findById(productId);
        return this.variantsRepository.findByProduct(productId);
    }

    async update(id: string, updateDto: UpdateProductVariantDto) {
        const variant = await this.variantsRepository.findById(id);
        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        if (updateDto.sku && updateDto.sku !== variant.sku) {
            const existingVariant = await this.variantsRepository.findBySku(updateDto.sku);
            if (existingVariant) {
                throw new ConflictException('Variant with this SKU already exists');
            }
        }

        return this.variantsRepository.update(id, updateDto as any);
    }

    async bulkCreate(productId: string, variants: any[]) {
        const product = await this.productsService.findById(productId);
        if (!product.hasVariants) {
            throw new BadRequestException('Product does not support variants');
        }

        const skus = variants.map(v => v.sku);
        const existingVariants = await this.variantsRepository.findBySku(skus[0]);
        if (existingVariants) {
            throw new ConflictException('One or more SKUs already exist');
        }

        const variantsData = variants.map(v => ({
            ...v,
            productId: new Types.ObjectId(productId),
        }));

        const created = [];
        for (const variantData of variantsData) {
            const variant = await this.variantsRepository.create(variantData);
            created.push(variant);
        }

        return created;
    }

    async deleteByProduct(productId: string) {
        await this.productsService.findById(productId);
        const variants = await this.variantsRepository.findByProduct(productId);

        for (const variant of variants) {
            await this.variantsRepository.delete(variant._id.toString());
        }

        return { message: `${variants.length} variants deleted successfully` };
    }

    async delete(id: string) {
        const variant = await this.variantsRepository.findById(id);
        if (!variant) {
            throw new NotFoundException('Variant not found');
        }

        await this.variantsRepository.delete(id);
        return { message: 'Variant deleted successfully' };
    }

    async checkStock(id: string, quantity: number): Promise<boolean> {
        return this.variantsRepository.checkStock(id, quantity);
    }

    async decrementStock(id: string, quantity: number) {
        return this.variantsRepository.decrementStock(id, quantity);
    }

    async incrementStock(id: string, quantity: number) {
        return this.variantsRepository.incrementStock(id, quantity);
    }
}
