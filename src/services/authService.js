const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AppError, UnauthorizedError } = require('../utils/AppError');
const env = require('../config/env');
const userRepository = require('../repositories/userRepository');

const login = async (email, password) => {
  try {
    const user = await userRepository.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        country: user.country
      }
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Login failed', 500);
  }
};

const signup = async (email, password, country) => {
  try {
    const existingUser = await userRepository.getUserByEmail(email);
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedCountry = String(country).trim().toUpperCase();

    const user = await userRepository.createUser({
      email,
      password: hashedPassword,
      country: normalizedCountry,
      wallet: {
        create: {
          balance: 0
        }
      }
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        country: user.country
      }
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError('Signup failed', 500);
  }
};

module.exports = {
  login,
  signup
};
