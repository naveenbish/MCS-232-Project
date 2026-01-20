import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const prisma = new PrismaClient();

async function fixImagePaths() {
  console.log('🔧 Fixing image paths in database...');

  try {
    // Get all food items
    const foodItems = await prisma.foodItem.findMany();

    console.log(`Found ${foodItems.length} food items to update`);

    // Map of food names to their correct image files
    const imageMap: Record<string, string> = {
      'Spring Rolls': '/uploads/food-items/spring-rolls-1764082660185.png',
      'Chicken Wings': '/uploads/food-items/chicken-wings-1764082662278.png',
      'Garlic Bread': '/uploads/food-items/garlic-bread.png',
      'Butter Chicken': '/uploads/food-items/butter-chicken.png',
      'Paneer Tikka Masala': '/uploads/food-items/paneer-tikka-masala.png',
      'Biryani': '/uploads/food-items/biryani.png',
      'Chocolate Lava Cake': '/uploads/food-items/chocolate-lava-cake.png',
      'Ice Cream Sundae': '/uploads/food-items/ice-cream-sundae.png',
      'Fresh Lime Soda': '/uploads/food-items/fresh-lime-soda.png',
      'Mango Lassi': '/uploads/food-items/mango-lassi.png',
      'Margherita Pizza': '/uploads/food-items/margherita-pizza.png',
      'Pepperoni Pizza': '/uploads/food-items/pepperoni-pizza.png',
      'Classic Chicken Burger': '/uploads/food-items/classic-chicken-burger.png',
      'Veggie Burger': '/uploads/food-items/veggie-burger.png',
    };

    let updatedCount = 0;

    for (const item of foodItems) {
      const correctPath = imageMap[item.name];

      if (correctPath) {
        // Update the image path to use the correct URL format
        await prisma.foodItem.update({
          where: { id: item.id },
          data: { image: correctPath }
        });
        console.log(`✅ Updated ${item.name}: ${correctPath}`);
        updatedCount++;
      } else if (item.image && item.image.includes('/home/')) {
        // If the image path contains the absolute file system path, set it to null
        await prisma.foodItem.update({
          where: { id: item.id },
          data: { image: null }
        });
        console.log(`⚠️  Cleared invalid path for ${item.name}`);
        updatedCount++;
      }
    }

    console.log(`\n✨ Successfully updated ${updatedCount} food items`);

    // Verify the update
    const verifyItems = await prisma.foodItem.findMany({
      take: 3,
      where: {
        image: { not: null }
      }
    });

    console.log('\n📸 Sample updated items:');
    verifyItems.forEach(item => {
      console.log(`  - ${item.name}: ${item.image}`);
    });

  } catch (error) {
    console.error('❌ Error fixing image paths:', error);
    throw error;
  }
}

fixImagePaths()
  .catch((e) => {
    console.error('Failed to fix image paths:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });