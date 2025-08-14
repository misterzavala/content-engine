import { 
  users, 
  assets, 
  destinations, 
  assetDestinations, 
  workflows,
  type User, 
  type InsertUser,
  type Asset,
  type InsertAsset,
  type AssetWithDestinations,
  type Destination,
  type InsertDestination,
  type AssetDestination,
  type InsertAssetDestination,
  type Workflow,
  type InsertWorkflow
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Assets
  getAssets(limit?: number, offset?: number): Promise<AssetWithDestinations[]>;
  getAsset(id: string): Promise<AssetWithDestinations | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<Asset>): Promise<Asset>;
  deleteAsset(id: string): Promise<void>;

  // Destinations
  getDestinations(): Promise<Destination[]>;
  createDestination(destination: InsertDestination): Promise<Destination>;
  updateDestination(id: string, destination: Partial<Destination>): Promise<Destination>;

  // Asset Destinations
  createAssetDestination(assetDestination: InsertAssetDestination): Promise<AssetDestination>;
  updateAssetDestination(id: string, status: string, publishedUrl?: string, error?: string): Promise<AssetDestination>;

  // Workflows
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow>;
  getWorkflowsByAsset(assetId: string): Promise<Workflow[]>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalAssets: number;
    inQueue: number;
    published: number;
    processing: number;
    failed: number;
    successRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAssets(limit = 25, offset = 0): Promise<AssetWithDestinations[]> {
    const result = await db
      .select({
        asset: assets,
        destination: destinations,
        assetDestination: assetDestinations,
        owner: users,
      })
      .from(assets)
      .leftJoin(users, eq(assets.ownerId, users.id))
      .leftJoin(assetDestinations, eq(assets.id, assetDestinations.assetId))
      .leftJoin(destinations, eq(assetDestinations.destinationId, destinations.id))
      .orderBy(desc(assets.updatedAt))
      .limit(limit)
      .offset(offset);

    // Group by asset
    const assetMap = new Map<string, AssetWithDestinations>();
    
    for (const row of result) {
      const assetId = row.asset.id;
      
      if (!assetMap.has(assetId)) {
        assetMap.set(assetId, {
          ...row.asset,
          destinations: [],
          owner: row.owner!,
          workflows: [],
        });
      }
      
      const asset = assetMap.get(assetId)!;
      
      if (row.assetDestination && row.destination) {
        asset.destinations.push({
          ...row.assetDestination,
          destination: row.destination,
        });
      }
    }

    // Get workflows for each asset
    const assetIds = Array.from(assetMap.keys());
    if (assetIds.length > 0) {
      const workflowResults = await db
        .select()
        .from(workflows)
        .where(sql`${workflows.assetId} = ANY(${assetIds})`);

      for (const workflow of workflowResults) {
        const asset = assetMap.get(workflow.assetId!);
        if (asset) {
          asset.workflows.push(workflow);
        }
      }
    }

    return Array.from(assetMap.values());
  }

  async getAsset(id: string): Promise<AssetWithDestinations | undefined> {
    const result = await db
      .select({
        asset: assets,
        destination: destinations,
        assetDestination: assetDestinations,
        owner: users,
      })
      .from(assets)
      .leftJoin(users, eq(assets.ownerId, users.id))
      .leftJoin(assetDestinations, eq(assets.id, assetDestinations.assetId))
      .leftJoin(destinations, eq(assetDestinations.destinationId, destinations.id))
      .where(eq(assets.id, id));

    if (result.length === 0) return undefined;

    const asset: AssetWithDestinations = {
      ...result[0].asset,
      destinations: [],
      owner: result[0].owner!,
      workflows: [],
    };

    for (const row of result) {
      if (row.assetDestination && row.destination) {
        asset.destinations.push({
          ...row.assetDestination,
          destination: row.destination,
        });
      }
    }

    // Get workflows
    const workflowResults = await db
      .select()
      .from(workflows)
      .where(eq(workflows.assetId, id));

    asset.workflows = workflowResults;

    return asset;
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    // Generate unique serial
    const serial = `${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    const [newAsset] = await db
      .insert(assets)
      .values({ ...asset, serial })
      .returning();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<Asset>): Promise<Asset> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ ...asset, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async deleteAsset(id: string): Promise<void> {
    await db.delete(assets).where(eq(assets.id, id));
  }

  async getDestinations(): Promise<Destination[]> {
    return await db.select().from(destinations).where(eq(destinations.isActive, true));
  }

  async createDestination(destination: InsertDestination): Promise<Destination> {
    const [newDestination] = await db
      .insert(destinations)
      .values(destination)
      .returning();
    return newDestination;
  }

  async updateDestination(id: string, destination: Partial<Destination>): Promise<Destination> {
    const [updatedDestination] = await db
      .update(destinations)
      .set(destination)
      .where(eq(destinations.id, id))
      .returning();
    return updatedDestination;
  }

  async createAssetDestination(assetDestination: InsertAssetDestination): Promise<AssetDestination> {
    const [newAssetDestination] = await db
      .insert(assetDestinations)
      .values(assetDestination)
      .returning();
    return newAssetDestination;
  }

  async updateAssetDestination(
    id: string, 
    status: string, 
    publishedUrl?: string, 
    error?: string
  ): Promise<AssetDestination> {
    const updateData: Partial<AssetDestination> = { status };
    if (publishedUrl) updateData.publishedUrl = publishedUrl;
    if (error) updateData.error = error;
    if (status === 'published') updateData.publishedAt = new Date();

    const [updatedAssetDestination] = await db
      .update(assetDestinations)
      .set(updateData)
      .where(eq(assetDestinations.id, id))
      .returning();
    return updatedAssetDestination;
  }

  async createWorkflow(workflow: InsertWorkflow): Promise<Workflow> {
    const [newWorkflow] = await db
      .insert(workflows)
      .values(workflow)
      .returning();
    return newWorkflow;
  }

  async updateWorkflow(id: string, workflow: Partial<Workflow>): Promise<Workflow> {
    const [updatedWorkflow] = await db
      .update(workflows)
      .set(workflow)
      .where(eq(workflows.id, id))
      .returning();
    return updatedWorkflow;
  }

  async getWorkflowsByAsset(assetId: string): Promise<Workflow[]> {
    return await db
      .select()
      .from(workflows)
      .where(eq(workflows.assetId, assetId))
      .orderBy(desc(workflows.createdAt));
  }

  async getDashboardStats() {
    const stats = await db
      .select({
        totalAssets: sql<number>`count(*)`,
        inQueue: sql<number>`count(*) filter (where status = 'queued')`,
        published: sql<number>`count(*) filter (where status = 'published')`,
        processing: sql<number>`count(*) filter (where status = 'processing')`,
        failed: sql<number>`count(*) filter (where status = 'failed')`,
      })
      .from(assets);

    const result = stats[0];
    const successRate = result.totalAssets > 0 
      ? Math.round((result.published / result.totalAssets) * 100)
      : 0;

    return {
      ...result,
      successRate,
    };
  }
}

export const storage = new DatabaseStorage();
