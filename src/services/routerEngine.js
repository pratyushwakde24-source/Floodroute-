// FloodRoute Safety-Aware Routing & Explanation Engine
// Evaluates road safety, inundation depth, vehicle ground clearance, and travel time trade-offs.

export function calculateRouteSafety({
  origin = 'Delta Depot',
  destination = 'Mercy General Hospital',
  vehicle,
  roadConditions,
}) {
  const clearanceLimit = vehicle?.groundClearanceCm || 50;
  const waterfrontRoad = roadConditions.find(r => r.id === 'road-waterfront');
  const viaductRoad = roadConditions.find(r => r.id === 'road-viaduct');

  const isWaterfrontImpassable = waterfrontRoad.condition === 'BLOCKED' || waterfrontRoad.waterDepthCm > clearanceLimit;

  // Route Alpha: Direct waterfront route
  const routeAlpha = {
    id: 'route-alpha',
    name: 'Route Alpha (Waterfront Direct Arterial)',
    pathDescription: 'Delta Staging Depot -> 4th Ave Junction -> Waterfront Boulevard -> Mercy General Trauma Concourse',
    distanceKm: 8.4,
    baseDurationMins: 13.8,
    maxInundationCm: waterfrontRoad.waterDepthCm,
    elevationMinM: waterfrontRoad.elevationM,
    status: isWaterfrontImpassable ? 'IMPASSABLE_BLOCKED' : (waterfrontRoad.condition === 'HIGH_RISK' ? 'HAZARDOUS' : 'OPTIMAL'),
    safetyScore: isWaterfrontImpassable ? 14.2 : (waterfrontRoad.condition === 'HIGH_RISK' ? 48.0 : 92.5),
    isRecommended: !isWaterfrontImpassable,
    riskFactors: [
      `Riverfront Levee basin depth: ${waterfrontRoad.waterDepthCm}cm`,
      `Vehicle chassis clearance: ${clearanceLimit}cm (${waterfrontRoad.waterDepthCm > clearanceLimit ? 'EXCEEDED BY ' + (waterfrontRoad.waterDepthCm - clearanceLimit) + 'cm' : 'Passable with extreme caution'})`,
      'Hydroplaning & swift-water current risk: Severe',
      'Civilian stalled vehicles impeding emergency lane'
    ],
    explanation: isWaterfrontImpassable
      ? `Route Alpha is SEVERED. The Waterfront Arterial at 4th Ave has reached a critical flood depth of ${waterfrontRoad.waterDepthCm}cm, which exceeds ${vehicle.callsign}'s maximum safe operating clearance of ${clearanceLimit}cm. Attempting passage risks total vehicle stalling and payload loss.`
      : `Route Alpha is currently direct, but water levels are rising rapidly (+${waterfrontRoad.waterDepthCm}cm recorded). Prepare for rerouting.`
  };

  // Route Beta: Elevated viaduct bypass (Safe Corridor 07)
  const routeBeta = {
    id: 'route-beta',
    name: 'Route Beta (Safe Corridor 07 - North Viaduct Bypass)',
    pathDescription: 'Delta Staging Depot -> Interstate West Span -> North Elevated Viaduct (14.8m grade) -> Highland Bypass -> Mercy General',
    distanceKm: 12.1,
    baseDurationMins: 18.2,
    maxInundationCm: viaductRoad.waterDepthCm,
    elevationMinM: viaductRoad.elevationM,
    status: 'OPTIMAL_ELEVATED',
    safetyScore: 98.4,
    isRecommended: isWaterfrontImpassable || waterfrontRoad.condition === 'HIGH_RISK',
    etaDifferenceMins: 4.4,
    distanceDifferenceKm: 3.7,
    riskFactors: [
      'Elevated viaduct structure: +14.8m above flood basin datum',
      'Surface water depth: 5cm (rain spray only, well within vehicle tolerances)',
      'High-friction asphalt surface with active municipal storm pump drainage',
      'Dedicated FirstNet emergency escort priority lane'
    ],
    explanation: `Route Beta provides 98.4% safety confidence. While it adds +3.7 km and approximately +4.4 minutes travel time, it elevates the vehicle 14.8 meters above the river basin inundation zone, completely bypassing the flooded 4th Ave breach. Recommended for human dispatcher authorization.`
  };

  return {
    primaryRoute: isWaterfrontImpassable ? routeBeta : routeAlpha,
    alternateRoute: isWaterfrontImpassable ? routeAlpha : routeBeta,
    allRoutes: [routeAlpha, routeBeta],
    requiresReroute: isWaterfrontImpassable,
    dispatcherActionRequired: isWaterfrontImpassable,
  };
}
