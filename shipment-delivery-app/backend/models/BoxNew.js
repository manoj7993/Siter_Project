const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class Box {
  static async create(boxData) {
    try {
      return await prisma.box.create({
        data: boxData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      return await prisma.box.findMany({
        where: filters,
        orderBy: {
          basePrice: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await prisma.box.findUnique({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      return await prisma.box.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      return await prisma.box.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(id) {
    try {
      const box = await prisma.box.findUnique({
        where: { id },
      });

      if (!box) {
        throw new Error('Box not found');
      }

      return await prisma.box.update({
        where: { id },
        data: { isActive: !box.isActive },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getActiveBoxes() {
    try {
      return await prisma.box.findMany({
        where: { isActive: true },
        orderBy: {
          basePrice: 'asc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static calculateVolume(length, width, height) {
    return length * width * height;
  }

  static async searchBoxes(query) {
    try {
      return await prisma.box.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            },
            {
              description: {
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
}

module.exports = Box;
