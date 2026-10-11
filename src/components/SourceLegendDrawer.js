// Source & Legend Drawer Component for FloodRoute
// Detailed provenance, data freshness, confidence ratings and legal attribution
import { store } from '../state/store.js';
import { DATA_CATEGORY } from '../models/provenance.js';

export function renderSourceLegendDrawer() {
  const state = store.getState();
  if (!state.showLegendDrawer) return '';

  const city = store.getSelectedCity();

  return `
    <!-- Slide-over Drawer Backdrop -->
    <div class="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm animate-fadeIn flex justify-end">
      
      <div class="w-full max-w-xl h-full bg-white border-l border-slate-200 shadow-modal flex flex-col justify-between overflow-y-auto p-6 space-y-6">
        
        <!-- Drawer Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              <h2 class="text-base font-bold text-navy-900">Data Provenance & Classification Registry</h2>
            </div>
            <p class="text-xs text-slate-500 font-mono mt-1">
              Authoritative Municipal Datasets for ${city.name} (${city.state})
            </p>
          </div>
          <button onclick="window.app.toggleLegendDrawer()" class="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Strict Data Classification Guide -->
        <div class="space-y-3">
          <h3 class="text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Data Classification Taxonomy
          </h3>
          <div class="space-y-2">
            ${Object.values(DATA_CATEGORY).map(cat => `
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3">
                <span class="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style="background-color: ${cat.colorHex}"></span>
                <div class="space-y-0.5">
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-xs text-navy-900">${cat.label}</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono border bg-white text-slate-700">${cat.key}</span>
                  </div>
                  <p class="text-[11px] text-slate-600 leading-relaxed">${cat.description}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Active Official Data Sources for this City -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Connected Official Sources (${city.sources.length})
            </h3>
            <span class="text-[10px] text-teal-700 font-medium">Statutory Provenance</span>
          </div>

          <div class="space-y-2">
            ${city.sources.map(src => `
              <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-navy-900">${src.name}</span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-semibold">
                    ${src.type}
                  </span>
                </div>
                <div class="text-[11px] text-slate-500 break-all font-mono">
                  ${src.url ? `<a href="${src.url}" target="_blank" class="hover:text-teal-700 underline">${src.url}</a>` : 'Offline Statutory Report Archive'}
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>Frequency: ${src.frequency || 'Live Snapshot'}</span>
                  <span class="text-teal-700 font-medium">Verified Official Record</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Governance Policy Notice -->
        <div class="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 space-y-1">
          <div class="font-semibold flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px] text-teal-700">shield</span>
            <span>Civic Data Integrity Guarantee</span>
          </div>
          <p class="text-[11px] text-teal-800 leading-relaxed">
            FloodRoute strictly isolates live telemetry from simulated scenario events. Simulated road closures or crest depths are never committed to official municipal observation logs.
          </p>
        </div>

        <!-- Footer -->
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span class="font-mono text-[10px]">&copy; 2026 FloodRoute Civic Intelligence</span>
          <button onclick="window.app.toggleLegendDrawer()" class="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors">
            Close Drawer
          </button>
        </div>

      </div>
    </div>
  `;
}
