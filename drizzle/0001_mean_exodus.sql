CREATE TABLE "material_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(200) NOT NULL,
	"amount_paid" integer NOT NULL,
	"payment_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"payment_reference" varchar(200),
	"items" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
