import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsRepository } from './repositories/product-variants.repository';
import { ProductVariant, ProductVariantSchema } from './schemas/product-variant.model';
import { ProductsModule } from '../products/products.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: ProductVariant.name, schema: ProductVariantSchema }
        ]),
        ProductsModule,
    ],
    controllers: [ProductVariantsController],
    providers: [ProductVariantsService, ProductVariantsRepository],
    exports: [ProductVariantsService],
})
export class ProductVariantsModule { }
