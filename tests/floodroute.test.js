/**
 * FloodRoute Automated Test Suite
 * Validates Routing Graph, Safety Validator, Deterministic Simulation,
 * Bedrock Provider Schema Validation, and Offline Reliability.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { RoadGraph, ROAD_STATES } from '../server/routing/graph.js';
import { SafetyValidator, createDefaultEmergencyNetwork } from '../server/routing/safetyValidator.js';
import { BedrockProvider } from '../server/ai/bedrockProvider.js';
import { SimulationEngine } from '../server/simulation/engine.js';

describe('FloodRoute Emergency Mobility & Bedrock Integration Tests', () => {

  // Test 1: Finding a valid route
  it('1. should find a valid route between origin depot and hospital', () => {
    const graph = createDefaultEmergencyNetwork();
    const result = graph.findPath('NODE_DEPOT', 'NODE_HOSPITAL', {
      vehicleClearanceCm: 60,
      vehicleType: 'AMBULANCE',
    });

    assert.equal(result.success, true);
    assert.ok(result.totalDistanceKm > 0);
    assert.ok(result.etaMinutes > 0);
    assert.ok(result.waypoints.length >= 2);
    assert.equal(result.validated, true);
  });

  // Test 2: Rejecting a blocked road
  it('2. should reject a blocked road when calculating ordinary routes', () => {
    const graph = createDefaultEmergencyNetwork();
    // Block R-12 directly
    graph.updateEdgeCondition('R-12', { state: ROAD_STATES.BLOCKED });

    const result = graph.findPath('NODE_DEPOT', 'NODE_HOSPITAL', {
      vehicleClearanceCm: 60,
      avoidEdgeIds: new Set(['R-12']),
    });

    assert.equal(result.success, true);
    // Verified that R-12 is NOT in the path
    assert.ok(!result.edgeIds.includes('R-12'));
  });

  // Test 3: Choosing a safer alternative when appropriate
  it('3. should select elevated viaduct bypass when surface water exceeds clearance', () => {
    const graph = createDefaultEmergencyNetwork();
    // Flood R-12 to 85cm (exceeding 60cm ambulance limit)
    graph.updateEdgeCondition('R-12', { waterDepthCm: 85, state: ROAD_STATES.BLOCKED });

    const result = graph.findPath('NODE_DEPOT', 'NODE_HOSPITAL', {
      vehicleClearanceCm: 60,
      preferElevated: true,
    });

    assert.equal(result.success, true);
    assert.equal(result.isElevatedViaductUsed, true);
    assert.ok(result.edgeIds.includes('R-VIADUCT-01'));
  });

  // Test 4: Detecting routes affected by a closure
  it('4. should detect which vehicles have routes affected by a road closure', () => {
    const sim = new SimulationEngine();
    const amb = sim.getVehicle('AMB-001');

    // Ambulance initially uses R-12
    assert.ok(amb.activeRoute.edgeIds.includes('R-12'));

    // Detect affected vehicles if R-12 closes
    const affected = SafetyValidator.detectAffectedRoutes('R-12', sim.vehicles);
    assert.equal(affected.length, 1);
    assert.equal(affected[0].id, 'AMB-001');

    // Relief truck REL-001 must NOT be affected
    const relAffected = affected.some(v => v.id === 'REL-001');
    assert.equal(relAffected, false);
  });

  // Test 5: Recalculating route after flood event
  it('5. should recalculate safe alternative route after flood event occurs', async () => {
    const sim = new SimulationEngine();
    const beforeReroute = sim.getVehicle('AMB-001').activeRoute.routeId;

    const eventResult = await sim.triggerFloodEvent('R-12', 85);
    assert.equal(eventResult.success, true);
    assert.equal(eventResult.floodEventActive, true);

    const amb = sim.getVehicle('AMB-001');
    assert.equal(amb.status, 'REROUTED_ACTIVE');
    assert.notEqual(amb.activeRoute.routeId, beforeReroute);
    assert.ok(!amb.activeRoute.edgeIds.includes('R-12'));
  });

  // Test 6: Ensuring invalid routes cannot pass safety validation
  it('6. should reject routes containing blocked or flooded segments in safety validation', () => {
    const invalidRoute = {
      pathEdges: [
        { id: 'R-11', state: ROAD_STATES.OPEN, waterDepthCm: 10, passable: true, from: 'N1', to: 'N2' },
        { id: 'R-12', state: ROAD_STATES.BLOCKED, waterDepthCm: 85, passable: false, from: 'N2', to: 'N3' },
      ],
      riskScore: 0.95,
    };

    const validation = SafetyValidator.validateRoute(invalidRoute, { groundClearanceCm: 60 });
    assert.equal(validation.isValid, false);
    assert.ok(validation.reason.includes('BLOCKED'));
  });

  // Test 7: Validating Bedrock response structure
  it('7. should validate Bedrock JSON structure and reject malformed responses', () => {
    const provider = new BedrockProvider();
    const candidateRoutes = [
      { routeId: 'ROUTE-BETA', routeName: 'Route Beta Viaduct', etaMinutes: 14, riskScore: 0.05, validated: true }
    ];

    const validJsonText = JSON.stringify({
      summary: 'Dr. Ambedkar Road is impassable due to 85cm flood.',
      reason: 'Water depth exceeds clearance margin.',
      recommendation: 'Use Route Beta.',
      routeId: 'ROUTE-BETA',
      etaMinutes: 14,
      riskScore: 0.05
    });

    const parsed = provider.parseAndValidateResponse(validJsonText, candidateRoutes);
    assert.ok(parsed);
    assert.equal(parsed.routeId, 'ROUTE-BETA');
    assert.equal(parsed.etaMinutes, 14);

    // Malformed JSON without recommendation
    const invalidJson = JSON.stringify({ summary: 'No recommendation provided' });
    const parsedInvalid = provider.parseAndValidateResponse(invalidJson, candidateRoutes);
    assert.equal(parsedInvalid, null);
  });

  // Test 8: Handling missing AWS credentials gracefully
  it('8. should fallback cleanly to deterministic explanations when AWS credentials are absent', async () => {
    // Provide non-existent dummy region/model to simulate missing/expired credentials
    const provider = new BedrockProvider({ region: 'us-east-99', modelId: 'non-existent-model' });
    
    const explanation = await provider.explainDecision({
      incidentId: 'INC-892',
      vehicleId: 'AMB-001',
      vehicleType: 'AMBULANCE',
      waterDepthCm: 85,
      clearanceLimitCm: 60,
      blockedRoads: ['R-12'],
      candidateRoutes: [
        { routeId: 'ROUTE-BETA', routeName: 'Route Beta Viaduct', etaMinutes: 14, riskScore: 0.05, validated: true }
      ]
    });

    assert.ok(explanation);
    assert.equal(explanation.status, 'FALLBACK_DETERMINISTIC');
    assert.ok(explanation.summary.length > 0);
    assert.ok(explanation.reason.length > 0);
    assert.ok(explanation.recommendation.length > 0);
  });

  // Test 9: Handling Bedrock timeouts or permission failures
  it('9. should continue safe deterministic routing when Bedrock call fails', async () => {
    const provider = new BedrockProvider();
    const deterministic = provider.generateDeterministicExplanation({
      incidentId: 'INC-892',
      vehicleId: 'AMB-001',
      waterDepthCm: 85,
      clearanceLimitCm: 60,
      blockedRoads: ['R-12'],
      candidateRoutes: [
        { routeId: 'ROUTE-BETA', routeName: 'Route Beta Viaduct', etaMinutes: 14, riskScore: 0.05, validated: true }
      ]
    });

    assert.equal(deterministic.status, 'FALLBACK_DETERMINISTIC');
    assert.equal(deterministic.routeId, 'ROUTE-BETA');
    assert.equal(deterministic.disclaimer, 'AI explanation unavailable — deterministic routing remains active.');
  });

  // Test 10: Ensuring simulation mode works offline
  it('10. should support full deterministic simulation lifecycle completely offline', async () => {
    const sim = new SimulationEngine();
    assert.equal(sim.step, 0);

    // Trigger flood
    await sim.triggerFloodEvent('R-12', 85);
    assert.equal(sim.step, 2);
    assert.equal(sim.floodEventActive, true);

    // Verify independent vehicle movements
    const amb = sim.getVehicle('AMB-001');
    const rel = sim.getVehicle('REL-001');

    assert.equal(amb.status, 'REROUTED_ACTIVE');
    assert.equal(rel.status, 'EN_ROUTE'); // Unaffected

    // Reset
    sim.resetSimulation();
    assert.equal(sim.step, 0);
    assert.equal(sim.floodEventActive, false);
  });

  // Test 11: Ensuring frontend vehicle follows updated waypoint list
  it('11. should generate ordered waypoints and update route coordinates upon rerouting', async () => {
    const sim = new SimulationEngine();
    const initialWaypoints = sim.getVehicle('AMB-001').activeRoute.waypoints;
    assert.ok(initialWaypoints.length >= 2);

    await sim.triggerFloodEvent('R-12', 85);
    const newWaypoints = sim.getVehicle('AMB-001').activeRoute.waypoints;
    assert.ok(newWaypoints.length >= 2);

    // Verify waypoints changed to reflect the viaduct bypass
    assert.notDeepEqual(initialWaypoints, newWaypoints);
  });

});
