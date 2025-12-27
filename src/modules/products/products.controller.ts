import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createProductSchema, updateProductSchema, productQuerySchema } from './schemas/product.schema';

@Controller('products')
export class ProductsController {
    constructor(private productsService: ProductsService) { }

    @Get()
    async findAll(@Query() query: any) {
        const parsedQuery = productQuerySchema.parse({
            ...query,
            page: query.page ? parseInt(query.page) : 1,
            limit: query.limit ? parseInt(query.limit) : 20,
            minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
            maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
            inStock: query.inStock ? query.inStock === 'true' : undefined,
            isFeatured: query.isFeatured ? query.isFeatured === 'true' : undefined,
            categories: query.categories ? (Array.isArray(query.categories) ? query.categories : [query.categories]) : undefined,
            tags: query.tags ? (Array.isArray(query.tags) ? query.tags : [query.tags]) : undefined,
        });
        const result = await this.productsService.findAll(parsedQuery);
        return {
            data: result,
            message: 'Products retrieved successfully'
        };
    }

    @Get('featured')
    async findFeatured(@Query('limit') limit?: string) {
        const parsedLimit = limit ? parseInt(limit) : 10;
        const products = await this.productsService.findFeatured(parsedLimit);
        return {
            data: products,
            message: 'Featured products retrieved successfully'
        };
    }

    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
        const product = await this.productsService.findBySlug(slug);
        return {
            data: product,
            message: 'Product retrieved successfully'
        };
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async create(@Body() body: unknown, @CurrentUser() user: any) {
        const dto = createProductSchema.parse(body);
        const product = await this.productsService.create(dto, user.sub);
        return {
            data: product,
            message: 'Product created successfully'
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async update(@Param('id') id: string, @Body() body: unknown) {
        const dto = updateProductSchema.parse(body);
        const product = await this.productsService.update(id, dto);
        return {
            data: product,
            message: 'Product updated successfully'
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async delete(@Param('id') id: string) {
        const result = await this.productsService.delete(id);
        return result;
    }
}
