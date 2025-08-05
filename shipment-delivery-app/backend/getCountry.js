const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getCountryId() {
  try {
    const usCountry = await prisma.country.findFirst({
      where: { code: 'US' }
    });
    console.log('US Country:', usCountry);
    
    const allCountries = await prisma.country.findMany({
      take: 5
    });
    console.log('Sample countries:', allCountries);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getCountryId();
