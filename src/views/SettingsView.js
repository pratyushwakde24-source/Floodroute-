// Workspace Settings & Quotas Screen
import { store } from '../state/store.js';

export function renderSettingsView() {
  const state = store.getState();
  const currentOrg = state.organizations.find(o => o.id === state.currentOrgId) || state.organizations[0];

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Workspace Settings & Preferences</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              Tier: Municipal Operations
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Agency Profile, GIS Basemap Providers & Telemetry Quota Allocations
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.navigate('integrations')" 
            class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-subtle"
          >
            Data Sources
          </button>
          <button 
            onclick="window.app.navigate('team')" 
            class="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors shadow-subtle"
          >
            Team Governance
          </button>
        </div>
      </div>

      <!-- Agency Identity Card -->
      <div class="ui-card p-5 space-y-4">
        <h2 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
          Jurisdiction & Taskforce Profile
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="text-slate-600 font-medium block mb-1">Agency Taskforce Name</label>
            <input 
              type="text" 
              value="${currentOrg.name}" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
            >
          </div>

          <div>
            <label class="text-slate-600 font-medium block mb-1">Sector & Basin Jurisdiction</label>
            <input 
              type="text" 
              value="${currentOrg.sector} &bull; ${currentOrg.jurisdiction}" 
              class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white"
            >
          </div>
        </div>
      </div>

      <!-- Map & Telemetry Configuration -->
      <div class="ui-card p-5 space-y-4">
        <h2 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
          Cartographic & Basemap Provider
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label class="text-slate-600 font-medium block mb-1">Tactical Basemap Service</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white">
              <option selected>Esri World Dark Gray Canvas (Unwatermarked &bull; High Contrast)</option>
              <option>OpenStreetMap Standard (Free / Open Community)</option>
              <option>Custom Vector Tile Service (Configured via VITE_MAP_TILE_URL)</option>
            </select>
          </div>

          <div>
            <label class="text-slate-600 font-medium block mb-1">Hydrological Datum & Elevation Units</label>
            <select class="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-navy-900 outline-none focus:border-teal-500 focus:bg-white">
              <option selected>Mean Sea Level (Meters above MSL / Centimeters road water)</option>
              <option>National Geodetic Vertical Datum (NGVD29)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Quota Allocations & Usage Capacity -->
      <div class="ui-card p-5 space-y-4">
        <div class="flex items-center justify-between border-b border-app-border pb-3">
          <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Enterprise Quotas & Telemetry Capacity
          </h3>
          <span class="text-xs text-teal-700 font-mono font-medium">UNLIMITED OPERATIONAL TIER</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500 font-medium">ArcGIS REST Queries:</span>
              <span class="font-bold text-navy-900 font-mono">14,280 / 100,000</span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div class="bg-teal-600 h-full rounded-full" style="width: 14%"></div>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500 font-medium">Dijkstra Route Computations:</span>
              <span class="font-bold text-navy-900 font-mono">2,840 / 50,000</span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div class="bg-teal-600 h-full rounded-full" style="width: 6%"></div>
            </div>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-slate-500 font-medium">Field Terminal Relays:</span>
              <span class="font-bold text-navy-900 font-mono">18 / 100 Units</span>
            </div>
            <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div class="bg-teal-600 h-full rounded-full" style="width: 18%"></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}
