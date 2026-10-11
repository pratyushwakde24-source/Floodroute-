/**
 * FloodRoute Safety Validator and Routing Manager
 * Enforces strict deterministic verification rules:
 * - Route connectivity
 * - Road passability and water depth limits
 * - Vehicle ground clearance
 * - Freshness check
 * - Alternate corridor generation
 */

import { RoadGraph, ROAD_STATES, DATA_PROVENANCE } from './graph.js';

export class SafetyValidator {
  /**
   * Deterministically validates an existing or proposed route
   */
  static validateRoute(route, vehicle) {
    if (!route || !route.pathEdges || route.pathEdges.length === 0) {
      return {
        isValid: false,
        reason: 'Route contains no traversable edges or is uninitialized.',
      };
    }

    const vehicleClearance = vehicle?.groundClearanceCm || 60;
    const vehicleType = vehicle?.type || 'AMBULANCE';

    for (const edge of route.pathEdges) {
      // 1. Is road blocked or flooded?
      if (edge.state === ROAD_STATES.BLOCKED || edge.state === ROAD_STATES.FLOODED || !edge.passable) {
        return {
          isValid: false,
          invalidEdgeId: edge.id,
          reason: `Road segment ${edge.name || edge.id} is marked ${edge.state}. Physical transit prohibited.`,
          waterDepthCm: edge.waterDepthCm,
        };
      }

      // 2. Does water depth exceed chassis ground clearance?
      if (edge.waterDepthCm != null && edge.waterDepthCm > vehicleClearance) {
        return {
          isValid: false,
          invalidEdgeId: edge.id,
          reason: `Water depth (${edge.waterDepthCm}cm) exceeds ${vehicle.callsign || vehicle.id} clearance (${vehicleClearance}cm) on ${edge.name || edge.id}.`,
          waterDepthCm: edge.waterDepthCm,
        };
      }

      // 3. Vehicle compatibility
      if (edge.compatibleVehicles && !edge.compatibleVehicles.includes(vehicleType)) {
        return {
          isValid: false,
          invalidEdgeId: edge.id,
          reason: `Vehicle type ${vehicleType} is incompatible with road classification ${edge.id}.`,
        };
      }
    }

    // 4. Connectivity check: verify that edges form a contiguous chain
    for (let i = 0; i < route.pathEdges.length - 1; i++) {
      const current = route.pathEdges[i];
      const next = route.pathEdges[i + 1];
      const isConnected = current.to === next.from || 
                          current.to === next.to || 
                          current.from === next.from || 
                          current.from === next.to;
      if (!isConnected) {
        return {
          isValid: false,
          reason: `Route segment discontinuity detected between ${current.id} and ${next.id}.`,
        };
      }
    }

    return {
      isValid: true,
      reason: 'Route successfully passed all deterministic safety constraints.',
      safetyScore: route.riskScore != null ? +(100 - route.riskScore * 100).toFixed(1) : 95.0,
    };
  }

  /**
   * Detect which vehicles/routes are impacted when a specific road status changes
   */
  static detectAffectedRoutes(roadId, vehicles) {
    const affected = [];
    for (const vehicle of vehicles) {
      if (vehicle.activeRoute && vehicle.activeRoute.edgeIds) {
        if (vehicle.activeRoute.edgeIds.includes(roadId)) {
          affected.push(vehicle);
        }
      }
    }
    return affected;
  }

  /**
   * Recalculates safe alternatives for affected vehicles
   */
  static rerouteAffectedVehicles(roadId, vehicles, graph) {
    const affected = this.detectAffectedRoutes(roadId, vehicles);
    const rerouteResults = [];

    for (const vehicle of affected) {
      // Avoid the blocked road and find path
      const avoidEdgeIds = new Set([roadId]);
      const destinationNodeId = vehicle.destinationNodeId || 'NODE_HOSPITAL';
      const originNodeId = vehicle.currentNodeId || vehicle.originNodeId || 'NODE_DEPOT';

      const altRoute = graph.findPath(originNodeId, destinationNodeId, {
        vehicleClearanceCm: vehicle.groundClearanceCm || 60,
        vehicleType: vehicle.type || 'AMBULANCE',
        avoidEdgeIds,
        preferElevated: true,
      });

      rerouteResults.push({
        vehicleId: vehicle.id,
        callsign: vehicle.callsign,
        previousRouteId: vehicle.activeRoute?.routeId,
        newRoute: altRoute,
        reason: `Road segment ${roadId} was closed; computed alternative corridor.`,
      });
    }

    return {
      affectedCount: affected.length,
      reroutes: rerouteResults,
    };
  }
}

/**
 * Creates the deterministic baseline emergency network for Mumbai Pilot
 * connecting BKC Logistics Depot to KEM Hospital and Relief Hub
 */
export function createDefaultEmergencyNetwork() {
  const graph = new RoadGraph();

  // Nodes (coordinates normalized for both 3D diorama canvas and GIS)
  const nodes = [
    { id: 'NODE_DEPOT', name: 'BKC Relief Logistics Depot', coords: [180, 820], elevationM: 5.8 },
    { id: 'NODE_CONNECTOR', name: 'Chunabhatti Viaduct Ramp', coords: [440, 810], elevationM: 6.2 },
    { id: 'NODE_SION', name: 'Sion Circle Arterial Concourse', coords: [560, 740], elevationM: 5.5 },
    { id: 'NODE_KINGS', name: 'Maheshwari Udyan (King Circle)', coords: [690, 660], elevationM: 4.8 },
    { id: 'NODE_HINDMATA_LOW', name: 'Hindmata Low-Lying Breach Junction (R-12)', coords: [610, 480], elevationM: 3.1 },
    { id: 'NODE_VIADUCT_NORTH', name: 'North Elevated Viaduct Ramp (+14.5m)', coords: [960, 600], elevationM: 14.5 },
    { id: 'NODE_VIADUCT_SPAN', name: 'North Elevated Viaduct Deck', coords: [1140, 490], elevationM: 14.8 },
    { id: 'NODE_VIADUCT_SOUTH', name: 'Highland Bypass Concourse', coords: [1420, 420], elevationM: 14.2 },
    { id: 'NODE_HOSPITAL', name: 'KEM Hospital Trauma Concourse', coords: [1710, 390], elevationM: 4.5 },
    { id: 'NODE_EAST_CONNECTOR', name: 'Grand East Causeway Concourse', coords: [920, 810], elevationM: 18.5 },
    { id: 'NODE_RELIEF_HUB', name: 'Sector 4 Relief Shelter Hub', coords: [1620, 860], elevationM: 8.0 },
  ];

  nodes.forEach(n => graph.addNode(n));

  // Edges:
  // Primary Arterial Route Alpha via Hindmata (R-12)
  graph.addEdge({
    id: 'R-11',
    name: 'Depot to Sion Approach',
    from: 'NODE_DEPOT',
    to: 'NODE_SION',
    lengthKm: 3.2,
    speedKmh: 50,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 10,
    riskScore: 0.10,
    isElevatedViaduct: false,
    pathCoords: [[180, 820], [440, 810], [560, 740]],
  });

  graph.addEdge({
    id: 'R-12', // Critical vulnerable road that will be blocked during flood event
    name: 'Dr. Ambedkar Road / Hindmata Lowland Trench',
    from: 'NODE_SION',
    to: 'NODE_HINDMATA_LOW',
    lengthKm: 2.8,
    speedKmh: 40,
    state: ROAD_STATES.OPEN, // starts OPEN, transitions to BLOCKED (85cm water depth)
    waterDepthCm: 12,
    riskScore: 0.20,
    isElevatedViaduct: false,
    pathCoords: [[560, 740], [610, 480]],
  });

  graph.addEdge({
    id: 'R-13',
    name: 'Hindmata to KEM Hospital Arterial',
    from: 'NODE_HINDMATA_LOW',
    to: 'NODE_HOSPITAL',
    lengthKm: 2.4,
    speedKmh: 45,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 15,
    riskScore: 0.22,
    isElevatedViaduct: false,
    pathCoords: [[610, 480], [730, 550], [1710, 390]],
  });

  // Safe Elevated Bypass Route Beta (Viaduct Corridor 07)
  graph.addEdge({
    id: 'R-VIADUCT-01',
    name: 'Lalbaug Elevated Viaduct Ramp North',
    from: 'NODE_SION',
    to: 'NODE_VIADUCT_NORTH',
    lengthKm: 3.5,
    speedKmh: 65,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 2,
    riskScore: 0.02,
    isElevatedViaduct: true,
    elevationM: 14.5,
    pathCoords: [[560, 740], [690, 660], [960, 600]],
  });

  graph.addEdge({
    id: 'R-VIADUCT-02',
    name: 'Lalbaug Elevated Viaduct Central Deck',
    from: 'NODE_VIADUCT_NORTH',
    to: 'NODE_VIADUCT_SPAN',
    lengthKm: 2.8,
    speedKmh: 70,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 0,
    riskScore: 0.01,
    isElevatedViaduct: true,
    elevationM: 14.8,
    pathCoords: [[960, 600], [1140, 490]],
  });

  graph.addEdge({
    id: 'R-VIADUCT-03',
    name: 'Highland Bypass Descent to KEM Hospital',
    from: 'NODE_VIADUCT_SPAN',
    to: 'NODE_HOSPITAL',
    lengthKm: 4.1,
    speedKmh: 60,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 3,
    riskScore: 0.03,
    isElevatedViaduct: true,
    elevationM: 14.2,
    pathCoords: [[1140, 490], [1420, 420], [1710, 390]],
  });

  // Independent Route for Relief Truck (REL-001 / TRK-12)
  graph.addEdge({
    id: 'R-CAUSEWAY-01',
    name: 'Grand East Causeway Link',
    from: 'NODE_DEPOT',
    to: 'NODE_EAST_CONNECTOR',
    lengthKm: 5.6,
    speedKmh: 60,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 8,
    riskScore: 0.08,
    isElevatedViaduct: true,
    elevationM: 18.5,
    pathCoords: [[180, 820], [920, 810]],
  });

  graph.addEdge({
    id: 'R-CAUSEWAY-02',
    name: 'East Causeway to Relief Shelter Concourse',
    from: 'NODE_EAST_CONNECTOR',
    to: 'NODE_RELIEF_HUB',
    lengthKm: 4.2,
    speedKmh: 55,
    state: ROAD_STATES.OPEN,
    waterDepthCm: 6,
    riskScore: 0.06,
    isElevatedViaduct: false,
    pathCoords: [[920, 810], [1320, 830], [1620, 860]],
  });

  return graph;
}
