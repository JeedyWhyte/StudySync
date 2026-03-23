// This scans your .env file and ensures all required environment variables are set before the app starts.
const requiredEnvVars = [
  'NODE_ENV',
  'APP_URL',
  'MONGODB_URI',
  'REDIS_URL',
  'ANTHROPIC_API_KEY',
  'CHATBOT_MODEL',
  'PATH_GEN_MODEL',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'CLOUDINARY_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN',
  // 'SEED_ADMIN_EMAIL', not required since we only need it for seeding, and we want to ensure 
  // it's not accidentally left in production .env after seeding
  // 'SEED_ADMIN_PASSWORD'
];

function validateEnv() {
  const missing = [];

  // Check for each required environment variable and add it to the missing list if it's not set
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach((m) => console.error(`   - ${m}`));

    // In production/sprint build, we crash the process if vars are missing
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully.');
}

module.exports = validateEnv;