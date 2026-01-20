import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@cravecart.com' },
    update: {},
    create: {
      name: 'CraveCart Admin',
      email: 'admin@cravecart.com',
      password: adminPassword,
      role: 'admin',
      contact: '9876543210',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Appetizers' },
      update: {},
      create: {
        name: 'Appetizers',
        description: 'Delicious starters to begin your meal',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Main Course' },
      update: {},
      create: {
        name: 'Main Course',
        description: 'Hearty main dishes to satisfy your hunger',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Desserts' },
      update: {},
      create: {
        name: 'Desserts',
        description: 'Sweet treats to end your meal',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Beverages' },
      update: {},
      create: {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Pizza' },
      update: {},
      create: {
        name: 'Pizza',
        description: 'Freshly baked pizzas with various toppings',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Burgers' },
      update: {},
      create: {
        name: 'Burgers',
        description: 'Juicy burgers with premium ingredients',
      },
    }),
  ]);
  console.log(`✅ ${categories.length} categories created`);

  // Create food items
  const foodItems = [
    // Appetizers
    {
      name: 'Spring Rolls',
      price: 120,
      categoryId: categories[0].id,
      description: 'Crispy vegetable spring rolls served with sweet chili sauce',
      image: '/uploads/food-items/spring-rolls-1764082660185.png',
      isVeg: true,
      availabilityStatus: true,
    },
    {
      name: 'Chicken Wings',
      price: 250,
      categoryId: categories[0].id,
      description: 'Spicy buffalo chicken wings with ranch dressing',
      image: '/uploads/food-items/chicken-wings-1764082662278.png',
      isVeg: false,
      availabilityStatus: true,
    },
    {
      name: 'Garlic Bread',
      price: 80,
      categoryId: categories[0].id,
      description: 'Toasted bread with garlic butter and herbs',
      image: '/uploads/food-items/garlic-bread.png',
      isVeg: true,
      availabilityStatus: true,
    },

    // Main Course
    {
      name: 'Butter Chicken',
      price: 320,
      categoryId: categories[1].id,
      description: 'Tender chicken in rich, creamy tomato gravy',
      image: '/uploads/food-items/butter-chicken.png',
      isVeg: false,
      availabilityStatus: true,
    },
    {
      name: 'Paneer Tikka Masala',
      price: 280,
      categoryId: categories[1].id,
      description: 'Grilled cottage cheese in spiced tomato gravy',
      image: '/uploads/food-items/paneer-tikka-masala.png',
      isVeg: true,
      availabilityStatus: true,
    },
    {
      name: 'Biryani',
      price: 300,
      categoryId: categories[1].id,
      description: 'Fragrant basmati rice with aromatic spices and tender meat',
      image: '/uploads/food-items/biryani.png',
      isVeg: false,
      availabilityStatus: true,
    },

    // Desserts
    {
      name: 'Chocolate Lava Cake',
      price: 150,
      categoryId: categories[2].id,
      description: 'Warm chocolate cake with molten chocolate center',
      image: '/uploads/food-items/chocolate-lava-cake.png',
      isVeg: true,
      availabilityStatus: true,
    },
    {
      name: 'Ice Cream Sundae',
      price: 120,
      categoryId: categories[2].id,
      description: 'Vanilla ice cream with chocolate sauce and nuts',
      image: '/uploads/food-items/ice-cream-sundae.png',
      isVeg: true,
      availabilityStatus: true,
    },

    // Beverages
    {
      name: 'Fresh Lime Soda',
      price: 60,
      categoryId: categories[3].id,
      description: 'Refreshing lime juice with soda and mint',
      image: '/uploads/food-items/fresh-lime-soda.png',
      isVeg: true,
      availabilityStatus: true,
    },
    {
      name: 'Mango Lassi',
      price: 80,
      categoryId: categories[3].id,
      description: 'Creamy yogurt drink with fresh mango pulp',
      image: '/uploads/food-items/mango-lassi.png',
      isVeg: true,
      availabilityStatus: true,
    },

    // Pizza
    {
      name: 'Margherita Pizza',
      price: 280,
      categoryId: categories[4].id,
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      image: '/uploads/food-items/margherita-pizza.png',
      isVeg: true,
      availabilityStatus: true,
    },
    {
      name: 'Pepperoni Pizza',
      price: 350,
      categoryId: categories[4].id,
      description: 'Loaded with pepperoni and extra cheese',
      image: '/uploads/food-items/pepperoni-pizza.png',
      isVeg: false,
      availabilityStatus: true,
    },

    // Burgers
    {
      name: 'Classic Chicken Burger',
      price: 220,
      categoryId: categories[5].id,
      description: 'Juicy chicken patty with lettuce, tomato, and special sauce',
      image: '/uploads/food-items/classic-chicken-burger.png',
      isVeg: false,
      availabilityStatus: true,
    },
    {
      name: 'Veggie Burger',
      price: 180,
      categoryId: categories[5].id,
      description: 'Plant-based patty with fresh vegetables',
      image: '/uploads/food-items/veggie-burger.png',
      isVeg: true,
      availabilityStatus: true,
    },
  ];

  for (const item of foodItems) {
    // First check if the item already exists
    const existingItem = await prisma.foodItem.findFirst({
      where: {
        name: item.name,
        categoryId: item.categoryId
      }
    });

    if (!existingItem) {
      await prisma.foodItem.create({
        data: item,
      });
    }
  }
  console.log(`✅ ${foodItems.length} food items created`);

  // Create sample users
  const userPassword = await bcrypt.hash('User@123456', 10);
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: userPassword,
        contact: '9123456780',
        address: '123 Main Street, Mumbai, Maharashtra 400001',
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: userPassword,
        contact: '9123456781',
        address: '456 Park Avenue, Delhi, Delhi 110001',
      },
    }),
  ]);
  console.log(`✅ ${users.length} sample users created`);

  console.log('');
  console.log('✨ Database seed completed successfully!');
  console.log('');
  console.log('📝 Default Credentials:');
  console.log('   Admin: admin@cravecart.com / Admin@123456');
  console.log('   User: john.doe@example.com / User@123456');
  console.log('   User: jane.smith@example.com / User@123456');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
