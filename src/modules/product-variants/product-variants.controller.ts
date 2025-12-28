import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductVariantsService } from './product-variants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { createProductVariantSchema, updateProductVariantSchema } from './schemas/product-variant.schema';

@Controller('product-variants')
export class ProductVariantsController {
    constructor(private variantsService: ProductVariantsService) { }

    @Get('product/:productId')
    async findByProduct(@Param('productId') productId: string) {
        const variants = await this.variantsService.findByProduct(productId);
        return {
            data: variants,
            message: 'Product variants retrieved successfully'
        };
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        const variant = await this.variantsService.findById(id);
        return {
            data: variant,
            message: 'Variant retrieved successfully'
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async create(@Body() body: unknown) {
        const dto = createProductVariantSchema.parse(body);
        const variant = await this.variantsService.create(dto);
        return {
            data: variant,
            message: 'Variant created successfully'
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async update(@Param('id') id: string, @Body() body: unknown) {
        const dto = updateProductVariantSchema.parse(body);
        const variant = await this.variantsService.update(id, dto);
        return {
            data: variant,
            message: 'Variant updated successfully'
        };
    }

    @Post('bulk/:productId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async bulkCreate(@Param('productId') productId: string, @Body() body: unknown) {
        const { variants } = body as { variants: any[] };
        const createdVariants = await this.variantsService.bulkCreate(productId, variants);
        return {
            data: createdVariants,
            message: `${createdVariants.length} variants created successfully`
        };
    }

    @Delete('product/:productId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async deleteByProduct(@Param('productId') productId: string) {
        const result = await this.variantsService.deleteByProduct(productId);
        return result;
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async delete(@Param('id') id: string) {
        const result = await this.variantsService.delete(id);
        return result;
    }
}
