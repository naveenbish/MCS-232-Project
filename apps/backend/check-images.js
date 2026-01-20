const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  const items = await prisma.foodItem.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
      image: true
    }
  });

  console.log('Food items with image paths:');
  items.forEach(item => {
    console.log(`- ${item.name}: ${item.image}`);
  });

  await prisma.$disconnect();
}

checkImages().catch(console.error);