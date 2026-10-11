// Command Center / Overview Dashboard Screen
import { store } from '../state/store.js';
import { RoutingEngine } from '../services/routingService.js';
import { DATA_CATEGORY, formatIST } from '../models/provenance.js';

export function renderOverviewView() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const step = state.scenario.step;
  const echo7 = state.vehicles.find(v => v.id === 'VEH-07');
  const isSim = state.dataMode === 'SIMULATION';
  const filters = state.layerFilters;

  // Real road statistics
  const totalRoads = city.roads.length;
  const passableRoads = city.roads.filter(r => !(r.id === 'rd-ambedkar-dr' && isSim && step >= 2));
  const passablePct = Math.round((passableRoads.length / totalRoads) * 100);

  // Active incidents & critical count
  const criticalIncidents = state.incidents.filter(i => i.severity === 'CRITICAL');
  const activeIncidents = state.incidents.filter(i => i.status === 'ACTIVE' || i.status === 'CRITICAL_HAZARD');

  // Active routing status
  const routing = RoutingEngine.calculateRoute(city, {
    vehicleClearanceCm: echo7.groundClearanceCm,
    isSimStep2Plus: isSim && step >= 2
  });

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Top Operational Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Command Center Overview</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold ${
              isSim && step >= 2 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-teal-50 text-teal-800 border border-teal-200'
            }">
              ${isSim && step >= 2 ? 'SURGE ALERT LEVEL 3' : 'OPERATIONAL NOMINAL'}
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            ${city.name} Disaster Management Coordination Grid &bull; Municipal Catchment Telemetry
          </p>
        </div>

        <!-- Quick Operational Actions -->
        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.recenterMap()" 
            class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px] text-slate-400">my_location</span>
            <span>Recenter (${city.name})</span>
          </button>

          <button 
            onclick="window.app.openNewIncidentModal()" 
            class="px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px]">add_alert</span>
            <span>Log Incident</span>
          </button>

          <button 
            onclick="window.app.exportReport('pdf')" 
            class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-subtle flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-[16px] text-slate-400">print</span>
            <span>Export SitRep</span>
          </button>
        </div>
      </div>

      <!-- Metric Summary Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        
        <!-- Card 1: Passable Arterials -->
        <div class="ui-card p-4">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span class="font-medium">Passable Arterials</span>
            <span class="material-symbols-outlined text-teal-600 text-[18px]">alt_route</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-navy-900 font-sans">${passablePct}%</span>
            <span class="text-xs text-slate-500 font-mono">${passableRoads.length}/${totalRoads} roads</span>
          </div>
          <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div class="bg-teal-600 h-full rounded-full transition-all" style="width: ${passablePct}%"></div>
          </div>
        </div>

        <!-- Card 2: Active Incidents -->
        <div class="ui-card p-4 ${criticalIncidents.length > 0 ? 'border-red-200 bg-red-50/20' : ''}">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span class="font-medium">Active Incidents</span>
            <span class="material-symbols-outlined ${criticalIncidents.length > 0 ? 'text-red-600' : 'text-amber-500'} text-[18px]">warning</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold ${criticalIncidents.length > 0 ? 'text-red-600' : 'text-navy-900'} font-sans">
              ${activeIncidents.length}
            </span>
            <span class="text-xs text-red-600 font-medium font-mono">${criticalIncidents.length} Critical</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-2 truncate">
            ${criticalIncidents.length > 0 ? 'Immediate rapid response required' : 'Monitored catchment areas nominal'}
          </div>
        </div>

        <!-- Card 3: Telemetry Freshness -->
        <div class="ui-card p-4">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span class="font-medium">Sensor Observations</span>
            <span class="material-symbols-outlined text-teal-600 text-[18px]">sensors</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-navy-900 font-sans">${city.liveObservations.length}</span>
            <span class="text-xs text-teal-700 font-medium font-mono">100% Online</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-2 flex items-center gap-1 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
            <span>Synced: ${formatIST(Date.now()).split(',')[1] || 'Just now'}</span>
          </div>
        </div>

        <!-- Card 4: Deployed Fleet Units -->
        <div class="ui-card p-4">
          <div class="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span class="font-medium">Relief Fleet Assets</span>
            <span class="material-symbols-outlined text-navy-700 text-[18px]">directions_car</span>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-2xl font-bold text-navy-900 font-sans">
              ${state.vehicles.filter(v => v.status === 'DEPLOYED' || v.status === 'IN_SERVICE').length}
            </span>
            <span class="text-xs text-slate-500 font-mono">of ${state.vehicles.length} Units</span>
          </div>
          <div class="text-[11px] text-slate-500 mt-2 truncate font-mono">
            Clearance up to 250cm (Amphibious)
          </div>
        </div>

      </div>

      <!-- Main Operational Layout: Map & Dispatch Sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        <!-- Large Tactical Map Container (8 Cols) -->
        <div class="lg:col-span-8 ui-card overflow-hidden flex flex-col h-[600px] shadow-card">
          
          <!-- Map Toolbar & Layer Filter Pills -->
          <div class="bg-white border-b border-app-border px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap z-10">
            <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              <span class="text-slate-400 font-semibold text-[11px] uppercase mr-1">Layers:</span>
              
              <!-- Roads Filter -->
              <button 
                onclick="window.app.toggleMapFilter('roads')" 
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filters.roads ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full ${filters.roads ? 'bg-teal-600' : 'bg-slate-400'}"></span>
                <span>Roads (${city.roads.length})</span>
              </button>

              <!-- Static Risk Filter -->
              <button 
                onclick="window.app.toggleMapFilter('staticRisk')" 
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filters.staticRisk ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full ${filters.staticRisk ? 'bg-amber-500' : 'bg-slate-400'}"></span>
                <span>Static Risk (${city.staticRiskSpots.length})</span>
              </button>

              <!-- Sensors Filter -->
              <button 
                onclick="window.app.toggleMapFilter('liveSensors')" 
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filters.liveSensors ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full ${filters.liveSensors ? 'bg-teal-600 animate-pulse' : 'bg-slate-400'}"></span>
                <span>Sensors (${city.liveObservations.length})</span>
              </button>

              <!-- Facilities Filter -->
              <button 
                onclick="window.app.toggleMapFilter('facilities')" 
                class="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                  filters.facilities ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200'
                }"
              >
                <span class="w-1.5 h-1.5 rounded-full ${filters.facilities ? 'bg-blue-500' : 'bg-slate-400'}"></span>
                <span>Shelters (${city.facilities.length})</span>
              </button>
            </div>

            <!-- Map Zoom & Recenter Controls -->
            <div class="flex items-center gap-1">
              <button 
                onclick="window.app.zoomMap(1)" 
                class="w-7 h-7 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"
                title="Zoom In"
              >
                <span class="material-symbols-outlined text-[16px]">add</span>
              </button>
              <button 
                onclick="window.app.zoomMap(-1)" 
                class="w-7 h-7 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"
                title="Zoom Out"
              >
                <span class="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <button 
                onclick="window.app.recenterMap()" 
                class="w-7 h-7 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600"
                title="Reset Center"
              >
                <span class="material-symbols-outlined text-[16px]">crop_free</span>
              </button>
            </div>
          </div>

          <!-- Tactical Leaflet GIS Canvas Container -->
          <div class="relative flex-1 w-full bg-slate-900">
            <div id="overviewMapCanvas" class="absolute inset-0 w-full h-full z-0">
              <!-- Leaflet Map Mounts Here -->
            </div>
          </div>

          <!-- Bottom Map Legend Bar -->
          <div class="bg-white border-t border-app-border px-4 py-2 text-[11px] text-slate-500 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <span class="w-2.5 h-1 bg-teal-500 rounded"></span>
                <span>Passable Corridors</span>
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2.5 h-1 bg-amber-500 rounded"></span>
                <span>Chronic Risk Spots</span>
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2.5 h-1 bg-red-500 rounded"></span>
                <span>Submerged / Impassable</span>
              </span>
            </div>
            <button onclick="window.app.navigate('live-network')" class="text-teal-700 font-semibold hover:underline flex items-center gap-1">
              <span>Full Tactical Route View</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

        </div>

        <!-- Right Side: Dispatch Queue & Priority Actions (4 Cols) -->
        <div class="lg:col-span-4 space-y-4">
          
          <!-- PRIORITIZED NEXT OPERATIONAL ACTION CARD -->
          <div class="ui-card p-4 border-l-4 ${
            isSim && step >= 2 ? 'border-l-red-600 bg-red-50/20' : 'border-l-teal-600'
          }">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[10px] font-bold uppercase tracking-wider ${
                isSim && step >= 2 ? 'text-red-700' : 'text-teal-800'
              }">
                PRIORITY OPERATIONAL ACTION
              </span>
              <span class="material-symbols-outlined text-[18px] ${
                isSim && step >= 2 ? 'text-red-600 animate-pulse' : 'text-teal-600'
              }">
                ${isSim && step >= 2 ? 'emergency' : 'task_alt'}
              </span>
            </div>

            ${isSim && step === 2 ? `
              <h3 class="font-bold text-sm text-navy-900 mb-1">Authorize Emergency Elevated Reroute</h3>
              <p class="text-xs text-slate-600 mb-3 leading-relaxed">
                Unit Echo-7 carrying critical pediatric medication is halted before Hindmata basin (85cm crest water). Dispatcher approval required for Lalbaug Viaduct bypass.
              </p>
              <button 
                onclick="window.app.openRerouteModal()" 
                class="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-card flex items-center justify-center gap-1.5 transition-colors"
              >
                <span class="material-symbols-outlined text-[16px]">alt_route</span>
                <span>Review & Authorize Reroute</span>
              </button>
            ` : (isSim && step === 3 ? `
              <h3 class="font-bold text-sm text-navy-900 mb-1">Reroute Active & En Route</h3>
              <p class="text-xs text-slate-600 mb-3 leading-relaxed">
                Unit Echo-7 successfully ascended Lalbaug Viaduct (+14.5m MSL). Tracking ETA: 17.5 mins to KEM Hospital Trauma Concourse.
              </p>
              <button 
                onclick="window.app.navigate('live-network')" 
                class="w-full py-2 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-card flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Track Vehicle Telemetry</span>
              </button>
            ` : `
              <h3 class="font-bold text-sm text-navy-900 mb-1">Corridors Operational & Clear</h3>
              <p class="text-xs text-slate-600 mb-3 leading-relaxed">
                Primary arterial routes currently meet ground clearance safety thresholds. Continuous telemetry monitoring active across ${city.name} basin.
              </p>
              <button 
                onclick="window.app.navigate('live-network')" 
                class="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Inspect Active Corridors</span>
              </button>
            `)}
          </div>

          <!-- Active Incidents Mini Triage Queue -->
          <div class="ui-card p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-app-border pb-2.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-xs text-navy-900">Emergency Incidents Queue</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-100 text-red-700 font-bold">${state.incidents.length}</span>
              </div>
              <button onclick="window.app.navigate('incidents')" class="text-xs text-teal-700 font-semibold hover:underline">
                View All
              </button>
            </div>

            <div class="space-y-2">
              ${state.incidents.slice(0, 3).map(inc => `
                <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors text-xs space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-mono text-[10px] text-slate-500 font-bold">${inc.id}</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                    }">
                      ${inc.severity}
                    </span>
                  </div>
                  <div class="font-semibold text-navy-900 truncate">${inc.title}</div>
                  <div class="text-[11px] text-slate-500 truncate">${inc.location} &bull; Depth: ${inc.waterDepthM}m</div>
                  <div class="pt-1 flex justify-end">
                    <button 
                      onclick="window.app.viewIncident('${inc.id}')" 
                      class="text-[11px] text-teal-700 font-medium hover:underline flex items-center gap-0.5"
                    >
                      <span>Triage Details</span>
                      <span class="material-symbols-outlined text-[13px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Authoritative Sensor Telemetry Feeds -->
          <div class="ui-card p-4 space-y-2.5">
            <div class="flex items-center justify-between border-b border-app-border pb-2">
              <span class="font-bold text-xs text-navy-900">Authoritative Telemetry Feeds</span>
              <span class="text-[10px] text-teal-700 font-mono font-medium">MCGM Layer 345</span>
            </div>

            <div class="space-y-2 text-xs">
              ${city.liveObservations.slice(0, 3).map(obs => `
                <div class="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <div>
                    <div class="font-medium text-navy-900 text-[11px]">${obs.name}</div>
                    <div class="text-[10px] text-slate-500 font-mono">${obs.location}</div>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-teal-700 text-xs">Online</span>
                    <span class="text-[9px] text-slate-400 block font-mono">Telemetry Active</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>

    </div>
  `;
}
