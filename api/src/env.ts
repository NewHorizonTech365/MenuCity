export type ProfileRole = "user" | "admin";

export type Bindings = {
  DATABASE_URL: string;
  CLERK_JWT_KEY: string;
  CLERK_AUTHORIZED_PARTIES?: string;
  ALLOWED_ORIGINS: string;
  MEDIA?: R2Bucket;
};

export type Variables = {
  requestId: string;
  authUserId: string;
  profileRole: ProfileRole;
};

export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};
