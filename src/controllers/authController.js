const authService = require('../services/authService');
const { ValidationError } = require('../utils/AppError');
const { normalizeIp, fetchIpDetails } = require('../utils/ipCountry');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const result = await authService.login(email, password);
    return res.status(200).json({
      status: 'success',
      data: result
    });
  } catch (error) {
    return next(error);
  }
};

const signup = async (req, res, next) => {
  try {
    const { email, password, country } = req.body;
    if (!email || !password) {
      return next(new ValidationError('Email and password are required'));
    }

    const ip = normalizeIp(req.headers['x-forwarded-for'] || req.ip);
    let ipDetails = null;
    if (ip) {
      try {
        ipDetails = await fetchIpDetails(ip);
      } catch (error) {
        ipDetails = null;
      }
    }
    const detectedCountry =
      ipDetails && ipDetails.bogon
        ? null
        : ipDetails && ipDetails.country
          ? ipDetails.country
          : null;
    const finalCountry = country || detectedCountry || 'UNKNOWN';

    const result = await authService.signup(email, password, finalCountry);
    return res.status(201).json({
      status: 'success',
      data: {
        ...result,
        loginIp: ip
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  signup
};
