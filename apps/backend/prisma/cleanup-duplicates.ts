import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicates() {
  console.log('🧹 Starting duplicate cleanup...');

  try {
    // Get all food items
    const allItems = await prisma.foodItem.findMany({
      orderBy: { createdAt: 'asc' }, // Keep the oldest items
    });

    // Group items by name and categoryId
    const itemGroups = new Map<string, typeof allItems>();

    for (const item of allItems) {
      const key = `${item.name}-${item.categoryId}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, []);
      }
      itemGroups.get(key)!.push(item);
    }

    let duplicatesRemoved = 0;

    // Remove duplicates, keeping only the first (oldest) item
    for (const [key, items] of itemGroups) {
      if (items.length > 1) {
        console.log(`Found ${items.length} duplicates for: ${items[0].name}`);

        // Keep the first item, delete the rest
        const itemsToDelete = items.slice(1);

        for (const item of itemsToDelete) {
          // First, delete any related records (reviews, orderDetails)
          await prisma.review.deleteMany({
            where: { foodItemId: item.id }
          });

          await prisma.orderDetail.deleteMany({
            where: { itemId: item.id }
          });

          // Then delete the food item
          await prisma.foodItem.delete({
            where: { id: item.id }
          });

          duplicatesRemoved++;
        }
      }
    }

    console.log(`✅ Removed ${duplicatesRemoved} duplicate food items`);

    // Verify the cleanup
    const remainingItems = await prisma.foodItem.findMany();
    console.log(`📊 Total food items after cleanup: ${remainingItems.length}`);

    // Check for any remaining duplicates
    const nameCount = new Map<string, number>();
    for (const item of remainingItems) {
      const key = `${item.name}-${item.categoryId}`;
      nameCount.set(key, (nameCount.get(key) || 0) + 1);
    }

    const stillDuplicates = Array.from(nameCount.entries()).filter(([_, count]) => count > 1);
    if (stillDuplicates.length > 0) {
      console.warn('⚠️ Warning: Some duplicates still exist:');
      stillDuplicates.forEach(([name, count]) => {
        console.warn(`  - ${name}: ${count} times`);
      });
    } else {
      console.log('✨ No duplicates remaining!');
    }

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupDuplicates()
  .catch((e) => {
    console.error('Failed to cleanup duplicates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });