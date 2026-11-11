import { Module } from '@nestjs/common';
import { PrismaModule } from './database/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { LanguagesModule } from './modules/languages/languages.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { PanchangamModule } from './modules/panchangam/panchangam.module';
import { HomeModule } from './modules/home/home.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    LanguagesModule,
    CategoriesModule,
    PanchangamModule,
    HomeModule,
    AdminModule,
    AuthModule,
    ContactModule,
  ],
})
export class AppModule {}
