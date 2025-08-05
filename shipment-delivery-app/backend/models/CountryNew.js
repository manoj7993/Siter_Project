const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class Country {
  static async create(countryData) {
    try {
      return await prisma.country.create({
        data: countryData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      return await prisma.country.findMany({
        where: filters,
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await prisma.country.findUnique({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findByCode(code) {
    try {
      return await prisma.country.findUnique({
        where: { code: code.toUpperCase() },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      return await prisma.country.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      return await prisma.country.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(id) {
    try {
      const country = await prisma.country.findUnique({
        where: { id },
      });

      if (!country) {
        throw new Error('Country not found');
      }

      return await prisma.country.update({
        where: { id },
        data: { isActive: !country.isActive },
      });
    } catch (error) {
      throw error;
    }
  }

  static async searchCountries(query) {
    try {
      return await prisma.country.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              code: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getActiveCountries() {
    try {
      return await prisma.country.findMany({
        where: { isActive: true },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Country;
