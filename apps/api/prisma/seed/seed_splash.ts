import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.splashAsset.count();
  if (count === 0) {
    const created = await prisma.splashAsset.create({
      data: {
        title: 'Saranam Ayyappa - Thathvamasi Sacred Arch',
        description: 'Approved Master Devotional Splash Artwork with Golden Arch, Lord Ayyappa, and Sabarimala Temple',
        imageUrl: '/uploads/splash/default_splash.jpg',
        storageKey: 'default_splash.jpg',
        mimeType: 'image/jpeg',
        fileSize: 403436,
        imageWidth: 1080,
        imageHeight: 1920,
        aspectRatio: '9:16',
        platform: 'ALL',
        status: 'PUBLISHED',
        version: 1,
        createdBy: 'SUPER_ADMIN',
      },
    });
    console.log('Seeded initial published SplashAsset ID:', created.id);
  } else {
    console.log('SplashAsset already has', count, 'records');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

