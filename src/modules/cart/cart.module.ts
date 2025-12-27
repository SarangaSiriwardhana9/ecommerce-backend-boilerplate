import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { Cart, CartSchema } from './schemas/cart.model';
import { ProductsModule } from '../products/products.module';
import { ProductVariantsModule } from '../product-variants/product-variants.module';
import { DiscountsModule } from '../discounts/discounts.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Cart.name, schema: CartSchema }
        ]),
        ProductsModule,
        ProductVariantsModule,
        DiscountsModule,
    ],
    controllers: [CartController],
    providers: [CartService, CartRepository],
    exports: [CartService],
})
export class CartModule { }
