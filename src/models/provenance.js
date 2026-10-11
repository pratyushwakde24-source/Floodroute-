// FloodRoute Data Classification & Provenance Model
// Strictly enforces separation of Historical Risk, Live Observations, Forecasts, Community Reports, and Simulation

export const DATA_CATEGORY = {
  STATIC_RISK: {
    key: 'STATIC_RISK',
    label: 'Historical / Static Risk',
    badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
    colorHex: '#f59e0b',
    description: 'Chronic waterlogging spots, drainage basins, low-lying zones. Never indicates an active road blockage.'
  },
  LIVE_OBSERVATION: {
    key: 'LIVE_OBSERVATION',
    label: 'Current Observation',
    badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    colorHex: '#10b981',
    description: 'Authoritative telemetry sensors and verified responder reports with timestamp freshness.'
  },
  FORECAST_WARNING: {
    key: 'FORECAST_WARNING',
    label: 'Forecast & Warning',
    badgeClass: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    colorHex: '#f97316',
    description: 'IMD rainfall alerts, advisory river hydrographs, and meteorological forecasts.'
  },
  COMMUNITY_REPORT: {
    key: 'COMMUNITY_REPORT',
    label: 'Community Report',
    badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    colorHex: '#a855f7',
    description: 'Public crowdsourced citizen reports. Held as UNVERIFIED until dispatcher authorized.'
  },
  SIMULATION: {
    key: 'SIMULATION',
    label: 'Simulation Scenario',
    badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
    colorHex: '#f43f5e',
    description: 'Isolated deterministic training and demo scenario. Never written into real observations.'
  }
};

export const CONFIDENCE_LEVEL = {
  OFFICIAL_AUTHORITATIVE: {
    label: 'Official Authoritative',
    desc: 'Government department telemetry or certified GIS service'
  },
  OFFICIAL_DOCUMENTED: {
    label: 'Official Documented',
    desc: 'Published in official city disaster management plan or study'
  },
  MODEL_DERIVED: {
    label: 'Model Derived',
    desc: 'Climate resilience action plan hydrological simulation'
  },
  UNVERIFIED_CROWD: {
    label: 'Unverified Citizen',
    desc: 'Crowdsourced public submission pending field confirmation'
  }
};

/**
 * Format any ISO or timestamp to India Standard Time (IST - UTC+5:30)
 */
export function formatIST(dateOrIso) {
  if (!dateOrIso) return 'N/A';
  try {
    const d = new Date(dateOrIso);
    if (isNaN(d.getTime())) return String(dateOrIso);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(d) + ' IST';
  } catch (e) {
    return String(dateOrIso);
  }
}

/**
 * Check if a live telemetry record is fresh or stale
 */
export function checkFreshness(observationTimeIso, maxAgeMinutes = 60) {
  if (!observationTimeIso) return { status: 'UNKNOWN', label: 'No Observation Time' };
  try {
    const obsTime = new Date(observationTimeIso).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - obsTime) / (1000 * 60));
    
    if (diffMins < 0) {
      return { status: 'FUTURE_WINDOW', label: 'Valid Forecast Window' };
    }
    if (diffMins <= maxAgeMinutes) {
      return { status: 'LIVE_FRESH', label: `Fresh (${diffMins}m ago)`, isStale: false };
    }
    return { status: 'STALE', label: `Stale (${diffMins}m ago)`, isStale: true };
  } catch {
    return { status: 'UNKNOWN', label: 'Invalid Timestamp', isStale: true };
  }
}
