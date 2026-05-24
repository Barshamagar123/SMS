import { PrismaClient, RoleEnum, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('AdminPassword123!', 10);

  // Create or update SUPERADMIN
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
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });