CREATE TABLE "invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inviter_user_id" text NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"invitee_email" text NOT NULL,
	"invitee_name" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"proposed_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invitations_status_check" CHECK ("invitations"."status" in ('pending', 'accepted', 'declined', 'cancelled'))
);
--> statement-breakpoint
CREATE TABLE "menu_item_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text,
	"alt_text" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"price_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_price_check" CHECK ("menu_items"."price_amount" >= 0),
	CONSTRAINT "menu_items_currency_check" CHECK (char_length("menu_items"."currency") = 3)
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"avatar_url" text,
	"avatar_key" text,
	"cover_url" text,
	"cover_key" text,
	"role" text DEFAULT 'user' NOT NULL,
	"restaurants_visited" integer DEFAULT 0 NOT NULL,
	"points" integer DEFAULT 0 NOT NULL,
	"reviews_count" integer DEFAULT 0 NOT NULL,
	"preferred_cuisines" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"recent_visits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_role_check" CHECK ("profiles"."role" in ('user', 'admin')),
	CONSTRAINT "profiles_non_negative_check" CHECK ("profiles"."restaurants_visited" >= 0 and "profiles"."points" >= 0 and "profiles"."reviews_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "restaurant_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"restaurant_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text,
	"alt_text" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "restaurants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"cuisine" text NOT NULL,
	"address" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"main_image_url" text DEFAULT '' NOT NULL,
	"main_image_key" text,
	"logo_url" text DEFAULT '' NOT NULL,
	"logo_key" text,
	"average_rating" numeric(2, 1) DEFAULT '0' NOT NULL,
	"price_range" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"opening_hours" text DEFAULT '' NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"specialties" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_by" text,
	"updated_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "restaurants_status_check" CHECK ("restaurants"."status" in ('draft', 'published', 'archived')),
	CONSTRAINT "restaurants_rating_check" CHECK ("restaurants"."average_rating" >= 0 and "restaurants"."average_rating" <= 5)
);
--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_photos" ADD CONSTRAINT "menu_item_photos_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_photos" ADD CONSTRAINT "restaurant_photos_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "public"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invitations_inviter_idx" ON "invitations" USING btree ("inviter_user_id","created_at");--> statement-breakpoint
CREATE INDEX "menu_item_photos_item_idx" ON "menu_item_photos" USING btree ("menu_item_id","sort_order");--> statement-breakpoint
CREATE INDEX "menu_items_restaurant_idx" ON "menu_items" USING btree ("restaurant_id","sort_order");--> statement-breakpoint
CREATE INDEX "restaurant_photos_restaurant_idx" ON "restaurant_photos" USING btree ("restaurant_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "restaurants_slug_unique" ON "restaurants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "restaurants_status_idx" ON "restaurants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "restaurants_cuisine_idx" ON "restaurants" USING btree ("cuisine");