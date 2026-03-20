const requiredEnvVars = [
  'MONGODB_URI',
  'REDIS_URL',
  'ANTHROPIC_API_KEY',
  'RESEND_API_KEY',
  'EMAIL_FROM',
  'CLOUDINARY_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'REFRESH_TOKEN_SECRET',
  'REFRESH_TOKEN_EXPIRES_IN',
  'SEED_ADMIN_EMAIL',
  'SEED_ADMIN_PASSWORD'
];

function validateEnv() {
  const missing = [];

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