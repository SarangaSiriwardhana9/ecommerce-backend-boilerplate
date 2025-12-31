import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { createCategorySchema, updateCategorySchema, categoryQuerySchema } from './schemas/category.schema';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) { }

    @Get()
    async findAll(@Query() query: any) {
        const { includeInactive } = categoryQuerySchema.parse(query);
        const categories = await this.categoriesService.findAll(includeInactive);
        return {
            data: categories,
            message: 'Categories retrieved successfully'
        };
    }

    @Get('tree')
    async getTree() {
        const tree = await this.categoriesService.buildTree();
        return {
            data: tree,
            message: 'Category tree retrieved successfully'
        };
    }


    @Get('featured')
    async getFeatured() {
        const categories = await this.categoriesService.findFeatured();
        return {
            data: categories,
            message: 'Featured categories retrieved successfully'
        };
    }

    @Get('id/:id')
    async findById(@Param('id') id: string) {
        const category = await this.categoriesService.findById(id);
        return {
            data: category,
            message: 'Category retrieved successfully'
        };
    }

    @Get(':slug')
    async findBySlug(@Param('slug') slug: string) {
        const category = await this.categoriesService.findBySlug(slug);
        return {
            data: category,
            message: 'Category retrieved successfully'
        };
    }


    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async create(@Body() body: unknown) {
        const dto = createCategorySchema.parse(body);
        const category = await this.categoriesService.create(dto);
        return {
            data: category,
            message: 'Category created successfully'
        };
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async update(@Param('id') id: string, @Body() body: unknown) {
        const dto = updateCategorySchema.parse(body);
        const category = await this.categoriesService.update(id, dto);
        return {
            data: category,
            message: 'Category updated successfully'
        };
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'super_admin')
    async delete(@Param('id') id: string) {
        const result = await this.categoriesService.delete(id);
        return result;
    }
}
