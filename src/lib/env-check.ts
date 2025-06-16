// Environment variable validation
export function validateEnvironment() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'CLERK_SECRET_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'OPENROUTER_API_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  console.log('All required environment variables are present');
  return true;
}

export function logEnvironmentInfo() {
  console.log('Environment check:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
  console.log('- CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing');
  console.log('- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'Missing');
  console.log('- OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Set' : 'Missing');
}
