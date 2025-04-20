/**
 * Application configuration
 * Loads environment variables and provides configuration values
 */

require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: (process.env.NODE_ENV || 'development') === 'production'
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  },
  
  // Security configuration
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'insecure-default-secret',
    bcryptSaltRounds: 10
  },
  
  // Restaurant domain configuration
  restaurants: {
    domains: {
      'awesome-burgers': 'awesome-burgers.your-domain.com',
      'pizza-palace': 'pizza-palace.your-domain.com',
      'sushi-heaven': 'sushi-heaven.your-domain.com'
    },
    defaultRestaurant: 'awesome-burgers'
  },
  
  // Paths
  paths: {
    static: __dirname,
    logs: __dirname + '/logs'
  },
  
  // Cache configuration
  cache: {
    staticMaxAge: '7d',
    htmlMaxAge: '0'
  },
  
  // Database configuration (for future use)
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '27017',
    name: process.env.DB_NAME || 'slotmachine',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    url: process.env.DB_URL
  }
};
