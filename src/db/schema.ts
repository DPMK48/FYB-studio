import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  fullName: varchar("full_name", { length: 200 }).notNull(),
  nickname: varchar("nickname", { length: 120 }),
  email: varchar("email", { length: 200 }).notNull(),
  matricNumber: varchar("matric_number", { length: 60 }),
  department: varchar("department", { length: 200 })
    .default("Faculty of Computing, ATBU, Bauchi State.")
    .notNull(),
  photoUrl: text("photo_url"), // base64 data URL
  favoriteQuote: text("favorite_quote"),
  hobbies: text("hobbies"),
  skillset: text("skillset"),
  toughestSemester: varchar("toughest_semester", { length: 120 }),
  mostDifficultCourse: varchar("most_difficult_course", { length: 120 }),
  favoriteCourse: varchar("favorite_course", { length: 120 }),
  messageToFamily: text("message_to_family"),
  socialIg: varchar("social_ig", { length: 200 }),
  socialFb: varchar("social_fb", { length: 200 }),
  dateOfBirth: varchar("date_of_birth", { length: 60 }),
  stateOfOrigin: varchar("state_of_origin", { length: 120 }),
  relationshipStatus: varchar("relationship_status", { length: 200 }),
  paymentStatus: varchar("payment_status", { length: 30 })
    .default("pending")
    .notNull(), // pending | paid
  paymentReference: varchar("payment_reference", { length: 200 }),
  amountPaid: integer("amount_paid").default(0).notNull(),
  downloadedByAdmin: boolean("downloaded_by_admin").default(false).notNull(),
  sharedWithStudent: boolean("shared_with_student").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  date: varchar("date", { length: 120 }),
  location: varchar("location", { length: 200 }),
  status: varchar("status", { length: 30 }).default("upcoming").notNull(), // upcoming | ongoing | completed
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type Student = typeof students.$inferSelect;
export type NewStudent = typeof students.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
