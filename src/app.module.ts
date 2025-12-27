import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { databaseConfig, jwtConfig } from './config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    // Database
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ProductVariantsModule,
    DiscountsModule,
    CartModule,
    OrdersModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
