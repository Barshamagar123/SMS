import { PrismaClient, RoleEnum, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🌱 Starting seeding...');

    const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@school.com' },
      update: {},
      create: {
        email: 'superadmin@school.com',
        password: hashedPassword,
        name: 'Super Admin',
        phone: '+1234567890',
        role: RoleEnum.SUPERADMIN,
        status: UserStatus.ACTIVE,
        isActive: true,
        isFirstLogin: false,
        failedAttempts: 0
      }
    });

    console.log('✅ SUPERADMIN CREATED:', superAdmin.email);
    console.log('📧 Email: superadmin@school.com');
    console.log('🔑 Password: AdminPassword123!');
    console.log('👤 Role: SUPERADMIN');
    console.log('🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });