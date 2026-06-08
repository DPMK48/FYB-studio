CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"date" varchar(120),
	"location" varchar(200),
	"status" varchar(30) DEFAULT 'upcoming' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" varchar(200) NOT NULL,
	"nickname" varchar(120),
	"email" varchar(200) NOT NULL,
	"matric_number" varchar(60),
	"department" varchar(200) DEFAULT 'Faculty of Computing, ATBU, Bauchi State.' NOT NULL,
	"photo_url" text,
	"favorite_quote" text,
	"hobbies" text,
	"skillset" text,
	"toughest_semester" varchar(120),
	"most_difficult_course" varchar(120),
	"favorite_course" varchar(120),
	"message_to_family" text,
	"social_ig" varchar(200),
	"social_fb" varchar(200),
	"date_of_birth" varchar(60),
	"state_of_origin" varchar(120),
	"relationship_status" varchar(200),
	"payment_status" varchar(30) DEFAULT 'pending' NOT NULL,
	"payment_reference" varchar(200),
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"downloaded_by_admin" boolean DEFAULT false NOT NULL,
	"shared_with_student" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
