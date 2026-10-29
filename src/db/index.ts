import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { relations } from "./relations"

// max & prepare disesuaikan untuk serverless + Neon pooled (PgBouncer transaction mode).
// `prepare: false` wajib karena Neon pooler tidak mendukung prepared statement.
const client = postgres(process.env.DATABASE_URL!, {
  max: 1,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle({ client, relations });
