import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessesModule } from './modules/businesses/businesses.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { InquiriesModule } from './modules/inquiries/inquiries.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessagesModule } from './modules/messages/messages.module';
import { QuotationsModule } from './modules/quotations/quotations.module';
import { RequirementsModule } from './modules/requirements/requirements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BusinessesModule,
    CategoriesModule,
    ProductsModule,
    InquiriesModule,
    AdminModule,
    MessagesModule,
    QuotationsModule,
    RequirementsModule,
    NotificationsModule,
  ],
})
export class AppModule {}

