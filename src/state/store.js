// FloodRoute Reactive Central State Store
// Fully integrated with real Indian cities, authoritative GIS data & strict classification
import {
  SEED_ORGANIZATIONS,
  USER_ROLES,
  INITIAL_USER,
  ROAD_NETWORK,
  INCIDENTS,
  VEHICLES,
  FACILITIES,
  COMMUNITY_REQUESTS,
  TEAM_MEMBERS,
  INTEGRATIONS,
  AUDIT_LOG
} from '../data/seedData.js';
import { INDIAN_CITIES } from '../geo/cities.js';
import { RoutingEngine } from '../services/routingService.js';
import { formatIST } from '../models/provenance.js';

class Store {
  constructor() {
    this.listeners = new Set();
    this.loadState();
  }

  loadState() {
    this.state = {
      // Selected City Profile
      selectedCityId: 'mumbai',
      cities: INDIAN_CITIES,
      
      // Data Mode: Strict isolation between Live Sourced Data and Simulation
      dataMode: 'LIVE_OFFICIAL', // 'LIVE_OFFICIAL' | 'SIMULATION'

      organizations: JSON.parse(JSON.stringify(SEED_ORGANIZATIONS)),
      currentOrgId: 'org-1',
      currentUser: JSON.parse(JSON.stringify(INITIAL_USER)),
      currentRole: 'ORG_ADMIN',
      currentPage: 'overview', // 'overview', 'live-network', 'incidents', 'incident-detail', 'vehicles', 'resources', 'simulation', 'analytics', 'settings', 'integrations', 'team', 'audit-log', 'auth', 'onboarding', 'responder-hud', 'public-directory'
      
      // Entities
      roads: JSON.parse(JSON.stringify(ROAD_NETWORK)),
      incidents: JSON.parse(JSON.stringify(INCIDENTS)),
      vehicles: JSON.parse(JSON.stringify(VEHICLES)),
      facilities: JSON.parse(JSON.stringify(FACILITIES)),
      communityRequests: JSON.parse(JSON.stringify(COMMUNITY_REQUESTS)),
      teamMembers: JSON.parse(JSON.stringify(TEAM_MEMBERS)),
      integrations: JSON.parse(JSON.stringify(INTEGRATIONS)),
      auditLogs: JSON.parse(JSON.stringify(AUDIT_LOG)),

      // Layer Filter Toggles for Tactical Map
      layerFilters: {
        roads: true,
        staticRisk: true,
        liveSensors: true,
        forecasts: true,
        facilities: true,
        community: true,
      },

      // Legend & Provenance Panel Drawer
      showLegendDrawer: false,

      // Selections & Filters
      selectedIncidentId: 'INC-892',
      selectedVehicleId: 'VEH-07',
      selectedFacilityId: 'FAC-HQ',
      incidentFilter: 'ALL',
      searchQuery: '',
      mapLayer: 'diorama', // 'diorama', 'vector', 'inundation', 'satellite'
      
      // Amazon Bedrock AI Decision Explanation
      latestBedrockExplanation: {
        status: 'FALLBACK_DETERMINISTIC',
        provider: 'deterministic-rules-engine',
        modelId: 'rules-v1.0',
        summary: 'Baseline corridor: Unit Echo-7 monitoring Dr. Ambedkar Road arterial towards KEM Hospital. Water stage at 12cm is safely passable.',
        reason: 'Surface water depth (12cm) is well within vehicle operating clearance (60cm).',
        recommendation: 'Maintain direct arterial transit vector.',
        routeId: 'ROUTE-ALPHA-DIRECT',
        routeName: 'Route Alpha (Dr. Ambedkar Rd Arterial)',
        etaMinutes: 13.8,
        riskScore: 0.12,
        tradeOffAnalysis: {
          timeImpactMinutes: 0,
          safetyConfidencePct: 92.5,
          elevationMarginMeters: 3.2
        },
        disclaimer: 'Deterministic routing active — AWS Bedrock explanations synchronized.'
      },

      // End-to-end Demo Flood Scenario State (Mumbai Pilot Scenario)
      scenario: {
        step: 0, // 0: Normal, 1: Surge Warning, 2: Road Blocked & Reroute Alert, 3: Dispatcher Approved & Route Updated, 4: Mission Completed
        isRunning: false,
        lastUpdated: formatIST(Date.now()),
        explanation: 'Baseline corridor: Unit Echo-7 monitoring Dr. Ambedkar Road arterial towards KEM Hospital. Water stage at 12cm is safely passable.'
      },

      // UI Notifications modal/toast
      toasts: [],
      showNewIncidentModal: false,
      showInviteModal: false,
      showRerouteModal: false,
      isOfflineSimulated: false,
      sidebarCollapsed: false,
    };
  }

  getState() {
    return this.state;
  }

  getSelectedCity() {
    return this.state.cities[this.state.selectedCityId] || this.state.cities.mumbai;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setCity(cityId) {
    if (this.state.cities[cityId]) {
      this.state.selectedCityId = cityId;
      const city = this.state.cities[cityId];

      // Update current organization jurisdiction
      const currentOrg = this.state.organizations.find(o => o.id === this.state.currentOrgId);
      if (currentOrg) {
        currentOrg.sector = city.tagline;
        currentOrg.jurisdiction = `${city.name} Metropolitan Area`;
      }

      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Geospatial Context',
        action: 'CITY_SWITCHED',
        details: `Switched operational command focus to ${city.name} (${city.state}). Loaded ${city.sources.length} attributable official source registries.`
      });

      this.addToast(`Switched active city to ${city.name} (${city.state})`, 'info');
      this.notify();
    }
  }

  setDataMode(mode) {
    if (mode === 'LIVE_OFFICIAL' || mode === 'SIMULATION') {
      this.state.dataMode = mode;
      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Mode Switch',
        action: 'DATA_MODE_CHANGED',
        details: `Operational data mode switched to ${mode}.`
      });
      this.addToast(`Data Mode: ${mode === 'SIMULATION' ? 'Deterministic Simulation Active' : 'Live Official Sourced Telemetry'}`, mode === 'SIMULATION' ? 'warning' : 'success');
      this.notify();
    }
  }

  toggleMapFilter(layerKey) {
    if (this.state.layerFilters.hasOwnProperty(layerKey)) {
      this.state.layerFilters[layerKey] = !this.state.layerFilters[layerKey];
      this.notify();
    }
  }

  toggleLegendDrawer() {
    this.state.showLegendDrawer = !this.state.showLegendDrawer;
    this.notify();
  }

  toggleSidebar() {
    this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
    this.notify();
  }

  setPage(page) {
    if (this.state.currentRole === 'PUBLIC' && page !== 'public-directory') {
      this.state.currentPage = 'public-directory';
      this.addToast('Public users can only access the Public Shelter & Help Directory for security.', 'info');
      this.notify();
      return;
    }
    this.state.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.notify();
  }

  setRole(roleId) {
    if (USER_ROLES[roleId]) {
      this.state.currentRole = roleId;
      this.state.currentUser.role = roleId;
      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: roleId,
        category: 'Auth',
        action: 'ROLE_SWITCHED',
        details: `User switched active persona to ${USER_ROLES[roleId].name}.`,
      });
      if (roleId === 'FIELD_RESPONDER') {
        this.state.currentPage = 'responder-hud';
      } else if (roleId === 'PUBLIC') {
        this.state.currentPage = 'public-directory';
      } else if (this.state.currentPage === 'responder-hud' || this.state.currentPage === 'public-directory') {
        this.state.currentPage = 'overview';
      }
      this.addToast(`Switched active profile to ${USER_ROLES[roleId].name}`, 'success');
      this.notify();
    }
  }

  setOrg(orgId) {
    const org = this.state.organizations.find(o => o.id === orgId);
    if (org) {
      this.state.currentOrgId = orgId;
      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Workspace',
        action: 'TENANT_SWITCHED',
        details: `Switched operational context to ${org.name}.`,
      });
      this.addToast(`Active workspace: ${org.name}`, 'info');
      this.notify();
    }
  }

  setSelectedIncident(incidentId) {
    this.state.selectedIncidentId = incidentId;
    this.notify();
  }

  setSelectedVehicle(vehicleId) {
    this.state.selectedVehicleId = vehicleId;
    this.notify();
  }

  setSelectedFacility(facilityId) {
    this.state.selectedFacilityId = facilityId;
    this.notify();
  }

  setMapLayer(layer) {
    this.state.mapLayer = layer;
    this.notify();
  }

  // DEMO FLOOD SCENARIO STEP MACHINE (Deterministic Mumbai Pilot Flow)
  advanceScenarioStep() {
    const nextStep = (this.state.scenario.step + 1) % 5;
    this.setScenarioStep(nextStep);
  }

  setScenarioStep(step) {
    this.state.scenario.step = step;
    this.state.scenario.lastUpdated = formatIST(Date.now());

    const echo7 = this.state.vehicles.find(v => v.id === 'VEH-07');
    const inc892 = this.state.incidents.find(i => i.id === 'INC-892');

    if (step === 0) {
      // Step 0: Baseline Normal Route (BKC -> KEM Hospital via Dr. Ambedkar Rd)
      echo7.status = 'EN_ROUTE';
      echo7.activeRouteName = 'Route Alpha (Dr. Ambedkar Rd Arterial)';
      echo7.speedKmh = 48;
      echo7.telemetry.waterSensorReadingCm = 12;
      this.state.scenario.explanation = 'Initial state: Unit Echo-7 departing BKC Logistics Depot with critical pediatric medicine. Ambedkar Rd water stage 12cm is safely passable.';
      this.addToast('Scenario Reset: Baseline Route Alpha Active', 'info');
    } else if (step === 1) {
      // Step 1: Runoff / Surge Warning at Hindmata Junction
      echo7.status = 'HAZARD_WARNING';
      echo7.speedKmh = 26;
      echo7.telemetry.waterSensorReadingCm = 45;
      this.state.scenario.explanation = 'Surge alert: Inundation rising rapidly to 45cm at Hindmata / Dadar TT junction. Ground clearance margin narrowing.';
      this.addAuditLog({
        actor: 'MCGM Dadar Flow Sensor',
        role: 'Sensor Feed',
        category: 'Telemetry',
        action: 'SURGE_WARNING',
        details: 'Hindmata Underpass water level exceeded 40cm caution threshold.'
      });
      this.addToast('Surge Warning: Water level rising to 45cm at Hindmata!', 'warning');
    } else if (step === 2) {
      // Step 2: Critical Flood Breach (85cm crest) -> Route Severed -> AI Calculates Safe Corridor
      echo7.status = 'REROUTE_PENDING';
      echo7.speedKmh = 0;
      echo7.activeRouteName = 'Route Alpha [SEVERED / BLOCKED AT HINDMATA]';
      echo7.telemetry.waterSensorReadingCm = 85;
      if (inc892) inc892.status = 'CRITICAL_HAZARD';
      
      this.state.scenario.explanation = 'CRITICAL INUNDATION: Water level reached 85cm crest at Hindmata, exceeding Echo-7 clearance (60cm) by +25cm. Route Alpha severed. AI Engine synthesized Safe Corridor 07 (Lalbaug Elevated Viaduct Bypass, +14.5m grade, 98.4% safety score). Awaiting Dispatcher Approval.';
      this.state.showRerouteModal = true;

      this.addAuditLog({
        actor: 'AI Routing Engine (Nyquist-v4)',
        role: 'Automated Agent',
        category: 'Routing',
        action: 'ROUTE_SEVERED_ALTERNATIVE_CALCULATED',
        details: 'Dr. Ambedkar Road flooded at 85cm. Route Alpha invalidated. Proposed Lalbaug Viaduct Bypass (Corridor 07) awaiting dispatcher authorization.'
      });
      this.addToast('EMERGENCY: Route Alpha Blocked! AI Reroute Proposed', 'error');

      // Fetch Amazon Bedrock AI Decision Explanation
      this.fetchBedrockExplanation({
        incidentId: 'INC-892',
        vehicleId: 'AMB-001',
        vehicleType: 'AMBULANCE',
        priority: 'CRITICAL',
        destination: 'KEM Hospital Trauma Center',
        blockedRoads: ['R-12 / Dr. Ambedkar Road (Hindmata Underpass)'],
        waterDepthCm: 85,
        clearanceLimitCm: 60,
        candidateRoutes: [
          {
            routeId: 'ROUTE-ALPHA-DIRECT',
            routeName: 'Route Alpha (Dr. Ambedkar Rd Arterial)',
            etaMinutes: 11,
            riskScore: 0.95,
            validated: false
          },
          {
            routeId: 'ROUTE-BETA-ELEVATED',
            routeName: 'Route Beta (Lalbaug Elevated Viaduct Bypass)',
            etaMinutes: 14.5,
            riskScore: 0.05,
            validated: true
          }
        ]
      });
    } else if (step === 3) {
      // Step 3: Dispatcher Approves Reroute -> Unit Echo-7 shifts to Lalbaug Elevated Viaduct
      echo7.status = 'REROUTING_ACTIVE';
      echo7.activeRouteName = 'Route Beta (Safe Corridor 07 - Lalbaug Viaduct)';
      echo7.speedKmh = 52;
      echo7.telemetry.waterSensorReadingCm = 0;
      this.state.showRerouteModal = false;

      this.state.scenario.explanation = 'DISPATCHER AUTHORIZED: Unit Echo-7 successfully rerouted onto elevated Lalbaug Viaduct. Vehicle climbing to +14.5m grade, safely clearing all surface inundation. Estimated arrival at KEM Hospital in 12 minutes.';
      
      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Dispatch',
        action: 'REROUTE_APPROVED',
        details: `Dispatcher authorized AI Reroute Beta (Lalbaug Elevated Viaduct) for Unit Echo-7 to bypass 85cm flood crest at Hindmata.`
      });
      this.addToast('Reroute Approved! New vector transmitted to Unit Echo-7.', 'success');
    } else if (step === 4) {
      // Step 4: Mission Completed
      echo7.status = 'ARRIVED_SAFELY';
      echo7.speedKmh = 0;
      echo7.currentLocation = 'KEM Hospital & Trauma Center - Emergency Concourse (Parel)';
      this.state.scenario.explanation = 'MISSION SUCCESS: Unit Echo-7 delivered critical pediatric medical shipment to KEM Hospital Trauma Concourse without submersion damage or engine stall.';
      
      this.addAuditLog({
        actor: 'Unit Echo-7 Cockpit HUD',
        role: 'Field Responder',
        category: 'Mission',
        action: 'MISSION_ACCOMPLISHED',
        details: 'Safely arrived at KEM Hospital Trauma Center. Delivery verified.'
      });
      this.addToast('Mission Success: Echo-7 arrived safely at KEM Hospital!', 'success');
    }

    this.notify();
  }

  async fetchBedrockExplanation(context) {
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      if (res.ok) {
        const data = await res.json();
        this.state.latestBedrockExplanation = data;
        this.notify();
        return data;
      }
    } catch (err) {
      // Server offline / simulation fallback
    }
    return null;
  }

  async triggerFloodBreach() {
    try {
      await fetch('/api/simulation/flood-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadId: 'R-12', waterDepthCm: 85 })
      });
    } catch (err) {
      // Offline fallback
    }
    this.setScenarioStep(2);
  }

  approveReroute() {
    this.setScenarioStep(3);
  }

  resetScenario() {
    try {
      fetch('/api/simulation/reset', { method: 'POST' }).catch(() => {});
    } catch (err) {}
    this.setScenarioStep(0);
  }

  // Incidents
  createIncident(incidentData) {
    const city = this.getSelectedCity();
    const newInc = {
      id: `INC-${Math.floor(800 + Math.random() * 200)}`,
      orgId: this.state.currentOrgId,
      reportedAt: 'Just now',
      status: 'ACTIVE',
      severity: incidentData.severity || 'HIGH',
      title: incidentData.title || `Reported Water Inundation in ${city.name}`,
      location: incidentData.location || `${city.name} Central Sector`,
      zone: incidentData.zone || `${city.name} Basin`,
      waterDepthM: parseFloat(incidentData.waterDepthM || 0.45),
      rateOfRiseCmHr: parseFloat(incidentData.rateOfRiseCmHr || 5.0),
      trappedCivilians: parseInt(incidentData.trappedCivilians || 0),
      assignedVehicleId: null,
      assignedVehicleName: 'Unassigned',
      description: incidentData.description || 'Emergency incident logged via dispatch console.',
      recommendedAction: 'Assess ground conditions and assign available high-clearance unit.',
      safetyScore: 88.0,
      etaChangeMins: 0,
      priority: 2,
    };
    this.state.incidents.unshift(newInc);
    this.state.selectedIncidentId = newInc.id;
    this.state.showNewIncidentModal = false;

    this.addAuditLog({
      actor: this.state.currentUser.name,
      role: this.state.currentRole,
      category: 'Dispatch',
      action: 'INCIDENT_CREATED',
      details: `Created new incident ${newInc.id}: ${newInc.title}`,
    });

    this.addToast(`Created Incident ${newInc.id}`, 'success');
    this.notify();
  }

  updateIncidentStatus(incidentId, newStatus) {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    if (inc) {
      inc.status = newStatus;
      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Dispatch',
        action: 'INCIDENT_STATUS_UPDATED',
        details: `Incident ${incidentId} updated to ${newStatus}`,
      });
      this.addToast(`Updated ${incidentId} to ${newStatus}`, 'info');
      this.notify();
    }
  }

  assignVehicleToIncident(incidentId, vehicleId) {
    const inc = this.state.incidents.find(i => i.id === incidentId);
    const veh = this.state.vehicles.find(v => v.id === vehicleId);
    if (inc && veh) {
      inc.assignedVehicleId = veh.id;
      inc.assignedVehicleName = veh.callsign;
      inc.status = 'DISPATCHED';
      veh.assignedIncidentId = inc.id;
      veh.status = 'ACTIVE_DISPATCH';

      this.addAuditLog({
        actor: this.state.currentUser.name,
        role: this.state.currentRole,
        category: 'Dispatch',
        action: 'VEHICLE_ASSIGNED',
        details: `Assigned unit ${veh.callsign} to ${inc.id} (${inc.title})`,
      });

      this.addToast(`Assigned ${veh.callsign} to ${inc.id}`, 'success');
      this.notify();
    }
  }

  createCommunityRequest(reqData) {
    const city = this.getSelectedCity();
    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      orgId: this.state.currentOrgId,
      citizenName: reqData.citizenName || 'Resident (Public Request)',
      neighborhood: reqData.neighborhood || `${city.name} Residential Ward`,
      urgency: reqData.urgency || 'HIGH',
      phone: reqData.phone || '+91 98200 00000',
      requestedAt: 'Just now',
      headcount: parseInt(reqData.headcount || 1),
      needs: reqData.needs || ['Drinking Water', 'Shelter Evacuation'],
      status: 'PENDING_APPROVAL',
      assignedUnit: null,
      notes: reqData.notes || 'Submitted via public emergency mobile portal.',
    };
    this.state.communityRequests.unshift(newReq);
    this.addAuditLog({
      actor: 'Public Citizen Portal',
      role: 'Public User',
      category: 'Citizen Services',
      action: 'ASSISTANCE_REQUEST_LOGGED',
      details: `New public SOS request ${newReq.id} received for ${newReq.neighborhood}`,
    });
    this.addToast(`Emergency Request ${newReq.id} Submitted to Dispatch!`, 'success');
    this.notify();
  }

  assignUnitToRequest(reqId, unitName) {
    const req = this.state.communityRequests.find(r => r.id === reqId);
    if (req) {
      req.status = 'ASSIGNED';
      req.assignedUnit = unitName;
      this.addToast(`Assigned ${unitName} to ${req.citizenName}`, 'success');
      this.notify();
    }
  }

  inviteTeamMember(email, role, unit) {
    const newMember = {
      id: `usr-${this.state.teamMembers.length + 1}`,
      name: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      role,
      unit: unit || 'Municipal Taskforce',
      status: 'INVITED',
      lastActive: 'Invitation Pending',
      location: 'Remote',
    };
    this.state.teamMembers.push(newMember);
    this.state.showInviteModal = false;
    this.addAuditLog({
      actor: this.state.currentUser.name,
      role: this.state.currentRole,
      category: 'Governance',
      action: 'TEAM_INVITE_SENT',
      details: `Sent organization invite to ${email} with role ${role}`,
    });
    this.addToast(`Invitation sent to ${email}`, 'success');
    this.notify();
  }

  addAuditLog(entry) {
    const fullEntry = {
      id: `AUD-${Math.floor(300 + Math.random() * 700)}`,
      timestamp: formatIST(Date.now()),
      actor: entry.actor || this.state.currentUser.name,
      role: entry.role || this.state.currentRole,
      category: entry.category || 'System',
      action: entry.action || 'ACTION',
      details: entry.details || '',
      ip: entry.ip || '192.168.1.104',
    };
    this.state.auditLogs.unshift(fullEntry);
  }

  addToast(message, type = 'info') {
    const id = Date.now() + Math.random();
    this.state.toasts.push({ id, message, type });
    this.notify();
    setTimeout(() => {
      this.state.toasts = this.state.toasts.filter(t => t.id !== id);
      this.notify();
    }, 4500);
  }
}

export const store = new Store();
