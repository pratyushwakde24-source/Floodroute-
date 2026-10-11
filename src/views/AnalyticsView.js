// Operational Analytics & Mission Reports Screen
import { store } from '../state/store.js';

export function renderAnalyticsView() {
  const state = store.getState();
  const city = store.getSelectedCity();

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Operational Analytics & Reports</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              ${city.name} Operational Metrics
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Transit Efficiency, Evacuation Volume & Inundation Failure Benchmarks
          </p>
        </div>

        <!-- Export Actions -->
        <div class="flex items-center gap-2">
          <button 
            onclick="window.app.exportReport('csv')" 
            class="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <span class="material-symbols-outlined text-[16px] text-slate-500">table_view</span>
            <span>Export CSV</span>
          </button>
          <button 
            onclick="window.app.exportReport('pdf')" 
            class="px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Generate Official SitRep</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Cards Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Mean Transit Time</span>
          <span class="text-2xl font-bold text-teal-700 font-sans mt-1 block">18.4 mins</span>
          <span class="text-[11px] text-teal-700 font-medium block mt-1">-46% vs Unrouted Detours</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Zero Inundation Failures</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">100%</span>
          <span class="text-[11px] text-teal-700 font-medium block mt-1">0 Flooded Emergency Units</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Civilians Evacuated</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">3,410</span>
          <span class="text-[11px] text-slate-500 block mt-1">Across 4 Safe Shelters</span>
        </div>

        <div class="ui-card p-4">
          <span class="text-xs text-slate-500 font-medium block">Elevation Safety Accuracy</span>
          <span class="text-2xl font-bold text-navy-900 font-sans mt-1 block">98.2%</span>
          <span class="text-[11px] text-slate-500 font-mono block mt-1">LiDAR & MSL Validated</span>
        </div>
      </div>

      <!-- Analytical Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        <!-- Chart 1: Water Depth vs Safe Clearance Threshold -->
        <div class="ui-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-app-border pb-2.5">
            <div>
              <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Inundation Crest vs Vehicle Clearance (24 Hours)
              </h3>
              <p class="text-[11px] text-slate-500 font-sans">Hindmata / Dadar TT Basin Catchment</p>
            </div>
            <span class="text-xs text-slate-500 font-mono">Telemetry: Layer 345</span>
          </div>

          <!-- Legible Clean SVG Line Chart -->
          <div class="relative h-60 w-full pt-4">
            <svg class="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
              <!-- Grid lines -->
              <line x1="40" y1="20" x2="480" y2="20" stroke="#E2E8F0" stroke-width="1" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#E2E8F0" stroke-width="1" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#E2E8F0" stroke-width="1" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#E2E8F0" stroke-width="1" />
              <line x1="40" y1="180" x2="480" y2="180" stroke="#CBD5E1" stroke-width="1.5" />

              <!-- Y-Axis Labels -->
              <text x="32" y="24" fill="#64748B" font-size="10" text-anchor="end" font-family="JetBrains Mono">100cm</text>
              <text x="32" y="64" fill="#64748B" font-size="10" text-anchor="end" font-family="JetBrains Mono">75cm</text>
              <text x="32" y="104" fill="#64748B" font-size="10" text-anchor="end" font-family="JetBrains Mono">50cm</text>
              <text x="32" y="144" fill="#64748B" font-size="10" text-anchor="end" font-family="JetBrains Mono">25cm</text>
              <text x="32" y="184" fill="#64748B" font-size="10" text-anchor="end" font-family="JetBrains Mono">0cm</text>

              <!-- Safe Vehicle Clearance Line (60cm) -->
              <line x1="40" y1="84" x2="480" y2="84" stroke="#D97706" stroke-width="2" stroke-dasharray="6 4" />
              <text x="475" y="80" fill="#D97706" font-size="10" text-anchor="end" font-weight="bold" font-family="JetBrains Mono">60cm Echo-7 Max Clearance</text>

              <!-- Inundation Water Depth Curve -->
              <path d="M 40,165 Q 120,160 180,140 T 260,110 T 330,44 T 400,60 T 480,110" fill="none" stroke="#DC2626" stroke-width="3" />
              
              <!-- Shaded hazard breach zone under peak -->
              <path d="M 285,84 L 330,44 L 375,84 Z" fill="#FEE2E2" opacity="0.6" />

              <!-- X-Axis Labels -->
              <text x="40" y="195" fill="#64748B" font-size="10" font-family="JetBrains Mono">T-12h</text>
              <text x="150" y="195" fill="#64748B" font-size="10" font-family="JetBrains Mono">T-8h</text>
              <text x="260" y="195" fill="#64748B" font-size="10" font-family="JetBrains Mono">T-4h</text>
              <text x="330" y="195" fill="#DC2626" font-size="10" font-weight="bold" font-family="JetBrains Mono">Peak Crest</text>
              <text x="440" y="195" fill="#64748B" font-size="10" font-family="JetBrains Mono">Now</text>
            </svg>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-1 bg-red-600 rounded"></span>
              <span>Observed Water Depth</span>
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-1 bg-amber-500 rounded"></span>
              <span>Vehicle Safety Threshold</span>
            </span>
          </div>
        </div>

        <!-- Chart 2: Evacuation Volume by Shelter Zone -->
        <div class="ui-card p-5 space-y-3">
          <div class="flex items-center justify-between border-b border-app-border pb-2.5">
            <div>
              <h3 class="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Shelter Intake & Evacuation Volume
              </h3>
              <p class="text-[11px] text-slate-500 font-sans">Designated Municipal High Grounds</p>
            </div>
            <span class="text-xs text-teal-700 font-medium">92% Capacity Staged</span>
          </div>

          <!-- Bar Chart -->
          <div class="space-y-4 pt-2">
            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-navy-900">King George V Memorial Concourse (+12.5m MSL)</span>
                <span class="font-bold text-navy-900 font-mono">1,120 / 1,200 (93%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 93%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-navy-900">KEM Hospital Concourse (+14.2m MSL)</span>
                <span class="font-bold text-navy-900 font-mono">1,450 / 1,800 (80%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 80%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-navy-900">Don Bosco High Ground Hall (+9.8m MSL)</span>
                <span class="font-bold text-navy-900 font-mono">680 / 800 (85%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 85%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-xs mb-1">
                <span class="font-medium text-navy-900">Mahalaxmi Municipal Pavilion (+11.0m MSL)</span>
                <span class="font-bold text-navy-900 font-mono">160 / 500 (32%)</span>
              </div>
              <div class="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div class="bg-teal-600 h-full rounded-full" style="width: 32%"></div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 font-mono">
            <span>Total Capacity: 4,300 beds</span>
            <span class="text-teal-700 font-medium">890 remaining capacity</span>
          </div>
        </div>

      </div>

    </div>
  `;
}
