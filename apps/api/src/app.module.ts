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
import { SplashModule } from './modules/splash/splash.module';
import { MasterModule } from './modules/master/master.module';
import { UsersModule } from './modules/users/users.module';
import { DharmaKarthaModule } from './modules/dharma-kartha/dharma-kartha.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TemplesModule } from './modules/temples/temples.module';

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
    SplashModule,
    MasterModule,
    UsersModule,
    DharmaKarthaModule,
    NotificationsModule,
    TemplesModule,
  ],
})
export class AppModule {}
