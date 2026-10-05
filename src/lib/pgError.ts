import { DrizzleQueryError } from "drizzle-orm";
import postgres from "postgres";

export function isPgError(error: unknown, code?: string): error is DrizzleQueryError {
  if (!(error instanceof DrizzleQueryError)) return false;
  const pgError = error.cause as postgres.PostgresError | undefined;
  return code ? pgError?.code === code : true;
}