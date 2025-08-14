import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertAssetSchema, insertDestinationSchema, insertWorkflowSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    clients.add(ws);
    
    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  });

  // Broadcast to all connected clients
  function broadcast(message: any) {
    const data = JSON.stringify(message);
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Assets routes
  app.get("/api/assets", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 25;
      const offset = parseInt(req.query.offset as string) || 0;
      const assets = await storage.getAssets(limit, offset);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.get("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.getAsset(req.params.id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      
      broadcast({
        type: 'asset_created',
        data: asset
      });
      
      res.status(201).json(asset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create asset" });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const asset = await storage.updateAsset(req.params.id, req.body);
      
      broadcast({
        type: 'asset_updated',
        data: asset
      });
      
      res.json(asset);
    } catch (error) {
      res.status(500).json({ message: "Failed to update asset" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      await storage.deleteAsset(req.params.id);
      
      broadcast({
        type: 'asset_deleted',
        data: { id: req.params.id }
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Destinations routes
  app.get("/api/destinations", async (req, res) => {
    try {
      const destinations = await storage.getDestinations();
      res.json(destinations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch destinations" });
    }
  });

  app.post("/api/destinations", async (req, res) => {
    try {
      const validatedData = insertDestinationSchema.parse(req.body);
      const destination = await storage.createDestination(validatedData);
      res.status(201).json(destination);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid destination data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create destination" });
    }
  });

  // n8n webhook trigger
  app.post("/api/webhook/n8n", async (req, res) => {
    try {
      const { type, payload, assetId } = req.body;
      
      // Create workflow record
      const workflow = await storage.createWorkflow({
        assetId,
        workflowType: type,
        status: 'pending',
        payload,
        startedAt: new Date(),
      });

      // Broadcast workflow started
      broadcast({
        type: 'workflow_started',
        data: { assetId, workflowId: workflow.id, workflowType: type }
      });

      // Here you would trigger the actual n8n workflow
      // For now, we'll simulate the webhook call
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/content-pipeline';
      
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflowId: workflow.id,
            type,
            payload,
            callbackUrl: `${req.protocol}://${req.get('host')}/api/webhook/n8n/callback`
          })
        });

        if (response.ok) {
          const result = await response.json();
          await storage.updateWorkflow(workflow.id, {
            status: 'running',
            n8nExecutionId: result.executionId,
            resumeUrl: result.resumeUrl,
          });
        } else {
          await storage.updateWorkflow(workflow.id, {
            status: 'failed',
            error: 'Failed to trigger n8n workflow',
          });
        }
      } catch (n8nError) {
        await storage.updateWorkflow(workflow.id, {
          status: 'failed',
          error: 'n8n webhook unreachable',
        });
      }

      res.json({ workflowId: workflow.id, status: 'triggered' });
    } catch (error) {
      res.status(500).json({ message: "Failed to trigger workflow" });
    }
  });

  // n8n callback webhook
  app.post("/api/webhook/n8n/callback", async (req, res) => {
    try {
      const { workflowId, status, result, error, assetId } = req.body;
      
      await storage.updateWorkflow(workflowId, {
        status,
        result,
        error,
        completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined,
      });

      // Update asset status based on workflow result
      if (assetId) {
        let assetStatus = 'ready';
        if (status === 'completed') {
          assetStatus = result?.published ? 'published' : 'ready';
        } else if (status === 'failed') {
          assetStatus = 'failed';
        }
        
        await storage.updateAsset(assetId, { status: assetStatus });
      }

      // Broadcast workflow completion
      broadcast({
        type: 'workflow_completed',
        data: { workflowId, status, assetId }
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to process callback" });
    }
  });

  // Resume workflow endpoint
  app.post("/api/workflow/:workflowId/resume", async (req, res) => {
    try {
      const { workflowId } = req.params;
      const workflow = await storage.updateWorkflow(workflowId, {
        status: 'running',
      });

      const resumeData = req.body;

      // Send data to n8n resume URL
      if (workflow.resumeUrl) {
        try {
          await fetch(workflow.resumeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(resumeData)
          });
        } catch (error) {
          console.error('Failed to resume n8n workflow:', error);
        }
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to resume workflow" });
    }
  });

  return httpServer;
}
