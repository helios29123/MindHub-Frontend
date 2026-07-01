const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu seed dữ liệu...');

  // Mock Users
  const user1 = await prisma.user.upsert({
    where: { email: 'student@mindhub.edu.vn' },
    update: {},
    create: {
      name: 'Nguyễn Đình Văn',
      email: 'student@mindhub.edu.vn',
      role: 'student',
      bio: 'Học viên đam mê công nghệ',
    },
  });

  const instructor1 = await prisma.user.upsert({
    where: { email: 'instructor@mindhub.edu.vn' },
    update: {},
    create: {
      name: 'Tiến Sĩ Lê Quốc Khánh',
      email: 'instructor@mindhub.edu.vn',
      role: 'instructor',
      bio: 'Giảng viên AI',
    },
  });

  // Mock Courses
  const course1 = await prisma.course.create({
    data: {
      title: 'Học máy Cơ bản & Đồ án thực chiến',
      category: 'Artificial Intelligence',
      instructorId: instructor1.id,
      price: 1200000,
      status: 'active',
    }
  });

  console.log('Seed dữ liệu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
