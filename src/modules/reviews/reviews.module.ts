import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { ReviewsRepository } from './repositories/reviews.repository';
import { Review, ReviewSchema } from './schemas/review.model';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Review.name, schema: ReviewSchema }
        ]),
        ProductsModule,
        OrdersModule,
    ],
    controllers: [ReviewsController],
    providers: [ReviewsService, ReviewsRepository],
    exports: [ReviewsService],
})
export class ReviewsModule { }
