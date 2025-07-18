import type { Config } from 'drizzle-kit'

export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/etkinlik_rehberi',
  },
} satisfies Config
