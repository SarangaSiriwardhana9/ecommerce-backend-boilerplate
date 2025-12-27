import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscountsController } from './discounts.controller';
import { DiscountsService } from './discounts.service';
import { DiscountsRepository } from './repositories/discounts.repository';
import { Discount, DiscountSchema } from './schemas/discount.model';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Discount.name, schema: DiscountSchema }
        ])
    ],
    controllers: [DiscountsController],
    providers: [DiscountsService, DiscountsRepository],
    exports: [DiscountsService],
})
export class DiscountsModule { }
