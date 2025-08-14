// Environment configuration validation
export const config = {
  youtube: {
    apiKey: process.env.YOUTUBE_API_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: {
    url: process.env.DATABASE_URL,
  },
} as const

// Validate required environment variables in production
export function validateConfig() {
  const requiredVars = [
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.warn('Missing environment variables:', missingVars.join(', '))
  }

  // Optional but recommended for full functionality
  const optionalVars = [
    'YOUTUBE_API_KEY',
    'OPENAI_API_KEY', 
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
  ]

  const missingOptional = optionalVars.filter(varName => !process.env[varName])
  
  if (missingOptional.length > 0) {
    console.info('Optional environment variables not set (some features will be disabled):', missingOptional.join(', '))
  }
}