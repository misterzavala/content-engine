import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const destinations = pgTable("destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform").notNull(), // instagram, tiktok, linkedin, etc
  accountHandle: text("account_handle").notNull(),
  isActive: boolean("is_active").default(true),
  config: jsonb("config"), // platform-specific configuration
  createdAt: timestamp("created_at").defaultNow(),
});

export const assets = pgTable("assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serial: text("serial").notNull().unique(),
  type: text("type").notNull(), // reel, carousel, post
  status: text("status").notNull().default("draft"), // draft, ready, queued, processing, published, failed
  title: text("title"),
  caption: text("caption"),
  mediaUrl: text("media_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds for videos
  fileSize: integer("file_size"), // in bytes
  ownerId: varchar("owner_id").references(() => users.id),
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  metadata: jsonb("metadata"), // additional asset metadata
});

export const assetDestinations = pgTable("asset_destinations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id").references(() => assets.id),
  destinationId: varchar("destination_id").references(() => destinations.id),
  status: text("status").notNull().default("pending"), // pending, publishing, published, failed
  publishedUrl: text("published_url"),
  error: text("error"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflows = pgTable("workflows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assetId: varchar("asset_id").references(() => assets.id),
  workflowType: text("workflow_type").notNull(), // publish, schedule, process
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  n8nExecutionId: text("n8n_execution_id"),
  resumeUrl: text("resume_url"),
  payload: jsonb("payload"),
  result: jsonb("result"),
  error: text("error"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assets: many(assets),
}));

export const assetsRelations = relations(assets, ({ one, many }) => ({
  owner: one(users, {
    fields: [assets.ownerId],
    references: [users.id],
  }),
  destinations: many(assetDestinations),
  workflows: many(workflows),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  assets: many(assetDestinations),
}));

export const assetDestinationsRelations = relations(assetDestinations, ({ one }) => ({
  asset: one(assets, {
    fields: [assetDestinations.assetId],
    references: [assets.id],
  }),
  destination: one(destinations, {
    fields: [assetDestinations.destinationId],
    references: [destinations.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one }) => ({
  asset: one(assets, {
    fields: [workflows.assetId],
    references: [assets.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDestinationSchema = createInsertSchema(destinations).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  serial: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssetDestinationSchema = createInsertSchema(assetDestinations).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Destination = typeof destinations.$inferSelect;
export type InsertDestination = z.infer<typeof insertDestinationSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type AssetDestination = typeof assetDestinations.$inferSelect;
export type InsertAssetDestination = z.infer<typeof insertAssetDestinationSchema>;

export type Workflow = typeof workflows.$inferSelect;
export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;

// Extended types for API responses
export type AssetWithDestinations = Asset & {
  destinations: (AssetDestination & { destination: Destination })[];
  owner: User;
  workflows: Workflow[];
};
