import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { FirebaseAuthService } from './firebase-auth.service';
import { PrismaModule } from '../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [FirebaseAuthService],
  exports: [FirebaseAuthService],
})
export class AuthModule {}
