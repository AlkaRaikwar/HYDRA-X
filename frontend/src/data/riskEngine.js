/**
 * HYDRA-X Numerical Risk Engine
 * Calculates flood risk scores using weighted multi-factor model.
 * IBM Granite provides explanation / reasoning on top of these scores.
 * This is NOT an AI model — it is a deterministic numerical engine.
 */

const WEIGHTS = {
  rainfall: 0.25,
  rainfallIntensity: 0.15,
  drainageCapacity: 0.20,
  drainBlockage: 0.15,
  historicalFlooding: 0.10,
  citizenReports: 0.07,
  populationExposure: 0.05,
  infraVulnerability: 0.03,
};

/**
 * Compute a zone risk score 0–100.
 * All inputs normalized 0–1 before weighting.
 */
export function computeZoneRisk(params) {
  const {
    rainfall = 0,          // mm/h
    rainfallIntensity = 0, // mm/h
    drainCapacity = 1000,  // liters/sec
    drainBlockagePct = 0,  // 0-100
    historicalProb = 0,    // 0-1
    citizenReports = 0,    // count
    population = 50000,    // absolute
    criticalInfraCount = 0,
  } = params;

  const n_rainfall = Math.min(rainfall / 100, 1);
  const n_intensity = Math.min(rainfallIntensity / 100, 1);
  const n_drain = 1 - Math.min(drainCapacity / 2000, 1);
  const n_blockage = Math.min(drainBlockagePct / 100, 1);
  const n_historical = historicalProb;
  const n_reports = Math.min(citizenReports / 10, 1);
  const n_pop = Math.min(population / 200000, 1);
  const n_infra = Math.min(criticalInfraCount / 5, 1);

  const raw =
    n_rainfall * WEIGHTS.rainfall +
    n_intensity * WEIGHTS.rainfallIntensity +
    n_drain * WEIGHTS.drainageCapacity +
    n_blockage * WEIGHTS.drainBlockage +
    n_historical * WEIGHTS.historicalFlooding +
    n_reports * WEIGHTS.citizenReports +
    n_pop * WEIGHTS.populationExposure +
    n_infra * WEIGHTS.infraVulnerability;

  return Math.round(raw * 100);
}

export function computeDrainHealth(drain) {
  const daysSinceClean = Math.floor((Date.now() - new Date(drain.lastCleaned)) / 86400000);
  const overdue = Math.max(0, daysSinceClean - drain.cleaningFrequency);
  const overdueScore = Math.min(overdue / 30, 1);
  const health = Math.round(drain.condition - overdueScore * 20 - (drain.historicalIncidents / 10) * 15);
  return Math.max(0, Math.min(100, health));
}

export function computeBlockageProbability(drain) {
  const health = computeDrainHealth(drain);
  const base = (100 - health) / 100;
  const rainfallFactor = 1.3; // assume heavy rain
  return Math.round(Math.min(base * rainfallFactor * 100, 98));
}

export function computeEmergencyPriority(incident) {
  const severityMap = { CRITICAL: 0.95, HIGH: 0.75, MODERATE: 0.55, LOW: 0.30 };
  const s = severityMap[incident.severity] || 0.5;
  const infra = incident.criticalInfra ? 0.15 : 0;
  const reports = Math.min(incident.reportsCount / 10, 1) * 0.1;
  const raw = s * 0.6 + infra + reports + 0.15;
  return Math.round(Math.min(raw * 100, 100));
}

/**
 * Simulate scenario: given rainfall spike and other inputs,
 * project risk scores across all zones.
 */
export function runScenarioSimulation({ rainfall, duration, drainageEfficiency, blockedDrains, teamAvailability }, baseZones) {
  const rainfallFactor = rainfall / 50;
  const drainFactor = 1 - (drainageEfficiency / 100);
  const blockFactor = blockedDrains / 10;

  return baseZones.map(zone => {
    const adjustedRisk = Math.round(
      Math.min(100, zone.riskScore * rainfallFactor * (1 + drainFactor) * (1 + blockFactor * 0.3))
    );
    const { level } = getRiskLevelLocal(adjustedRisk);
    return {
      ...zone,
      scenarioRisk: adjustedRisk,
      scenarioLevel: level,
      change: adjustedRisk - zone.riskScore,
    };
  });
}

function getRiskLevelLocal(score) {
  if (score >= 81) return { level: 'CRITICAL' };
  if (score >= 61) return { level: 'HIGH' };
  if (score >= 41) return { level: 'ELEVATED' };
  if (score >= 21) return { level: 'MODERATE' };
  return { level: 'LOW' };
}

/**
 * Counterfactual: if drain was cleaned at time T, estimate risk reduction
 */
export function computeCounterfactual(zone, drain, hoursEarlier) {
  const reductionPct = Math.min(0.45, hoursEarlier * 0.08);
  const newRisk = Math.round(zone.riskScore * (1 - reductionPct));
  const areaReduction = Math.round(reductionPct * 100);
  const responseReduction = Math.round(reductionPct * 75);
  return { newRisk, reductionPct: Math.round(reductionPct * 100), areaReduction, responseReduction };
}

export const ROOT_CAUSE_CHAINS = {
  PALDI: [
    { step: 1, event: 'Heavy Rainfall (76 mm/h)', type: 'trigger', icon: '🌧️' },
    { step: 2, event: 'Drain Capacity Exceeded', type: 'cascade', icon: '📊' },
    { step: 3, event: 'DRN-1047 Partially Blocked (78%)', type: 'infrastructure', icon: '🔧' },
    { step: 4, event: 'Water Accumulation in Low-lying Areas', type: 'flood', icon: '🌊' },
    { step: 5, event: 'SP Ring Road Waterlogging', type: 'impact', icon: '🛣️' },
    { step: 6, event: 'Traffic Disruption & Slowdown', type: 'impact', icon: '🚗' },
    { step: 7, event: 'Emergency Response Delay Risk', type: 'consequence', icon: '⚠️' },
  ],
  VASTRAPUR: [
    { step: 1, event: 'Rapid Rainfall Intensification (+32%)', type: 'trigger', icon: '🌧️' },
    { step: 2, event: 'DRN-2031 High Blockage Risk (65%)', type: 'infrastructure', icon: '🔧' },
    { step: 3, event: 'Residential Drainage Backflow', type: 'cascade', icon: '📊' },
    { step: 4, event: 'Low-lying Residential Flooding', type: 'flood', icon: '🌊' },
    { step: 5, event: 'Metro Access Road Risk', type: 'impact', icon: '🚇' },
  ],
  ADAJAN: [
    { step: 1, event: 'Extreme Rainfall (80 mm/h)', type: 'trigger', icon: '🌧️' },
    { step: 2, event: 'DRN-S1022 Critical Blockage (82%)', type: 'infrastructure', icon: '🔧' },
    { step: 3, event: 'Hospital Access Road Flooding', type: 'impact', icon: '🏥' },
    { step: 4, event: 'Emergency Vehicle Access Compromised', type: 'consequence', icon: '🚑' },
    { step: 5, event: 'Critical Infrastructure Risk Escalation', type: 'escalation', icon: '🚨' },
  ],
};
