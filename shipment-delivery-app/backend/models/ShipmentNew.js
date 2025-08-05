const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

class Shipment {
  static generateTrackingNumber() {
    return `BOX-${uuidv4().substring(0, 8).toUpperCase()}`;
  }

  static async create(shipmentData) {
    try {
      const trackingNumber = this.generateTrackingNumber();
      
      const shipment = await prisma.shipment.create({
        data: {
          ...shipmentData,
          trackingNumber,
        },
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
      });

      return shipment;
    } catch (error) {
      throw error;
    }
  }

  static async findByTrackingNumber(trackingNumber) {
    try {
      return await prisma.shipment.findUnique({
        where: { trackingNumber },
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await prisma.shipment.findUnique({
        where: { id },
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findBySenderId(senderId, filters = {}) {
    try {
      const where = {
        senderId,
        ...filters,
      };

      return await prisma.shipment.findMany({
        where,
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      return await prisma.shipment.findMany({
        where: filters,
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      return await prisma.shipment.update({
        where: { id },
        data: updateData,
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, additionalData = {}) {
    try {
      const updateData = {
        status,
        ...additionalData,
      };

      // If status is DELIVERED, set actual delivery date
      if (status === 'DELIVERED') {
        updateData.actualDeliveryDate = new Date();
      }

      return await prisma.shipment.update({
        where: { id },
        data: updateData,
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      return await prisma.shipment.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async getStatistics(senderId = null) {
    try {
      const where = senderId ? { senderId } : {};

      const [
        total,
        created,
        received,
        inTransit,
        delivered,
        cancelled,
      ] = await Promise.all([
        prisma.shipment.count({ where }),
        prisma.shipment.count({ where: { ...where, status: 'CREATED' } }),
        prisma.shipment.count({ where: { ...where, status: 'RECEIVED' } }),
        prisma.shipment.count({ where: { ...where, status: 'INTRANSIT' } }),
        prisma.shipment.count({ where: { ...where, status: 'DELIVERED' } }),
        prisma.shipment.count({ where: { ...where, status: 'CANCELLED' } }),
      ]);

      return {
        total,
        statusBreakdown: {
          created,
          received,
          inTransit,
          delivered,
          cancelled,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async searchShipments(query, filters = {}) {
    try {
      const where = {
        OR: [
          {
            trackingNumber: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            receiverFirstName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            receiverLastName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            receiverEmail: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        ...filters,
      };

      return await prisma.shipment.findMany({
        where,
        include: {
          sender: {
            include: {
              country: true,
            },
          },
          receiverCountry: true,
          box: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Shipment;
