// FloodRoute Main Application Bootstrap & Controller
import './style.css';
import { store } from './state/store.js';
import { renderHeader, renderSidebar } from './components/Header.js';
import { renderScenarioBanner } from './components/ScenarioBanner.js';
import { renderRerouteModal } from './components/RerouteModal.js';
import { renderModals } from './components/Modals.js';
import { renderSourceLegendDrawer } from './components/SourceLegendDrawer.js';
import { TacticalMap } from './components/TacticalMap.js';
import { City3DScene } from './components/City3DScene.js';
import { providerRegistry } from './services/providers/providerRegistry.js';

// Views
import { renderOverviewView } from './views/OverviewView.js';
import { renderLiveNetworkView } from './views/LiveNetworkView.js';
import { renderIncidentsView } from './views/IncidentsView.js';
import { renderIncidentDetailView } from './views/IncidentDetailView.js';
import { renderVehiclesView } from './views/VehiclesView.js';
import { renderResourcesView } from './views/ResourcesView.js';
import { renderSimulationView } from './views/SimulationView.js';
import { renderAnalyticsView } from './views/AnalyticsView.js';
import { renderSettingsView } from './views/SettingsView.js';
import { renderIntegrationsView } from './views/IntegrationsView.js';
import { renderTeamView } from './views/TeamView.js';
import { renderAuditLogView } from './views/AuditLogView.js';
import { renderAuthView } from './views/AuthView.js';
import { renderOnboardingView } from './views/OnboardingView.js';
import { renderResponderHudView } from './views/ResponderHudView.js';
import { renderPublicHelpView } from './views/PublicHelpView.js';

let activeMap = null;
let active3DScene = null;

function renderApp() {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const state = store.getState();
  const page = state.currentPage;

  let pageContent = '';
  switch (page) {
    case 'overview':
    case 'command-center':
      pageContent = renderOverviewView();
      break;
    case 'live-network':
      pageContent = renderLiveNetworkView();
      break;
    case 'incidents':
      pageContent = renderIncidentsView();
      break;
    case 'incident-detail':
      pageContent = renderIncidentDetailView();
      break;
    case 'vehicles':
    case 'fleet':
      pageContent = renderVehiclesView();
      break;
    case 'resources':
    case 'relief-resources':
      pageContent = renderResourcesView();
      break;
    case 'simulation':
      pageContent = renderSimulationView();
      break;
    case 'analytics':
      pageContent = renderAnalyticsView();
      break;
    case 'settings':
      pageContent = renderSettingsView();
      break;
    case 'integrations':
      pageContent = renderIntegrationsView();
      break;
    case 'team':
      pageContent = renderTeamView();
      break;
    case 'audit-log':
      pageContent = renderAuditLogView();
      break;
    case 'auth':
      pageContent = renderAuthView();
      break;
    case 'onboarding':
      pageContent = renderOnboardingView();
      break;
    case 'responder-hud':
      pageContent = renderResponderHudView();
      break;
    case 'public-directory':
      pageContent = renderPublicHelpView();
      break;
    default:
      pageContent = renderOverviewView();
  }

  appContainer.innerHTML = `
    <div class="h-screen w-screen flex flex-col bg-app-bg text-slate-800 font-sans overflow-hidden">
      <!-- Top Application Bar -->
      ${renderHeader()}

      <!-- Main Shell with Sidebar & Content -->
      <div class="flex-1 flex overflow-hidden min-h-0">
        <!-- Collapsible Left Navigation Sidebar -->
        ${renderSidebar()}

        <!-- Main Content Area -->
        <main class="flex-1 flex flex-col overflow-y-auto min-w-0 bg-app-bg relative">
          <!-- Walkthrough / Mode Notification Banner -->
          ${renderScenarioBanner()}

          <!-- Active View Body -->
          <div class="flex-1 flex flex-col min-w-0">
            ${pageContent}
          </div>
        </main>
      </div>

      <!-- Slide-over Provenance & Legend Drawer -->
      ${renderSourceLegendDrawer()}

      <!-- Modals and Alert Overlays -->
      ${renderRerouteModal()}
      ${renderModals()}
    </div>
  `;

  // Mount Tactical Leaflet GIS Map after DOM update if on map-enabled pages
  requestAnimationFrame(() => {
    mountMapIfNeeded(page, state);
  });
}

function mountMapIfNeeded(page, state) {
  const currentCity = store.getSelectedCity();
  const simState = {
    isSimMode: state.dataMode === 'SIMULATION',
    step: state.scenario.step,
    floodEventActive: state.scenario.step >= 2,
  };

  if (page === 'overview' || page === 'command-center') {
    const canvas = document.getElementById('overviewMapCanvas');
    if (canvas) {
      if (!activeMap || activeMap.containerId !== 'overviewMapCanvas') {
        if (activeMap) activeMap.destroy();
        activeMap = new TacticalMap('overviewMapCanvas');
      }
      activeMap.setCity(currentCity, simState);
      applyLayerFilters(activeMap, state.layerFilters);
    }
  } else if (page === 'live-network') {
    // 1. Mount 3D Digital City Diorama
    const canvas3D = document.getElementById('liveNetwork3DCanvas');
    if (canvas3D && state.mapLayer === 'diorama') {
      if (!active3DScene || active3DScene.containerId !== 'liveNetwork3DCanvas') {
        if (active3DScene) active3DScene.destroy();
        active3DScene = new City3DScene('liveNetwork3DCanvas');
      }
      active3DScene.updateFromSimulation(simState);
    }

    // 2. Mount 2D Tactical Leaflet GIS Map if vector layer selected
    const canvas2D = document.getElementById('liveNetworkMapCanvas');
    if (canvas2D && state.mapLayer === 'vector') {
      if (!activeMap || activeMap.containerId !== 'liveNetworkMapCanvas') {
        if (activeMap) activeMap.destroy();
        activeMap = new TacticalMap('liveNetworkMapCanvas');
      }
      activeMap.setCity(currentCity, simState);
      applyLayerFilters(activeMap, state.layerFilters);
    }
  } else {
    if (activeMap) {
      activeMap.destroy();
      activeMap = null;
    }
    if (active3DScene) {
      active3DScene.destroy();
      active3DScene = null;
    }
  }
}

function applyLayerFilters(mapInstance, filters) {
  if (!mapInstance) return;
  mapInstance.toggleLayer('roads', filters.roads);
  mapInstance.toggleLayer('staticRisk', filters.staticRisk);
  mapInstance.toggleLayer('liveSensors', filters.liveSensors);
  mapInstance.toggleLayer('forecasts', filters.forecasts);
  mapInstance.toggleLayer('facilities', filters.facilities);
  mapInstance.toggleLayer('community', filters.community);
}

// Global Application Controller attached to window
window.app = {
  navigate: (page) => store.setPage(page),
  switchRole: (role) => store.setRole(role),
  switchOrg: (orgId) => store.setOrg(orgId),
  
  // City & Data Mode Switching
  switchCity: (cityId) => {
    store.setCity(cityId);
  },
  setDataMode: (mode) => {
    store.setDataMode(mode);
  },
  setMapLayer: (layer) => {
    store.setMapLayer(layer);
  },
  toggleMapFilter: (layerKey) => {
    store.toggleMapFilter(layerKey);
  },
  toggleLegendDrawer: () => {
    store.toggleLegendDrawer();
  },
  toggleSidebar: () => {
    store.toggleSidebar();
  },

  // Tactical Map Controls
  zoomMap: (delta) => {
    if (activeMap) {
      activeMap.zoom(delta);
    }
  },
  recenterMap: () => {
    if (activeMap) {
      activeMap.recenter();
      store.addToast(`Recentered on ${store.getSelectedCity().name}`, 'info');
    }
  },

  // Scenario & Real-Time Simulation
  advanceScenario: () => store.advanceScenarioStep(),
  setScenarioStep: (step) => store.setScenarioStep(step),
  resetScenario: () => store.resetScenario(),
  triggerFloodBreach: () => store.triggerFloodBreach(),
  resetSimulationScenario: () => store.resetScenario(),
  openRerouteModal: () => {
    store.state.showRerouteModal = true;
    store.notify();
  },
  closeRerouteModal: () => {
    store.state.showRerouteModal = false;
    store.notify();
  },
  approveReroute: () => store.approveReroute(),

  // Entity Inspections & Views
  viewIncident: (id) => {
    store.setSelectedIncident(id);
    store.setPage('incident-detail');
  },
  inspectIncident: (id) => {
    store.setSelectedIncident(id);
    store.setPage('incident-detail');
  },
  inspectVehicle: (id) => {
    store.setSelectedVehicle(id);
    store.setPage('live-network');
  },
  inspectFacility: (id) => {
    store.setSelectedFacility(id);
    store.setPage('resources');
  },

  // Incidents
  setIncidentFilter: (f) => {
    store.state.incidentFilter = f;
    store.notify();
  },
  setSearch: (q) => {
    store.state.searchQuery = q;
    store.notify();
  },
  openNewIncidentModal: () => {
    store.state.showNewIncidentModal = true;
    store.notify();
  },
  closeNewIncidentModal: () => {
    store.state.showNewIncidentModal = false;
    store.notify();
  },
  handleCreateIncident: (e) => {
    e.preventDefault();
    const title = document.getElementById('incTitle')?.value;
    const severity = document.getElementById('incSeverity')?.value;
    const zone = document.getElementById('incZone')?.value;
    const waterDepthM = document.getElementById('incDepth')?.value;
    const trappedCivilians = document.getElementById('incTrapped')?.value;
    const location = document.getElementById('incLocation')?.value;
    const description = document.getElementById('incDesc')?.value;

    store.createIncident({
      title,
      severity,
      zone,
      waterDepthM,
      trappedCivilians,
      location,
      description,
    });
  },
  updateIncidentStatus: (id, st) => store.updateIncidentStatus(id, st),
  assignVehicle: (incId, vehId) => {
    if (vehId) store.assignVehicleToIncident(incId, vehId);
  },

  // Team
  openInviteModal: () => {
    store.state.showInviteModal = true;
    store.notify();
  },
  closeInviteModal: () => {
    store.state.showInviteModal = false;
    store.notify();
  },
  handleInviteMember: (e) => {
    e.preventDefault();
    const email = document.getElementById('inviteEmail')?.value;
    const role = document.getElementById('inviteRole')?.value;
    const unit = document.getElementById('inviteUnit')?.value;
    store.inviteTeamMember(email, role, unit);
  },

  // Auth Quick Login
  quickLogin: (role) => {
    store.setRole(role);
    if (role === 'FIELD_RESPONDER') {
      store.setPage('responder-hud');
    } else if (role === 'PUBLIC') {
      store.setPage('public-directory');
    } else {
      store.setPage('overview');
    }
    store.addToast(`Signed in as ${role}`, 'success');
  },

  // Emergency Broadcast
  triggerBroadcastAlert: () => {
    store.addAuditLog({
      actor: store.getState().currentUser.name,
      role: store.getState().currentRole,
      category: 'Dispatch',
      action: 'EMERGENCY_BROADCAST_TRANSMITTED',
      details: `Flash Flood Evacuation Warning transmitted to all active sector devices in ${store.getSelectedCity().name}.`,
    });
    store.addToast(`Emergency Broadcast Sent across ${store.getSelectedCity().name} Grid!`, 'error');
  },

  // Organization Provisioning
  handleCreateOrg: (e) => {
    e.preventDefault();
    const name = document.getElementById('newOrgName')?.value;
    const sector = document.getElementById('newOrgSector')?.value;
    const newOrg = {
      id: `org-${store.getState().organizations.length + 1}`,
      name,
      sector,
      jurisdiction: 'Newly Provisioned GIS Basin',
      status: 'ACTIVE_EMERGENCY',
      threatLevel: 'ELEVATED',
      evacuationCount: 0,
      activeUnits: 2,
      passablePct: 85.0,
    };
    store.getState().organizations.push(newOrg);
    store.setOrg(newOrg.id);
    store.setPage('overview');
    store.addToast(`Workspace ${name} created and active!`, 'success');
  },

  // Public SOS
  handlePublicSos: (e) => {
    e.preventDefault();
    const citizenName = document.getElementById('citizenName')?.value;
    const phone = document.getElementById('citizenPhone')?.value;
    const headcount = document.getElementById('citizenHeadcount')?.value;
    const neighborhood = document.getElementById('citizenAddress')?.value;
    const need = document.getElementById('citizenNeed')?.value;

    store.createCommunityRequest({
      citizenName,
      phone,
      headcount,
      neighborhood,
      needs: [need],
      urgency: need.includes('Oxygen') || need.includes('Trapped') ? 'CRITICAL' : 'HIGH',
    });
    const form = document.getElementById('publicSosForm');
    if (form) form.reset();
  },

  assignRequest: (reqId, unit) => store.assignUnitToRequest(reqId, unit),

  responderAction: (act) => {
    store.addAuditLog({
      actor: 'Capt. James Rodriguez (Echo-7)',
      role: 'FIELD_RESPONDER',
      category: 'Field Telemetry',
      action: act,
      details: `Field responder action transmitted from in-vehicle terminal: ${act}`,
    });
    store.addToast(`Transmitted to Command Center: ${act}`, 'info');
  },

  exportReport: (fmt) => {
    store.addAuditLog({
      actor: store.getState().currentUser.name,
      role: store.getState().currentRole,
      category: 'Analytics',
      action: `REPORT_EXPORT_${fmt.toUpperCase()}`,
      details: `Generated and downloaded ${store.getSelectedCity().name} sector situation report in ${fmt.toUpperCase()} format.`,
    });
    store.addToast(`Exported ${fmt.toUpperCase()} Situation Report!`, 'success');
  },

  // Integrations & Provider testing
  testAllIntegrations: async () => {
    store.addToast('Pinging all official telemetry providers...', 'info');
    const results = await providerRegistry.testAll();
    store.addToast(`Tested ${results.length} official streams (All snapshots active)`, 'success');
    store.notify();
  },

  pingIntegration: async (id) => {
    const res = await providerRegistry.refreshProvider(id);
    if (res.success) {
      store.addToast(`Ping to provider: ${res.pingMs}ms (${res.status})`, 'success');
    } else {
      store.addToast(`Provider ping failed: ${res.error}`, 'error');
    }
    store.notify();
  },

  getDirections: (shelterId) => {
    store.setPage('live-network');
    store.addToast('Displaying Safe Elevation Corridor to Shelter', 'info');
  }
};

// Subscribe to store updates
store.subscribe(renderApp);

// Initial render
document.addEventListener('DOMContentLoaded', renderApp);
renderApp();

// Connect to Real-time Backend EventStream if available
if (typeof EventSource !== 'undefined') {
  try {
    const evtSource = new EventSource('/api/simulation/stream');
    evtSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.latestExplanation && payload.latestExplanation.summary) {
          store.getState().latestBedrockExplanation = payload.latestExplanation;
          store.notify();
        }
      } catch (e) {}
    };
    evtSource.onerror = () => {
      evtSource.close();
    };
  } catch (err) {}
}

