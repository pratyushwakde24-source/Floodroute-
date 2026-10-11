/**
 * FloodRoute Simulation State Machine
 * Manages the deterministic emergency dispatch scenario:
 * - AMB-001 (Echo-7 Ambulance)
 * - REL-001 (Truck-12 Relief Supplies)
 * - Road R-12 Flood Event Trigger
 * - Multi-vehicle independent coordination
 */

import { ROAD_STATES } from '../routing/graph.js';
import { SafetyValidator, createDefaultEmergencyNetwork } from '../routing/safetyValidator.js';
import { bedrockProvider } from '../ai/bedrockProvider.js';

export class SimulationEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.graph = createDefaultEmergencyNetwork();
    this.step = 0;
    this.floodEventActive = false;
    this.lastUpdated = new Date().toISOString();
    this.listeners = new Set();

    // Vehicles
    this.vehicles = [
      {
        id: 'AMB-001',
        legacyId: 'VEH-07',
        callsign: 'Echo-7 (High-Water Heavy Rescue Ambulance)',
        type: 'AMBULANCE',
        priority: 'CRITICAL',
        groundClearanceCm: 60,
        originNodeId: 'NODE_DEPOT',
        destinationNodeId: 'NODE_HOSPITAL',
        destinationName: 'KEM Hospital Trauma Concourse',
        status: 'EN_ROUTE',
        speedKmh: 45,
        currentCoordIndex: 0,
        currentNodeId: 'NODE_DEPOT',
        activeRoute: null,
        alternativeRoute: null,
      },
      {
        id: 'REL-001',
        legacyId: 'VEH-12',
        callsign: 'Supply-12 (Relief Logistics Carrier)',
        type: 'RELIEF_TRUCK',
        priority: 'STANDARD',
        groundClearanceCm: 80,
        originNodeId: 'NODE_DEPOT',
        destinationNodeId: 'NODE_RELIEF_HUB',
        destinationName: 'Sector 4 Relief Shelter Hub',
        status: 'EN_ROUTE',
        speedKmh: 50,
        currentCoordIndex: 0,
        currentNodeId: 'NODE_DEPOT',
        activeRoute: null,
        alternativeRoute: null,
      },
    ];

    // Compute initial baseline routes
    const amb = this.getVehicle('AMB-001');
    amb.activeRoute = this.graph.findPath(amb.originNodeId, amb.destinationNodeId, {
      vehicleClearanceCm: amb.groundClearanceCm,
      vehicleType: amb.type,
      avoidEdgeIds: new Set(['R-VIADUCT-01', 'R-VIADUCT-02', 'R-VIADUCT-03']),
    });

    const rel = this.getVehicle('REL-001');
    rel.activeRoute = this.graph.findPath(rel.originNodeId, rel.destinationNodeId, {
      vehicleClearanceCm: rel.groundClearanceCm,
      vehicleType: rel.type,
    });

    this.latestExplanation = {
      status: 'INITIAL_NOMINAL',
      summary: 'All units proceeding along baseline corridors. Dr. Ambedkar Road arterial is clear with 12cm manageable surface runoff.',
      reason: 'Water levels remain well below 60cm operating threshold for AMB-001.',
      recommendation: 'Maintain direct arterial transit vector.',
      routeId: amb.activeRoute.routeId,
      routeName: amb.activeRoute.routeName,
      etaMinutes: amb.activeRoute.etaMinutes,
      riskScore: amb.activeRoute.riskScore,
    };
  }

  getVehicle(id) {
    return this.vehicles.find(v => v.id === id || v.legacyId === id);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.lastUpdated = new Date().toISOString();
    const payload = this.getStatus();
    this.listeners.forEach(fn => fn(payload));
  }

  getStatus() {
    return {
      step: this.step,
      floodEventActive: this.floodEventActive,
      lastUpdated: this.lastUpdated,
      roads: Array.from(this.graph.edges.values()),
      vehicles: this.vehicles,
      latestExplanation: this.latestExplanation,
    };
  }

  /**
   * Triggers flood breach on road R-12
   */
  async triggerFloodEvent(roadId = 'R-12', waterDepthCm = 85) {
    this.floodEventActive = true;
    this.step = 2; // Critical flood breach step

    // 1. Update road condition to BLOCKED
    const updatedEdge = this.graph.updateEdgeCondition(roadId, {
      state: ROAD_STATES.BLOCKED,
      waterDepthCm,
      riskScore: 0.99,
      statusNote: `CRITICAL INUNDATION BREACH: ${waterDepthCm}cm crest recorded. Exceeds emergency vehicle clearance limit.`,
    });

    // 2. Identify affected vehicles
    const affectedVehicles = SafetyValidator.detectAffectedRoutes(roadId, this.vehicles);

    // 3. For each affected vehicle, validate failure & compute safe alternative
    const amb = this.getVehicle('AMB-001');
    const validationBefore = SafetyValidator.validateRoute(amb.activeRoute, amb);

    // Calculate alternative bypass route (excluding R-12)
    const alternativeRoute = this.graph.findPath(amb.originNodeId, amb.destinationNodeId, {
      vehicleClearanceCm: amb.groundClearanceCm,
      vehicleType: amb.type,
      avoidEdgeIds: new Set([roadId]),
      preferElevated: true,
    });

    // Validate alternative route
    const validationAfter = SafetyValidator.validateRoute(alternativeRoute, amb);

    amb.alternativeRoute = alternativeRoute;
    amb.status = 'REROUTED_ACTIVE';
    amb.activeRoute = alternativeRoute; // Automatically adopt the validated bypass
    amb.currentLocation = 'Lalbaug Elevated Viaduct North Ramp (+14.5m MSL)';

    // 4. REL-001 continues independently on its unaffected route
    const rel = this.getVehicle('REL-001');
    rel.status = 'EN_ROUTE'; // Unaffected

    // 5. Request Bedrock Explanation (with fallback)
    const bedrockContext = {
      incidentId: 'INC-892',
      vehicleId: amb.id,
      vehicleType: amb.type,
      priority: amb.priority,
      destination: amb.destinationName,
      blockedRoads: [updatedEdge?.name || roadId],
      waterDepthCm,
      clearanceLimitCm: amb.groundClearanceCm,
      candidateRoutes: [
        {
          routeId: 'ROUTE-ALPHA-DIRECT',
          routeName: 'Route Alpha (Dr. Ambedkar Rd Arterial)',
          etaMinutes: 11,
          riskScore: 0.95,
          validated: false, // Invalid due to R-12 blockage
        },
        {
          routeId: alternativeRoute.routeId,
          routeName: alternativeRoute.routeName,
          etaMinutes: alternativeRoute.etaMinutes,
          riskScore: alternativeRoute.riskScore,
          validated: validationAfter.isValid,
        },
      ],
      selectedRoute: alternativeRoute,
    };

    const explanation = await bedrockProvider.explainDecision(bedrockContext);
    this.latestExplanation = explanation;

    this.notify();

    return {
      success: true,
      floodEventActive: true,
      roadUpdated: updatedEdge,
      affectedVehiclesCount: affectedVehicles.length,
      ambRerouted: true,
      relTruckUnaffected: true,
      explanation,
    };
  }

  /**
   * Reset simulation back to step 0
   */
  resetSimulation() {
    this.reset();
    this.notify();
    return {
      success: true,
      message: 'Simulation reset to baseline state.',
    };
  }
}

export const simulationEngine = new SimulationEngine();
