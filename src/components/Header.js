// Application Shell: Modern Top Bar and Collapsible Sidebar
import { store } from '../state/store.js';
import { USER_ROLES } from '../data/seedData.js';
import { INDIAN_CITIES } from '../geo/cities.js';

/**
 * Top Application Bar
 * Clean light navigation with identity, city selector, data mode toggle, search, and user profile
 */
export function renderHeader() {
  const state = store.getState();
  const currentCity = store.getSelectedCity();
  const currentOrg = state.organizations.find(o => o.id === state.currentOrgId) || state.organizations[0];
  const roleConfig = USER_ROLES[state.currentRole] || USER_ROLES.ORG_ADMIN;
  const isSim = state.dataMode === 'SIMULATION';
  const unreadLogsCount = state.auditLogs.slice(0, 5).length;

  return `
    <header class="h-16 w-full bg-white border-b border-app-border px-4 lg:px-6 flex items-center justify-between gap-4 z-40 sticky top-0 shadow-subtle flex-shrink-0">
      
      <!-- LEFT: Brand, Sidebar Toggle, City & Org Selector -->
      <div class="flex items-center gap-3">
        <!-- Sidebar Toggle Button (Mobile & Desktop) -->
        <button 
          onclick="window.app.toggleSidebar()" 
          title="Toggle Navigation Sidebar"
          class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-app-border"
        >
          <span class="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <!-- Brand Identity -->
        <button onclick="window.app.navigate('overview')" class="flex items-center gap-2.5 text-left group mr-1">
          <div class="w-8 h-8 rounded-lg bg-navy-900 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors">
            <span class="material-symbols-outlined text-[20px]">flood</span>
          </div>
          <div class="hidden sm:block">
            <div class="flex items-center gap-1.5 leading-none">
              <span class="font-bold text-sm tracking-tight text-navy-900 font-sans">FloodRoute</span>
              <span class="text-[10px] bg-teal-50 text-teal-800 font-medium px-1.5 py-0.5 rounded border border-teal-200">CIVIC</span>
            </div>
            <span class="text-[11px] text-slate-500 font-sans block mt-0.5">Mobility & Relief Engine</span>
          </div>
        </button>

        <div class="h-5 w-px bg-slate-200 hidden md:block"></div>

        <!-- AUTHENTIC INDIAN CITY SELECTOR -->
        <div class="relative group">
          <button class="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors text-left">
            <span class="material-symbols-outlined text-teal-600 text-[18px]">location_on</span>
            <div class="flex flex-col leading-none">
              <div class="flex items-center gap-1">
                <span class="font-semibold text-xs text-navy-900">${currentCity.name}</span>
                <span class="text-[10px] text-slate-500">(${currentCity.state})</span>
                <span class="material-symbols-outlined text-slate-400 text-[16px]">expand_more</span>
              </div>
              <span class="text-[10px] text-slate-500 truncate max-w-[140px] mt-0.5">${currentCity.sources.length} Official Datasets</span>
            </div>
          </button>

          <!-- City Dropdown Menu -->
          <div class="absolute left-0 mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-modal p-2 hidden group-hover:block z-50 animate-slideDown">
            <div class="px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1.5 flex justify-between items-center">
              <span>Municipal Operational Jurisdiction</span>
              <span class="text-teal-700 font-mono text-[10px]">6 Real Profiles</span>
            </div>

            <div class="space-y-1">
              ${Object.values(INDIAN_CITIES).map(city => {
                const isSelected = city.id === currentCity.id;
                const isPilot = city.id === 'mumbai';
                return `
                  <button onclick="window.app.switchCity('${city.id}')" class="w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                    isSelected 
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 font-medium' 
                      : 'hover:bg-slate-50 text-slate-700'
                  }">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-md ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'} flex items-center justify-center font-bold text-[11px]">
                        ${city.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div class="font-semibold flex items-center gap-1.5 text-navy-900">
                          <span>${city.name}</span>
                          ${isPilot ? '<span class="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">PILOT CORRIDOR</span>' : ''}
                        </div>
                        <div class="text-[11px] text-slate-500 truncate max-w-[170px]">${city.tagline}</div>
                      </div>
                    </div>
                    <div class="text-right text-[11px]">
                      <span class="text-slate-500 font-mono block">${city.sources.length} feeds</span>
                      ${isSelected ? '<span class="material-symbols-outlined text-teal-600 text-[14px]">check</span>' : ''}
                    </div>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500 px-2 flex items-center gap-1">
              <span class="material-symbols-outlined text-[13px] text-slate-400">info</span>
              <span>Authoritative Municipal GIS & Statutory DMP Data</span>
            </div>
          </div>
        </div>

        <!-- Workspace / Agency Selector -->
        <div class="relative group hidden xl:block">
          <button class="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors text-left text-xs">
            <span class="material-symbols-outlined text-slate-400 text-[16px]">corporate_fare</span>
            <span class="font-medium text-slate-700 truncate max-w-[130px]">${currentOrg.name}</span>
            <span class="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
          </button>
          <div class="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-modal p-1.5 hidden group-hover:block z-50">
            <div class="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Agency Taskforce</div>
            ${state.organizations.map(org => `
              <button onclick="window.app.switchOrg('${org.id}')" class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${org.id === state.currentOrgId ? 'text-teal-700 font-semibold bg-teal-50' : 'text-slate-700'}">
                <span>${org.name}</span>
                ${org.id === state.currentOrgId ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- CENTER / RIGHT: Search & Data Mode Toggle -->
      <div class="flex items-center gap-3">
        
        <!-- Global Search Bar -->
        <div class="relative hidden lg:block w-56 xl:w-72">
          <span class="material-symbols-outlined text-slate-400 text-[18px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">search</span>
          <input 
            type="text" 
            oninput="window.app.setSearch(this.value)" 
            value="${state.searchQuery || ''}" 
            placeholder="Search corridors, incidents..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-teal-500 focus:bg-white transition-all"
          >
          ${state.searchQuery ? `
            <button onclick="window.app.setSearch('')" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <span class="material-symbols-outlined text-[14px]">close</span>
            </button>
          ` : ''}
        </div>

        <!-- DATA MODE ISOLATION SWITCHER -->
        <div class="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button 
            onclick="window.app.setDataMode('LIVE_OFFICIAL')" 
            class="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              !isSim 
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200/80 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }" 
            title="Attributable Government GIS Datasets & Verified Observations"
          >
            <span class="w-2 h-2 rounded-full ${!isSim ? 'bg-teal-600' : 'bg-slate-300'}"></span>
            <span class="hidden sm:inline">Live Data</span>
          </button>

          <button 
            onclick="window.app.setDataMode('SIMULATION')" 
            class="px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
              isSim 
                ? 'bg-red-50 text-red-700 shadow-sm border border-red-200 font-semibold' 
                : 'text-slate-600 hover:text-slate-900'
            }" 
            title="Deterministic Inundation & Reroute Simulation"
          >
            <span class="w-2 h-2 rounded-full ${isSim ? 'bg-red-500 animate-pulse' : 'bg-slate-300'}"></span>
            <span class="hidden sm:inline">Simulation</span>
          </button>
        </div>

        <!-- Legend / Provenance Drawer Trigger -->
        <button 
          onclick="window.app.toggleLegendDrawer()" 
          title="Data Sources & Provenance Registry" 
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors text-xs font-medium"
        >
          <span class="material-symbols-outlined text-teal-600 text-[16px]">verified</span>
          <span class="hidden md:inline">Sources</span>
        </button>

        <!-- Audit / Notifications Bell -->
        <button 
          onclick="window.app.navigate('audit-log')" 
          title="Audit Ledger & Notifications" 
          class="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
        >
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500"></span>
        </button>

        <!-- Role Persona Selector -->
        <div class="relative group">
          <button class="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 pl-1.5 pr-2.5 py-1 rounded-lg border border-slate-200 transition-colors text-left">
            <div class="w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs">
              ${state.currentUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div class="hidden md:flex flex-col leading-none">
              <span class="text-xs font-semibold text-navy-900">${state.currentUser.name}</span>
              <span class="text-[10px] text-slate-500 font-mono mt-0.5">${roleConfig.name}</span>
            </div>
            <span class="material-symbols-outlined text-slate-400 text-[16px]">expand_more</span>
          </button>

          <!-- Persona Picker Dropdown -->
          <div class="absolute right-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-modal p-2 hidden group-hover:block z-50 animate-slideDown">
            <div class="px-2.5 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1.5">
              Active Persona & RBAC Role
            </div>
            ${Object.keys(USER_ROLES).map(k => {
              const role = USER_ROLES[k];
              const isActive = state.currentRole === k;
              return `
                <button onclick="window.app.switchRole('${k}')" class="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between hover:bg-slate-50 transition-colors mb-0.5 ${isActive ? 'bg-teal-50 text-teal-900 font-medium' : 'text-slate-700'}">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${isActive ? 'bg-teal-600' : 'bg-slate-300'}"></span>
                    <div>
                      <div class="font-semibold text-navy-900">${role.name}</div>
                      <div class="text-[10px] text-slate-500">${role.badge}</div>
                    </div>
                  </div>
                  ${isActive ? '<span class="material-symbols-outlined text-teal-600 text-[16px]">check</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>

      </div>

    </header>
  `;
}

/**
 * Collapsible Left Navigation Sidebar
 * Cleanly grouped navigation items with state indicators
 */
export function renderSidebar() {
  const state = store.getState();
  const isCollapsed = !!state.sidebarCollapsed;
  const isSim = state.dataMode === 'SIMULATION';
  const activeIncidentsCount = state.incidents.filter(i => i.severity === 'CRITICAL' || i.status === 'ACTIVE').length;
  const currentCity = store.getSelectedCity();

  // Navigation grouping
  const navGroups = [
    {
      title: 'Operations',
      items: [
        { id: 'overview', label: 'Command Center', icon: 'dashboard' },
        { id: 'live-network', label: 'Live Network & Route', icon: 'alt_route' },
        { id: 'incidents', label: 'Incidents Queue', icon: 'warning', badge: activeIncidentsCount > 0 ? `${activeIncidentsCount}` : null, badgeColor: 'bg-red-100 text-red-700' },
        { id: 'vehicles', label: 'Fleet & Assets', icon: 'directions_car' },
        { id: 'resources', label: 'Relief & Shelters', icon: 'inventory_2' }
      ]
    },
    {
      title: 'Simulation & Intelligence',
      items: [
        { id: 'simulation', label: 'Flood Simulation', icon: 'water', badge: isSim ? 'ACTIVE' : null, badgeColor: 'bg-red-50 text-red-600 font-bold' },
        { id: 'analytics', label: 'Operational Analytics', icon: 'analytics' },
        { id: 'integrations', label: 'Data Sources & GIS', icon: 'hub' }
      ]
    },
    {
      title: 'Portals & Field Units',
      items: [
        { id: 'responder-hud', label: 'Field Responder HUD', icon: 'smartphone' },
        { id: 'public-directory', label: 'Public Assistance Portal', icon: 'public' }
      ]
    },
    {
      title: 'System & Governance',
      items: [
        { id: 'team', label: 'Team & Governance', icon: 'group' },
        { id: 'audit-log', label: 'Compliance Audit', icon: 'verified_user' },
        { id: 'settings', label: 'Workspace Settings', icon: 'settings' }
      ]
    }
  ];

  return `
    <aside class="${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-app-border flex flex-col justify-between transition-all duration-200 z-30 flex-shrink-0 select-none">
      
      <!-- Top Nav Items Container -->
      <div class="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        ${navGroups.map(group => `
          <div class="space-y-0.5">
            ${!isCollapsed ? `
              <div class="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ${group.title}
              </div>
            ` : '<div class="h-2"></div>'}

            ${group.items.map(item => {
              const isActive = state.currentPage === item.id;
              return `
                <button 
                  onclick="window.app.navigate('${item.id}')" 
                  title="${item.label}" 
                  class="w-full text-left flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'} py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive 
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 shadow-subtle' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900'
                  }"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="material-symbols-outlined text-[19px] ${isActive ? 'text-teal-700' : 'text-slate-400'} flex-shrink-0">
                      ${item.icon}
                    </span>
                    ${!isCollapsed ? `<span class="truncate">${item.label}</span>` : ''}
                  </div>

                  ${!isCollapsed && item.badge ? `
                    <span class="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${item.badgeColor || 'bg-slate-100 text-slate-600'}">
                      ${item.badge}
                    </span>
                  ` : ''}
                </button>
              `;
            }).join('')}
          </div>
        `).join('')}
      </div>

      <!-- Bottom User Context & Collapse Toggle -->
      <div class="p-2 border-t border-app-border bg-slate-50/50">
        ${!isCollapsed ? `
          <div class="px-2 py-1.5 mb-1 bg-white rounded-lg border border-slate-200/70 text-[11px] text-slate-500 flex items-center justify-between">
            <span class="flex items-center gap-1.5 text-navy-900 font-medium">
              <span class="w-2 h-2 rounded-full ${isSim ? 'bg-amber-500' : 'bg-teal-600'}"></span>
              <span class="truncate">${currentCity.name} Grid</span>
            </span>
            <span class="font-mono text-[10px] text-slate-400">${currentCity.sources.length} feeds</span>
          </div>
        ` : ''}

        <button 
          onclick="window.app.toggleSidebar()" 
          title="${isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}"
          class="w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-navy-900 hover:bg-slate-100 transition-colors"
        >
          ${!isCollapsed ? `<span class="text-[11px]">Collapse Menu</span>` : ''}
          <span class="material-symbols-outlined text-[18px]">
            ${isCollapsed ? 'chevron_right' : 'chevron_left'}
          </span>
        </button>
      </div>

    </aside>
  `;
}
