import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BusinessesModule,
    CategoriesModule,
    ProductsModule,
  ],
})
export class AppModule {}

