const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

class User {
  static async create(userData) {
    try {
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      const user = await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
        include: {
          country: true,
        },
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          country: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          country: true,
        },
      });

      if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  static async updateById(id, updateData) {
    try {
      // If password is being updated, hash it
      if (updateData.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          country: true,
        },
      });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }

  static async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      const users = await prisma.user.findMany({
        where: filters,
        include: {
          country: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Remove passwords from all users
      return users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
    } catch (error) {
      throw error;
    }
  }

  static async deleteById(id) {
    try {
      return await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      throw error;
    }
  }

  static async toggleActiveStatus(id) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { isActive: !user.isActive },
        include: {
          country: true,
        },
      });

      const { password, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
