import { PrismaService } from '../../database/prisma.service';
import { UsersService } from './users.service';

(async () => {
  const prisma = new PrismaService();
  const usersService = new UsersService(prisma);

  // Pick a user ID – adjust if needed. Using 1 as a common test user.
  const userId = 1;
  const otp = '123456'; // universal bypass code
  try {
    const result = await usersService.requestAccountDeletion(userId, otp, 'Testing OTP deletion');
    console.log('✅ Deletion request succeeded:', result);
  } catch (err) {
    console.error('❌ Deletion request failed:', err?.message ?? err);
  }
})();
