/**
 * Configuration JWT pour l'authentification
 * JWT configuration for authentication
 *
 * @module config/jwt
 * @author Renault Group - Service 00596
 */

module.exports = {
  // Clé secrète pour signer les tokens / Secret key for signing tokens
  secret: process.env.JWT_SECRET || 'development_secret_key_change_in_production',

  // Durée de validité du token / Token validity duration
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',

  // Algorithme de signature / Signing algorithm
  algorithm: 'HS256',

  // Options de vérification / Verification options
  verifyOptions: {
    algorithms: ['HS256'],
    ignoreExpiration: false
  }
};
