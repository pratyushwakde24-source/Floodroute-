// Notifications & Compliance Audit Log Screen
import { store } from '../state/store.js';

export function renderAuditLogView() {
  const state = store.getState();
  const logs = state.auditLogs;

  return `
    <div class="p-4 lg:p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-app-border pb-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-xl font-bold text-navy-900 tracking-tight">Compliance Audit Trail & Notification Log</h1>
            <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              Immutable Forensic Ledger
            </span>
          </div>
          <p class="text-xs text-slate-500 font-sans mt-0.5">
            Statutory Traceability of Route Authorizations, Dispatch Deployments & System Overrides
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            ${logs.length} Logged Entries
          </span>
        </div>
      </div>

      <!-- Audit Log Table -->
      <div class="ui-card overflow-hidden shadow-card">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs ui-table">
            <thead>
              <tr>
                <th class="py-3 px-4">Event ID</th>
                <th class="py-3 px-4">Timestamp (IST)</th>
                <th class="py-3 px-4">Category</th>
                <th class="py-3 px-4">Action Code</th>
                <th class="py-3 px-4">Actor & RBAC Role</th>
                <th class="py-3 px-4">Audit Description</th>
                <th class="py-3 px-4">IP / Origin</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${logs.map(log => {
                const isReroute = log.action.includes('REROUTE') || log.action.includes('HAZARD');
                return `
                  <tr class="hover:bg-slate-50/80 transition-colors">
                    <td class="py-3 px-4 text-slate-500 font-mono font-bold">${log.id}</td>
                    <td class="py-3 px-4 text-slate-700 font-mono">${log.timestamp}</td>
                    <td class="py-3 px-4">
                      <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                        ${log.category}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <span class="font-bold ${isReroute ? 'text-teal-700' : 'text-navy-900'}">
                        ${log.action}
                      </span>
                    </td>
                    <td class="py-3 px-4">
                      <div class="text-navy-900 font-semibold">${log.actor}</div>
                      <div class="text-[10px] text-slate-400 font-mono">${log.role}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 max-w-md">
                      ${log.details}
                    </td>
                    <td class="py-3 px-4 text-slate-400 font-mono text-[11px]">${log.ip}</td>
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
