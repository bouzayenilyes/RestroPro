const { CONFIG } = require("../config/index")
const jsonwebtoken = require("jsonwebtoken");

exports.generateAccessToken = (payload) => {
    const token = jsonwebtoken.sign(payload, CONFIG.JWT_SECRET, {
        expiresIn: CONFIG.JWT_EXPIRY,
        issuer: CONFIG.FRONTEND_DOMAIN_COOKIE
    });
    return token;
};

exports.generateRefreshToken = (payload) => {
    const token = jsonwebtoken.sign(payload, CONFIG.JWT_SECRET, {
        expiresIn: CONFIG.JWT_EXPIRY_REFRESH,
        issuer: CONFIG.FRONTEND_DOMAIN_COOKIE
    });
    return token;
};

exports.verifyToken = (token) => {
    const decodedToken = jsonwebtoken.verify(token, CONFIG.JWT_SECRET, {issuer: CONFIG.FRONTEND_DOMAIN_COOKIE});
    return decodedToken;
};