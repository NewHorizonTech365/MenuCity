DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'menucity_runtime') THEN
    CREATE ROLE menucity_runtime NOLOGIN;
  END IF;
END
$$;
--> statement-breakpoint
GRANT CONNECT ON DATABASE neondb TO menucity_runtime;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO menucity_runtime;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO menucity_runtime;
--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO menucity_runtime;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO menucity_runtime;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO menucity_runtime;
