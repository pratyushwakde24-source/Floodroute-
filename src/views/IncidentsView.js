// Emergency Incidents Queue Screen
import { store } from '../state/store.js';

export function renderIncidentsView() {
  const state = store.getState();
  const incidents = state.incidents;

  // Filter logic
  let filtered = incidents;
  if (state.incidentFilter !== 'ALL') {
    filtered = incidents.filter(i => i.severity === state.incidentFilter || i.status === state.incidentFilter);
  }
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    filtered = filtered.filter(i => 
      i.title.toLowerCase().includes(q) || 
      i.id.toLowerCase().includes(q) || 
      i.location.toLowerCase().includes(q)
    );
  }

  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const activeCount = incidents.filter(i => i.status === 'ACTIVE' || i.status === 'CRITICAL_HAZARD').length;
  const dispatchedCount = incidents.filter(i => i.status === 'DISPATCHED' || i.status === 'IN_PROGRESS').length;

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Top Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Emergency Incidents Queue</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
              ${incidents.length} Active Records
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Catchment Basin Triage, Verified Sensor Telemetry & Tactical Rapid Dispatch
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.openNewIncidentModal()" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">add_alert</span>
            <span>Log New Incident</span>
          </button>
        </div>
      </div>

      <!-- Metric Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Total Queue</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">${incidents.length}</span>
          <span class="text-[11px] text-teal-700 font-medium block mt-1">100% Geospatially Tagged</span>
        </div>

        <div class="ui-card p-4 border-red-200 bg-red-50/20">
          <span class="text-xs text-red-700 font-medium block">Critical Inundation</span>
          <span class="text-2xl font-bold text-red-600 font-sans mt-1 block">${criticalCount}</span>
          <span class="text-[11px] text-red-600 font-medium block mt-1">Immediate Rescue Needed</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Active Unassigned</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">${activeCount}</span>
          <span class="text-[11px] text-slate-500 block mt-1">Pending Asset Allocation</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">En Route / Dispatched</span>
          <span class="text-2xl font-bold text-teal-700 font-sans mt-1 block">${dispatchedCount}</span>
          <span class="text-[11px] text-teal-700 font-medium block mt-1">High-Clearance Units Staged</span>
        </div>
      </div>

      <!-- Filter Chips & Search Toolbar -->
      <div class="ui-card p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          ${['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'ACTIVE', 'DISPATCHED'].map(f => `
            <button 
              onclick="window.app.setIncidentFilter('${f}')" 
              class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                state.incidentFilter === f 
                  ? 'bg-navy-900 text-white font-semibold shadow-subtle' 
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-navy-900 border border-slate-200'
              }"
            >
              ${f}
            </button>
          `).join('')}
        </div>

        <div class="relative max-w-sm w-full">
          <span class="material-symbols-outlined text-slate-400 text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input 
            type="text" 
            oninput="window.app.setSearch(this.value)" 
            value="${state.searchQuery || ''}" 
            placeholder="Filter by keyword, location, ID..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white transition-all font-sans"
          >
        </div>
      </div>

      <!-- Incidents Data Table -->
      <div class="ui-card overflow-hidden shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs ui-table">
            <thead>
              <tr>
                <th class="py-3 px-4">Incident ID</th>
                <th class="py-3 px-4">Headline & Catchment</th>
                <th class="py-3 px-4">Location</th>
                <th class="py-3 px-4">Severity</th>
                <th class="py-3 px-4">Water Depth</th>
                <th class="py-3 px-4">Assigned Unit</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="8" class="py-8 text-center text-slate-400">
                    No incidents match the active filter criteria.
                  </td>
                </tr>
              ` : filtered.map(inc => {
                let sevClass = 'bg-slate-100 text-slate-700';
                if (inc.severity === 'CRITICAL') sevClass = 'bg-red-100 text-red-800 font-bold';
                else if (inc.severity === 'HIGH') sevClass = 'bg-amber-100 text-amber-800 font-semibold';
                else if (inc.severity === 'MEDIUM') sevClass = 'bg-blue-100 text-blue-800';

                return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3 px-4 font-mono font-bold text-navy-900">${inc.id}</td>
                    <td class="py-3 px-4">
                      <div class="font-semibold text-navy-900">${inc.title}</div>
                      <div class="text-[11px] text-slate-500 font-mono mt-0.5">${inc.zone}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-700">${inc.location}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${sevClass}">
                        ${inc.severity}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono font-bold ${
                      inc.waterDepthM > 0.6 ? 'text-red-600' : 'text-slate-800'
                    }">
                      ${inc.waterDepthM} m
                    </td>
                    <td class="py-3 px-4">
                      <span class="text-slate-700 font-medium">${inc.assignedVehicle || 'Unassigned'}</span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded text-[10px] font-medium ${
                        inc.status === 'CRITICAL_HAZARD' ? 'bg-red-50 text-red-700 border border-red-200' :
                        (inc.status === 'ACTIVE' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-teal-50 text-teal-800 border border-teal-200')
                      }">
                        ${inc.status}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-right">
                      <button 
                        onclick="window.app.inspectIncident('${inc.id}')" 
                        class="px-2.5 py-1 rounded bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 font-semibold text-[11px] border border-slate-200 transition-colors"
                      >
                        Triage & Dispatch
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}
