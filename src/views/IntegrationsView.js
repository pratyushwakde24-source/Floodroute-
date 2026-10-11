// Data Sources & Official GIS Registries Screen
import { store } from '../state/store.js';
import { providerRegistry } from '../services/providers/providerRegistry.js';

export function renderIntegrationsView() {
  const state = store.getState();
  const city = store.getSelectedCity();
  const providers = providerRegistry.getAll();

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Data Sources & Official GIS Registries</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              ${providers.length} Statutory Feeds
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            ArcGIS MapServers, CWC River Hydrometry & Statutory Municipal Disaster Management Plans
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.testAllIntegrations()" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <span class="material-symbols-outlined text-[16px]">sync</span>
            <span>Test Telemetry Endpoints</span>
          </button>
        </div>
      </div>

      <!-- Provenance Governance Policy Banner -->
      <div class="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3 shadow-subtle">
        <span class="material-symbols-outlined text-teal-700 text-[22px] flex-shrink-0 mt-0.5">verified_user</span>
        <div class="space-y-1 text-xs">
          <h3 class="font-bold text-teal-900 uppercase tracking-wide">
            Official Data Governance & Audit Policy
          </h3>
          <p class="text-teal-800 leading-relaxed">
            FloodRoute strictly respects the authenticity of official municipal datasets. Sources are marked <strong>CONNECTED</strong> only after a verified HTTP response with authentic feature payloads. Official reports without live APIs are clearly labeled as <strong>STATIC OFFICIAL SOURCE ONLY</strong> with documented spatial uncertainty. River stages (MSL) are strictly isolated from road water depth.
          </p>
        </div>
      </div>

      <!-- Providers Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${providers.map(prov => {
          const isConn = prov.status === 'CONNECTED';
          const isStatic = prov.status === 'STATIC_OFFICIAL_SOURCE_ONLY';
          const isUnavail = prov.status === 'UNAVAILABLE';

          let badgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
          let badgeText = prov.status;

          if (isConn) {
            badgeClass = 'bg-teal-50 text-teal-800 border-teal-200';
            badgeText = 'CONNECTED &bull; LIVE SNAPSHOT';
          } else if (isStatic) {
            badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
            badgeText = 'STATIC OFFICIAL SOURCE';
          } else if (isUnavail) {
            badgeClass = 'bg-red-50 text-red-700 border-red-200';
            badgeText = 'UNAVAILABLE';
          }

          return `
            <div class="ui-card p-4 space-y-3.5 hover:shadow-card transition-shadow">
              
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full ${isConn ? 'bg-teal-600' : (isStatic ? 'bg-amber-500' : 'bg-red-500')}"></span>
                    <h3 class="font-bold text-sm text-navy-900">${prov.name}</h3>
                  </div>
                  <div class="text-[11px] text-slate-500 font-mono mt-0.5">
                    Agency: ${prov.agency} &bull; ${prov.city}
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeClass}">
                  ${badgeText}
                </span>
              </div>

              <!-- Endpoint / Reference URL -->
              <div class="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-mono space-y-1">
                <div class="text-[10px] text-slate-400 uppercase font-sans">Official Service Endpoint</div>
                <div class="text-[11px] text-navy-900 break-all select-all">
                  ${prov.url || 'Statutory Official Document / Annexure IV Reference'}
                </div>
              </div>

              <!-- Metadata Metrics -->
              <div class="grid grid-cols-2 gap-2 text-xs font-sans text-slate-600 pt-2 border-t border-slate-100">
                <div>
                  <span class="text-slate-400 block text-[10px]">INGESTED LAYERS</span>
                  <span class="font-medium text-navy-900 text-[11px]">${prov.layersIngested || 'Municipal Master GIS'}</span>
                </div>
                <div>
                  <span class="text-slate-400 block text-[10px]">UPDATE FREQUENCY</span>
                  <span class="font-medium text-navy-900 text-[11px]">${prov.frequency || 'Periodic Statutory Refresh'}</span>
                </div>
              </div>

              <!-- Actions & Ping Latency -->
              <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div class="font-mono text-[11px] text-slate-500">
                  Last Checked: <span class="text-navy-900 font-semibold">${prov.lastPing || 'Recent'}</span>
                </div>

                <button 
                  onclick="window.app.pingIntegration('${prov.id}')" 
                  class="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1"
                >
                  <span class="material-symbols-outlined text-[14px]">refresh</span>
                  <span>Ping Stream</span>
                </button>
              </div>

            </div>
          `;
        }).join('')}
      </div>

    </div>
  `;
}
