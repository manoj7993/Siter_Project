const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

// Sample data
const countries = [
  { name: 'Sweden', code: 'SE', currency: 'SEK', multiplier: 1.0, continent: 'EUROPE', shippingZone: 'DOMESTIC' },
  { name: 'Norway', code: 'NO', currency: 'NOK', multiplier: 1.2, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Denmark', code: 'DK', currency: 'DKK', multiplier: 1.1, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Finland', code: 'FI', currency: 'EUR', multiplier: 1.3, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Germany', code: 'DE', currency: 'EUR', multiplier: 1.5, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', multiplier: 1.4, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'United States', code: 'US', currency: 'USD', multiplier: 2.0, continent: 'NORTH_AMERICA', shippingZone: 'ZONE2' },
  { name: 'Canada', code: 'CA', currency: 'CAD', multiplier: 1.8, continent: 'NORTH_AMERICA', shippingZone: 'ZONE2' },
  { name: 'Australia', code: 'AU', currency: 'AUD', multiplier: 2.5, continent: 'OCEANIA', shippingZone: 'ZONE3' },
  { name: 'Japan', code: 'JP', currency: 'JPY', multiplier: 2.2, continent: 'ASIA', shippingZone: 'ZONE2' },
  { name: 'Brazil', code: 'BR', currency: 'BRL', multiplier: 2.8, continent: 'SOUTH_AMERICA', shippingZone: 'ZONE3' },
  { name: 'India', code: 'IN', currency: 'INR', multiplier: 2.0, continent: 'ASIA', shippingZone: 'ZONE2' },
  { name: 'South Africa', code: 'ZA', currency: 'ZAR', multiplier: 2.3, continent: 'AFRICA', shippingZone: 'ZONE3' },
  { name: 'China', code: 'CN', currency: 'CNY', multiplier: 1.9, continent: 'ASIA', shippingZone: 'ZONE2' },
  { name: 'France', code: 'FR', currency: 'EUR', multiplier: 1.3, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Spain', code: 'ES', currency: 'EUR', multiplier: 1.4, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Italy', code: 'IT', currency: 'EUR', multiplier: 1.4, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Netherlands', code: 'NL', currency: 'EUR', multiplier: 1.2, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Belgium', code: 'BE', currency: 'EUR', multiplier: 1.2, continent: 'EUROPE', shippingZone: 'ZONE1' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', multiplier: 1.6, continent: 'EUROPE', shippingZone: 'ZONE1' }
];

const boxes = [
  {
    name: 'Small Box',
    length: 20,
    width: 15,
    height: 10,
    weight: 0.5,
    basePrice: 49,
    color: 'Blue',
    description: 'Perfect for small items like jewelry, electronics accessories, or documents'
  },
  {
    name: 'Medium Box',
    length: 30,
    width: 25,
    height: 20,
    weight: 1.0,
    basePrice: 69,
    color: 'Green',
    description: 'Ideal for books, clothing, or medium-sized electronics'
  },
  {
    name: 'Large Box',
    length: 40,
    width: 35,
    height: 30,
    weight: 2.0,
    basePrice: 99,
    color: 'Red',
    description: 'Great for larger items like shoes, kitchen appliances, or multiple items'
  },
  {
    name: 'Extra Large Box',
    length: 50,
    width: 45,
    height: 40,
    weight: 3.0,
    basePrice: 149,
    color: 'Orange',
    description: 'Perfect for big items like sports equipment, large electronics, or bulk shipments'
  },
  {
    name: 'Document Envelope',
    length: 25,
    width: 18,
    height: 2,
    weight: 0.1,
    basePrice: 29,
    color: 'White',
    description: 'Specially designed for important documents and papers'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.trackingHistory.deleteMany();
    await prisma.shipment.deleteMany();
    await prisma.user.deleteMany();
    await prisma.box.deleteMany();
    await prisma.country.deleteMany();

    console.log('✅ Existing data cleared');

    // Insert countries
    console.log('🌍 Seeding countries...');
    const createdCountries = await prisma.country.createMany({
      data: countries
    });
    console.log(`✅ ${createdCountries.count} countries created`);

    // Get created countries to use their IDs
    const countryList = await prisma.country.findMany();
    const swedishCountry = countryList.find(country => country.code === 'SE');

    // Insert boxes
    console.log('📦 Seeding boxes...');
    const createdBoxes = await prisma.box.createMany({
      data: boxes
    });
    console.log(`✅ ${createdBoxes.count} boxes created`);

    // Create admin user
    console.log('👤 Creating admin user...');
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const adminUser = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@boxinator.com',
        password: hashedPassword,
        dateOfBirth: new Date('1990-01-01'),
        contactNumber: '+46701234567',
        zipCode: '12345',
        countryId: swedishCountry.id,
        role: 'ADMINISTRATOR',
        emailVerified: true
      }
    });

    console.log(`✅ Admin user created: ${adminUser.email}`);

    // Create sample regular user
    console.log('👥 Creating sample user...');
    const sampleUser = await prisma.user.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: hashedPassword,
        dateOfBirth: new Date('1985-05-15'),
        contactNumber: '+46707654321',
        zipCode: '54321',
        countryId: swedishCountry.id,
        role: 'REGISTERED_USER',
        emailVerified: true
      }
    });

    console.log(`✅ Sample user created: ${sampleUser.email}`);

    // Create sample shipments for demonstration
    console.log('📮 Creating sample shipments...');
    const boxList = await prisma.box.findMany();
    const usCountry = countryList.find(country => country.code === 'US');
    const smallBox = boxList.find(box => box.name === 'Small Box');

    if (usCountry && smallBox) {
      const sampleShipment = await prisma.shipment.create({
        data: {
          trackingNumber: 'BOX-DEMO001',
          senderId: sampleUser.id,
          receiverFirstName: 'Jane',
          receiverLastName: 'Smith',
          receiverEmail: 'jane.smith@example.com',
          receiverContactNumber: '+1234567890',
          receiverStreet: '123 Main Street',
          receiverCity: 'New York',
          receiverState: 'NY',
          receiverZipCode: '10001',
          receiverCountryId: usCountry.id,
          boxId: smallBox.id,
          contents: 'Important documents and small electronics',
          weight: 0.8,
          shippingCost: smallBox.basePrice * usCountry.multiplier,
          status: 'INTRANSIT',
          priority: 'NORMAL',
          estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          paymentStatus: 'PAID',
          paymentMethod: 'CREDIT_CARD',
          isInsured: true,
          insuranceValue: 100,
          notes: 'Handle with care - contains electronics'
        }
      });

      // Add tracking history
      await prisma.trackingHistory.createMany({
        data: [
          {
            shipmentId: sampleShipment.id,
            status: 'CREATED',
            location: 'Stockholm, Sweden',
            description: 'Shipment created and pending confirmation'
          },
          {
            shipmentId: sampleShipment.id,
            status: 'RECIEVED',
            location: 'Stockholm, Sweden',
            description: 'Shipment confirmed and ready for dispatch'
          },
          {
            shipmentId: sampleShipment.id,
            status: 'INTRANSIT',
            location: 'Copenhagen, Denmark',
            description: 'Package in transit to destination'
          }
        ]
      });

      console.log(`✅ Sample shipment created: ${sampleShipment.trackingNumber}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 Admin Login:');
    console.log('   Email: admin@boxinator.com');
    console.log('   Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Sample User Login:');
    console.log('   Email: john.doe@example.com');
    console.log('   Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📊 Database Statistics:');
    console.log(`   Countries: ${createdCountries.count}`);
    console.log(`   Box Types: ${createdBoxes.count}`);
    console.log(`   Users: 2 (1 admin, 1 regular)`);
    console.log(`   Sample Shipments: 1`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run the seeder
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding process failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
