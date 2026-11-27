require('dotenv').config();

const REQUIRED_VARS = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'CLIENT_URL',
];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  const err = new Error(`Missing required env var(s): ${missing.join(', ')}`);
  console.error(err.message);
  process.exit(1);
}

const port = Number(process.env.PORT);
if (Number.isNaN(port) || port <= 0) {
  console.error(`Invalid PORT env var: ${process.env.PORT}`);
  process.exit(1);
}

const nodeEnv = process.env.NODE_ENV;

module.exports = Object.freeze({
  port,
  nodeEnv,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  clientUrl: process.env.CLIENT_URL,
  isDev: nodeEnv === 'development',
});
