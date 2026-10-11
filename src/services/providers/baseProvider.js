// Base Provider Adapter for official government GIS & hydrological telemetry
import { DATA_CATEGORY, CONFIDENCE_LEVEL, formatIST } from '../../models/provenance.js';

export class BaseProvider {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.agency = config.agency;
    this.sourceUrl = config.sourceUrl;
    this.category = config.category;
    this.coverageCity = config.coverageCity;
    this.status = 'INITIALIZING'; // 'CONNECTED' | 'OFFICIAL_SNAPSHOT' | 'DISCONNECTED' | 'ERROR'
    this.lastSync = null;
    this.lastLatencyMs = 0;
    this.recordCount = 0;
    this.lastError = null;
    this.metadata = config.metadata || {};
  }

  getProvenance(extra = {}) {
    return {
      sourceOrg: this.agency,
      sourceUrl: this.sourceUrl,
      datasetName: this.metadata.datasetName || this.name,
      publicationDate: this.metadata.publicationDate || '2024-06-01',
      retrievalTime: formatIST(Date.now()),
      dataCategory: extra.dataCategory || this.category,
      confidence: extra.confidence || CONFIDENCE_LEVEL.OFFICIAL_DOCUMENTED.label,
      crs: 'EPSG:4326 (WGS84)',
      license: this.metadata.license || 'Government Open Data / Public Disaster Management Attribution Required',
      attributionText: `${this.agency} • ${this.name} (${this.metadata.referenceDoc || 'Official Source'})`,
      ...extra
    };
  }
}
