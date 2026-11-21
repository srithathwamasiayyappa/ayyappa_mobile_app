import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@saranamayyappa.org';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@Ayyappa2026!';
  const fullName = 'Saranam Ayyappa Master Admin';
  const role = 'SUPER_ADMIN';

  console.log(`Seeding Admin User (${email})...`);

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      fullName,
      role,
      isActive: true,
      passwordHash,
    },
    create: {
      email,
      fullName,
      role,
      isActive: true,
      passwordHash,
    },
  });

  console.log(`Admin user successfully seeded: ID ${admin.id} (${admin.email})`);
}

main()
  .catch((e) => {
    console.error('Failed to seed admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
