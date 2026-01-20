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
    const itemGroups = new Map<string, any[]>();

    allItems.forEach(item => {
      const key = `${item.name}_${item.categoryId}`;
      if (!itemGroups.has(key)) {
        itemGroups.set(key, []);
      }
      itemGroups.get(key)!.push(item);
    });

    let duplicatesRemoved = 0;

    // For each group, keep only the first item (oldest) and delete the rest
    for (const [key, items] of itemGroups) {
      if (items.length > 1) {
        console.log(`Found ${items.length} duplicates for: ${items[0].name}`);

        // Keep the first item, delete the rest
        const itemsToDelete = items.slice(1);

        for (const item of itemsToDelete) {
          // Check if this item is referenced in any orders
          const orderCount = await prisma.orderDetail.count({
            where: { itemId: item.id }
          });

          const reviewCount = await prisma.review.count({
            where: { foodItemId: item.id }
          });

          if (orderCount > 0 || reviewCount > 0) {
            console.log(`  ⚠️  Cannot delete ${item.id} - has ${orderCount} orders and ${reviewCount} reviews`);

            // Instead of deleting, we could merge the references to the original item
            // But for now, we'll skip items with references
            continue;
          }

          await prisma.foodItem.delete({
            where: { id: item.id }
          });
          duplicatesRemoved++;
          console.log(`  ✅ Deleted duplicate: ${item.id}`);
        }
      }
    }

    console.log(`\n✨ Cleanup completed! Removed ${duplicatesRemoved} duplicate items.`);

    // Show current state
    const finalCount = await prisma.foodItem.count();
    console.log(`📊 Total food items in database: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupDuplicates().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});