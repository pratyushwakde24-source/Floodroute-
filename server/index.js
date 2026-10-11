/**
 * FloodRoute Backend API Server
 * Express Server exposing REST & SSE endpoints for Emergency Routing, Safety Validation,
 * Deterministic Simulation, and Amazon Bedrock AI Decision Explanations.
 */

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { simulationEngine } from './simulation/engine.js';
import { bedrockProvider } from './ai/bedrockProvider.js';
import { SafetyValidator } from './routing/safetyValidator.js';

const app = express();

app.use(cors());
app.use(express.json());

// SSE Clients Registry
const sseClients = new Set();

simulationEngine.subscribe(data => {
  const message = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
});

/**
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FloodRoute Emergency Mobility Engine',
    version: '1.0.0',
    awsRegion: config.awsRegion,
    bedrockModelId: config.bedrockModelId,
    simulationMode: config.simulationMode,
    aiProvider: config.aiProvider,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/flood/status
 */
app.get('/api/flood/status', (req, res) => {
  const status = simulationEngine.getStatus();
  res.json({
    floodEventActive: status.floodEventActive,
    step: status.step,
    lastUpdated: status.lastUpdated,
    activeIncidentsCount: status.floodEventActive ? 1 : 0,
    latestExplanation: status.latestExplanation,
  });
});

/**
 * GET /api/roads
 */
app.get('/api/roads', (req, res) => {
  const roads = Array.from(simulationEngine.graph.edges.values());
  res.json({
    count: roads.length,
    roads,
  });
});

/**
 * GET /api/vehicles
 */
app.get('/api/vehicles', (req, res) => {
  res.json({
    count: simulationEngine.vehicles.length,
    vehicles: simulationEngine.vehicles,
  });
});

/**
 * GET /api/incidents
 */
app.get('/api/incidents', (req, res) => {
  const status = simulationEngine.getStatus();
  const incidents = [
    {
      id: 'INC-892',
      title: 'Dr. Ambedkar Road / Hindmata Lowland Trench Inundation',
      severity: status.floodEventActive ? 'CRITICAL' : 'ELEVATED',
      status: status.floodEventActive ? 'ACTIVE_BREACH' : 'MONITORING',
      location: 'Hindmata Underpass & Parel Concourse',
      waterDepthM: status.floodEventActive ? 0.85 : 0.12,
      rateOfRiseCmHr: status.floodEventActive ? 8.5 : 2.0,
      assignedVehicleId: 'AMB-001',
      assignedVehicleName: 'Echo-7 (High-Water Heavy Rescue)',
      trappedCivilians: status.floodEventActive ? 14 : 0,
      timestamp: status.lastUpdated,
    },
  ];
  res.json({
    count: incidents.length,
    incidents,
  });
});

/**
 * POST /api/routes/calculate
 */
app.post('/api/routes/calculate', (req, res) => {
  try {
    const {
      origin = 'NODE_DEPOT',
      destination = 'NODE_HOSPITAL',
      vehicleClearanceCm = 60,
      vehicleType = 'AMBULANCE',
      avoidEdgeIds = [],
      preferElevated = true,
    } = req.body;

    const route = simulationEngine.graph.findPath(origin, destination, {
      vehicleClearanceCm: Number(vehicleClearanceCm),
      vehicleType,
      avoidEdgeIds: new Set(avoidEdgeIds),
      preferElevated,
    });

    if (!route.success) {
      return res.status(422).json(route);
    }

    const validation = SafetyValidator.validateRoute(route, {
      groundClearanceCm: vehicleClearanceCm,
      type: vehicleType,
    });

    res.json({
      ...route,
      validation,
    });
  } catch (err) {
    res.status(500).json({ error: 'Route calculation failed', details: err.message });
  }
});

/**
 * POST /api/routes/reroute
 */
app.post('/api/routes/reroute', (req, res) => {
  try {
    const { vehicleId = 'AMB-001', blockedRoadId = 'R-12' } = req.body;
    const vehicle = simulationEngine.getVehicle(vehicleId);

    if (!vehicle) {
      return res.status(404).json({ error: `Vehicle ${vehicleId} not found` });
    }

    const reroutes = SafetyValidator.rerouteAffectedVehicles(blockedRoadId, [vehicle], simulationEngine.graph);
    res.json(reroutes);
  } catch (err) {
    res.status(500).json({ error: 'Rerouting failed', details: err.message });
  }
});

/**
 * POST /api/simulation/flood-event
 * Triggers simulated flood breach on road R-12, recalculates routes, and calls Bedrock
 */
app.post('/api/simulation/flood-event', async (req, res) => {
  try {
    const { roadId = 'R-12', waterDepthCm = 85 } = req.body;
    const result = await simulationEngine.triggerFloodEvent(roadId, Number(waterDepthCm));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Simulation trigger failed', details: err.message });
  }
});

/**
 * POST /api/simulation/reset
 */
app.post('/api/simulation/reset', (req, res) => {
  const result = simulationEngine.resetSimulation();
  res.json(result);
});

/**
 * POST /api/ai/explain
 * Direct AI explanation endpoint using Bedrock with fallback
 */
app.post('/api/ai/explain', async (req, res) => {
  try {
    const context = req.body;
    const explanation = await bedrockProvider.explainDecision(context);
    res.json(explanation);
  } catch (err) {
    const fallback = bedrockProvider.generateDeterministicExplanation(req.body);
    res.json(fallback);
  }
});

/**
 * GET /api/simulation/stream
 * Server-Sent Events (SSE) for real-time synchronization with frontend / 3D Scene
 */
app.get('/api/simulation/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // Send initial state
  res.write(`data: ${JSON.stringify(simulationEngine.getStatus())}\n\n`);

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = config.port;
  app.listen(PORT, config.host, () => {
    console.log(`[FloodRoute Backend] Running on http://${config.host}:${PORT}`);
    console.log(`[FloodRoute Backend] AWS Region: ${config.awsRegion} | Bedrock Model: ${config.bedrockModelId}`);
  });
}

export default app;
