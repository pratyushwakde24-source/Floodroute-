/**
 * FloodRoute Dynamic Road Graph & Routing Engine
 * Implements deterministic graph-based pathfinding (Dijkstra) with multi-criteria safety evaluation.
 */

export const ROAD_STATES = {
  OPEN: 'OPEN',
  WARNING: 'WARNING',
  WATERLOGGED: 'WATERLOGGED',
  HIGH_RISK: 'HIGH_RISK',
  FLOODED: 'FLOODED',
  BLOCKED: 'BLOCKED',
};

export const DATA_PROVENANCE = {
  OBSERVED: 'OBSERVED',
  FORECAST: 'FORECAST',
  SIMULATED: 'SIMULATED',
  INFERRED: 'INFERRED',
  STALE: 'STALE',
};

export class RoadGraph {
  constructor() {
    this.nodes = new Map(); // id -> Node
    this.edges = new Map(); // id -> Edge
    this.adjacency = new Map(); // nodeId -> [{ targetNodeId, edge }]
  }

  addNode(node) {
    this.nodes.set(node.id, {
      id: node.id,
      name: node.name,
      coords: node.coords, // [lat, lng] or [x, y]
      elevationM: node.elevationM || 5.0,
      type: node.type || 'INTERSECTION',
    });
    if (!this.adjacency.has(node.id)) {
      this.adjacency.set(node.id, []);
    }
  }

  addEdge(edge) {
    const fullEdge = {
      id: edge.id,
      name: edge.name,
      from: edge.from,
      to: edge.to,
      lengthKm: edge.lengthKm,
      speedKmh: edge.speedKmh || 40,
      state: edge.state || ROAD_STATES.OPEN,
      waterDepthCm: edge.waterDepthCm ?? 0,
      riskScore: edge.riskScore ?? 0.05,
      isElevatedViaduct: !!edge.isElevatedViaduct,
      elevationM: edge.elevationM || 4.0,
      passable: edge.passable !== false && edge.state !== ROAD_STATES.BLOCKED && edge.state !== ROAD_STATES.FLOODED,
      compatibleVehicles: edge.compatibleVehicles || ['AMBULANCE', 'RELIEF_TRUCK', 'HEAVY_RESCUE', 'LIGHT_VEHICLE'],
      dataSource: edge.dataSource || DATA_PROVENANCE.SIMULATED,
      confidence: edge.confidence || 'HIGH',
      updatedAt: edge.updatedAt || new Date().toISOString(),
      pathCoords: edge.pathCoords || [],
      bidirectional: edge.bidirectional !== false,
    };

    this.edges.set(edge.id, fullEdge);

    if (!this.adjacency.has(edge.from)) this.adjacency.set(edge.from, []);
    this.adjacency.get(edge.from).push({ targetNodeId: edge.to, edge: fullEdge });

    if (fullEdge.bidirectional) {
      if (!this.adjacency.has(edge.to)) this.adjacency.set(edge.to, []);
      this.adjacency.get(edge.to).push({ targetNodeId: edge.from, edge: fullEdge });
    }
  }

  getEdge(id) {
    return this.edges.get(id);
  }

  updateEdgeCondition(id, updates) {
    const edge = this.edges.get(id);
    if (!edge) return null;

    Object.assign(edge, updates);
    if (updates.state === ROAD_STATES.BLOCKED || updates.state === ROAD_STATES.FLOODED) {
      edge.passable = false;
    } else if (updates.state === ROAD_STATES.OPEN) {
      edge.passable = true;
    }
    edge.updatedAt = new Date().toISOString();
    return edge;
  }

  /**
   * Dijkstra shortest-safe-path pathfinding
   */
  findPath(startNodeId, endNodeId, options = {}) {
    const {
      vehicleClearanceCm = 60,
      vehicleType = 'AMBULANCE',
      priority = 'CRITICAL',
      avoidEdgeIds = new Set(),
      preferElevated = true,
      maxAllowedRisk = 0.70,
    } = options;

    if (!this.nodes.has(startNodeId) || !this.nodes.has(endNodeId)) {
      return { success: false, reason: 'Invalid origin or destination node' };
    }

    const distances = new Map();
    const previous = new Map();
    const edgeUsed = new Map();
    const unvisited = new Set();

    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, Infinity);
      unvisited.add(nodeId);
    }
    distances.set(startNodeId, 0);

    while (unvisited.size > 0) {
      let currentId = null;
      let smallestDist = Infinity;
      for (const id of unvisited) {
        const d = distances.get(id);
        if (d < smallestDist) {
          smallestDist = d;
          currentId = id;
        }
      }

      if (currentId === null || smallestDist === Infinity) break;
      if (currentId === endNodeId) break;

      unvisited.delete(currentId);

      const neighbors = this.adjacency.get(currentId) || [];
      for (const { targetNodeId, edge } of neighbors) {
        if (!unvisited.has(targetNodeId)) continue;

        // Deterministic Safety Exclusion Checks:
        // 1. Explicitly blocked or in avoid list
        if (avoidEdgeIds.has(edge.id)) continue;
        if (edge.state === ROAD_STATES.BLOCKED || edge.state === ROAD_STATES.FLOODED) continue;
        if (!edge.passable) continue;

        // 2. Physical water depth exceeds vehicle chassis clearance
        if (edge.waterDepthCm > vehicleClearanceCm) continue;

        // 3. Vehicle compatibility check
        if (edge.compatibleVehicles && !edge.compatibleVehicles.includes(vehicleType)) continue;

        // Traversal Cost calculation
        const baseTimeMinutes = (edge.lengthKm / edge.speedKmh) * 60;
        let cost = baseTimeMinutes;

        // Safety penalty weighting
        if (edge.isElevatedViaduct && preferElevated) {
          cost *= 0.90; // Viaduct preference multiplier
        } else if (edge.state === ROAD_STATES.HIGH_RISK) {
          cost *= 2.50; // Heavy penalty for high-risk roads
        } else if (edge.state === ROAD_STATES.WATERLOGGED) {
          cost *= 1.40;
        }

        // Add risk factor into cost
        cost += edge.riskScore * 10;

        const candidateDist = distances.get(currentId) + cost;
        if (candidateDist < distances.get(targetNodeId)) {
          distances.set(targetNodeId, candidateDist);
          previous.set(targetNodeId, currentId);
          edgeUsed.set(targetNodeId, edge);
        }
      }
    }

    if (distances.get(endNodeId) === Infinity) {
      return {
        success: false,
        reason: 'No safe connected corridor available between origin and destination under current constraints',
      };
    }

    // Reconstruct path
    const pathNodes = [];
    const pathEdges = [];
    let curr = endNodeId;

    while (curr) {
      pathNodes.unshift(this.nodes.get(curr));
      const edge = edgeUsed.get(curr);
      if (edge) pathEdges.unshift(edge);
      curr = previous.get(curr);
    }

    const totalDistanceKm = +pathEdges.reduce((acc, e) => acc + e.lengthKm, 0).toFixed(2);
    const etaMinutes = +pathEdges.reduce((acc, e) => acc + (e.lengthKm / e.speedKmh) * 60, 0).toFixed(1);
    const maxWaterDepthCm = Math.max(0, ...pathEdges.map(e => e.waterDepthCm));
    const avgRiskScore = +(pathEdges.reduce((acc, e) => acc + e.riskScore, 0) / (pathEdges.length || 1)).toFixed(3);
    const isElevatedViaductUsed = pathEdges.some(e => e.isElevatedViaduct);

    // Collect all ordered coordinates
    const waypoints = [];
    pathNodes.forEach(n => waypoints.push(n.coords));

    return {
      success: true,
      routeId: isElevatedViaductUsed ? 'ROUTE-BETA-ELEVATED' : 'ROUTE-ALPHA-DIRECT',
      routeName: isElevatedViaductUsed ? 'Route Beta (Safe Viaduct Bypass)' : 'Route Alpha (Direct Arterial)',
      pathNodes,
      pathEdges,
      edgeIds: pathEdges.map(e => e.id),
      waypoints,
      totalDistanceKm,
      etaMinutes: Math.round(etaMinutes),
      maxWaterDepthCm,
      riskScore: avgRiskScore,
      isElevatedViaductUsed,
      validated: true,
    };
  }
}
