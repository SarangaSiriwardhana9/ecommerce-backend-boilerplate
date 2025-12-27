import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { Order, OrderSchema } from './schemas/order.model';
import { CartModule } from '../cart/cart.module';
import { ProductsModule } from '../products/products.module';
import { ProductVariantsModule } from '../product-variants/product-variants.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema }
        ]),
        CartModule,
        ProductsModule,
        ProductVariantsModule,
    ],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService],
})
export class OrdersModule { }
