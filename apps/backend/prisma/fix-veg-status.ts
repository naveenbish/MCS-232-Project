import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixVegStatus() {
  console.log('🔧 Fixing isVeg status for food items...');

  // Define non-vegetarian items
  const nonVegItems = [
    'Chicken Wings',
    'Butter Chicken',
    'Biryani',
    'Pepperoni Pizza',
    'Classic Chicken Burger'
  ];

  // Update each non-veg item
  for (const itemName of nonVegItems) {
    const result = await prisma.foodItem.updateMany({
      where: { name: itemName },
      data: { isVeg: false }
    });

    if (result.count > 0) {
      console.log(`✅ Updated ${itemName} to non-veg`);
    } else {
      console.log(`⚠️ ${itemName} not found in database`);
    }
  }

  // Verify all veg items are correctly marked
  const vegItems = [
    'Spring Rolls',
    'Garlic Bread',
    'Paneer Tikka Masala',
    'Chocolate Lava Cake',
    'Ice Cream Sundae',
    'Fresh Lime Soda',
    'Mango Lassi',
    'Margherita Pizza',
    'Veggie Burger'
  ];

  for (const itemName of vegItems) {
    const result = await prisma.foodItem.updateMany({
      where: { name: itemName },
      data: { isVeg: true }
    });

    if (result.count > 0) {
      console.log(`✅ Verified ${itemName} as veg`);
    }
  }

  // Display final status
  console.log('\n📊 Final Status:');
  const allItems = await prisma.foodItem.findMany({
    select: {
      name: true,
      isVeg: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  console.log('\n🥦 Vegetarian Items:');
  allItems.filter(item => item.isVeg).forEach(item => {
    console.log(`   ✓ ${item.name}`);
  });

  console.log('\n🍖 Non-Vegetarian Items:');
  allItems.filter(item => !item.isVeg).forEach(item => {
    console.log(`   ✓ ${item.name}`);
  });

  console.log('\n✨ isVeg status fixed successfully!');
}

fixVegStatus()
  .catch((e) => {
    console.error('❌ Error fixing veg status:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });