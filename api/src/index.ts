import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "./env";
import { getRequestId, fail, ok } from "./lib/http";
import { requireAdmin, requireAuth } from "./middleware/auth";
import { adminRoutes } from "./routes/admin";
import { meRoutes } from "./routes/me";
import { publicRoutes } from "./routes/public";
import { uploadRoutes } from "./routes/uploads";

const app = new Hono<AppEnv>();

app.use("*", async (c, next) => {
  c.set("requestId", getRequestId(c.req.raw));
  const origin = c.req.header("Origin");
  const allowed = c.env.ALLOWED_ORIGINS.split(",").map((value) => value.trim());
  const originAllowed = !origin || allowed.includes(origin);

  if (c.req.method === "OPTIONS") {
    if (!originAllowed) return fail(c, 403, "origin_forbidden", "Origine non autorisée.");
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin ?? "*",
        "Access-Control-Allow-Headers": "Authorization, Content-Type, Content-Length",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (!originAllowed) return fail(c, 403, "origin_forbidden", "Origine non autorisée.");
  await next();
  c.header("X-Request-Id", c.get("requestId"));
  if (origin) c.header("Access-Control-Allow-Origin", origin);
});

app.get("/health", (c) => ok(c, { status: "ok", service: "menucity-api", time: new Date().toISOString() }));

app.get("/media/*", async (c) => {
  if (!c.env.MEDIA) {
    return fail(c, 503, "media_storage_unavailable", "Le stockage des médias n’est pas activé.");
  }
  const key = c.req.path.slice("/media/".length);
  if (!key || key.includes("..")) return fail(c, 404, "media_not_found", "Média introuvable.");
  const object = await c.env.MEDIA.get(key);
  if (!object?.body) return fail(c, 404, "media_not_found", "Média introuvable.");
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
});

app.route("/v1", publicRoutes);
app.use("/v1/me", requireAuth);
app.use("/v1/invitations", requireAuth);
app.use("/v1/invitations/*", requireAuth);
app.use("/v1/uploads/*", requireAuth);
app.use("/v1/admin/*", requireAuth, requireAdmin);
app.route("/v1", meRoutes);
app.route("/v1/uploads", uploadRoutes);
app.route("/v1/admin", adminRoutes);

app.notFound((c) => fail(c, 404, "route_not_found", "Route introuvable."));
app.onError((error, c) => {
  if (error instanceof HTTPException) return error.getResponse();
  console.error(JSON.stringify({ requestId: c.get("requestId"), message: error.message, stack: error.stack }));
  return fail(c, 500, "internal_error", "Une erreur interne est survenue.");
});

export default app;
