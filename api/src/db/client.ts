import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export const createDatabase = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

export type Database = ReturnType<typeof createDatabase>;
