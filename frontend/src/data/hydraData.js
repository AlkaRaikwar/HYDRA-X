/**
 * HYDRA-X — Seeded Demo Data
 * All data is SIMULATED / DEMONSTRATION data
 */

export const CITIES = {
  AHMEDABAD: {
    id: 'AHMEDABAD',
    name: 'Ahmedabad',
    center: { lat: 23.0225, lng: 72.5714 },
    population: 8058000,
  },
  SURAT: {
    id: 'SURAT',
    name: 'Surat',
    center: { lat: 21.1702, lng: 72.8311 },
    population: 6081322,
  },
};

export const ZONES = {
  AHMEDABAD: [
    { id: 'PALDI', name: 'Paldi', city: 'AHMEDABAD', lat: 23.0173, lng: 72.5693, riskScore: 87, prevRisk: 63, trend: 'RAPIDLY_INCREASING', confidence: 0.91, rainfall: 76, drainageRisk: 'HIGH', citizenReports: 4, criticalInfra: ['Hospital'], population: 84000, historicalFlooding: 0.78 },
    { id: 'VASTRAPUR', name: 'Vastrapur', city: 'AHMEDABAD', lat: 23.0469, lng: 72.5270, riskScore: 89, prevRisk: 61, trend: 'RAPIDLY_INCREASING', confidence: 0.93, rainfall: 82, drainageRisk: 'HIGH', citizenReports: 6, criticalInfra: ['Metro Station', 'Mall'], population: 120000, historicalFlooding: 0.71 },
    { id: 'MANINAGAR', name: 'Maninagar', city: 'AHMEDABAD', lat: 22.9948, lng: 72.6020, riskScore: 72, prevRisk: 55, trend: 'INCREASING', confidence: 0.86, rainfall: 68, drainageRisk: 'MODERATE', citizenReports: 3, criticalInfra: ['Railway Station'], population: 95000, historicalFlooding: 0.62 },
    { id: 'BOPAL', name: 'Bopal', city: 'AHMEDABAD', lat: 23.0340, lng: 72.4673, riskScore: 45, prevRisk: 38, trend: 'STABLE', confidence: 0.82, rainfall: 44, drainageRisk: 'LOW', citizenReports: 1, criticalInfra: [], population: 72000, historicalFlooding: 0.31 },
    { id: 'NAVRANGPURA', name: 'Navrangpura', city: 'AHMEDABAD', lat: 23.0395, lng: 72.5616, riskScore: 61, prevRisk: 48, trend: 'INCREASING', confidence: 0.88, rainfall: 60, drainageRisk: 'MODERATE', citizenReports: 2, criticalInfra: ['Police Station', 'School'], population: 110000, historicalFlooding: 0.55 },
  ],
  SURAT: [
    { id: 'ADAJAN', name: 'Adajan', city: 'SURAT', lat: 21.2098, lng: 72.8078, riskScore: 88, prevRisk: 65, trend: 'RAPIDLY_INCREASING', confidence: 0.92, rainfall: 80, drainageRisk: 'HIGH', citizenReports: 5, criticalInfra: ['Hospital', 'School'], population: 98000, historicalFlooding: 0.75 },
    { id: 'VESU', name: 'Vesu', city: 'SURAT', lat: 21.1572, lng: 72.7887, riskScore: 79, prevRisk: 52, trend: 'RAPIDLY_INCREASING', confidence: 0.89, rainfall: 74, drainageRisk: 'HIGH', citizenReports: 4, criticalInfra: ['Power Station'], population: 85000, historicalFlooding: 0.68 },
    { id: 'ATHWA', name: 'Athwa', city: 'SURAT', lat: 21.1812, lng: 72.8319, riskScore: 54, prevRisk: 45, trend: 'STABLE', confidence: 0.84, rainfall: 52, drainageRisk: 'MODERATE', citizenReports: 2, criticalInfra: ['Fire Station'], population: 75000, historicalFlooding: 0.42 },
    { id: 'VARACHHA', name: 'Varachha', city: 'SURAT', lat: 21.2074, lng: 72.8721, riskScore: 66, prevRisk: 58, trend: 'INCREASING', confidence: 0.87, rainfall: 62, drainageRisk: 'MODERATE', citizenReports: 3, criticalInfra: ['Railway Station'], population: 130000, historicalFlooding: 0.59 },
    { id: 'KATARGAM', name: 'Katargam', city: 'SURAT', lat: 21.2254, lng: 72.8467, riskScore: 42, prevRisk: 40, trend: 'STABLE', confidence: 0.80, rainfall: 41, drainageRisk: 'LOW', citizenReports: 1, criticalInfra: [], population: 88000, historicalFlooding: 0.28 },
  ],
};

export const DRAINS = {
  AHMEDABAD: [
    { id: 'DRN-1047', zone: 'PALDI', city: 'AHMEDABAD', capacity: 850, condition: 42, blockageProbability: 78, riskScore: 92, lastCleaned: '2024-06-12', cleaningFrequency: 30, historicalIncidents: 7, nearbyPopulation: 22000, status: 'CRITICAL', recommendation: 'CLEAN WITHIN 2 HOURS' },
    { id: 'DRN-2031', zone: 'VASTRAPUR', city: 'AHMEDABAD', capacity: 1200, condition: 58, blockageProbability: 65, riskScore: 84, lastCleaned: '2024-07-02', cleaningFrequency: 21, historicalIncidents: 4, nearbyPopulation: 31000, status: 'POOR', recommendation: 'CLEAN TODAY' },
    { id: 'DRN-3014', zone: 'MANINAGAR', city: 'AHMEDABAD', capacity: 950, condition: 67, blockageProbability: 52, riskScore: 73, lastCleaned: '2024-07-10', cleaningFrequency: 21, historicalIncidents: 3, nearbyPopulation: 18000, status: 'WARNING', recommendation: 'INSPECT THIS WEEK' },
    { id: 'DRN-4410', zone: 'NAVRANGPURA', city: 'AHMEDABAD', capacity: 780, condition: 71, blockageProbability: 44, riskScore: 61, lastCleaned: '2024-07-14', cleaningFrequency: 30, historicalIncidents: 2, nearbyPopulation: 25000, status: 'WARNING', recommendation: 'SCHEDULE CLEANING' },
    { id: 'DRN-5201', zone: 'BOPAL', city: 'AHMEDABAD', capacity: 600, condition: 85, blockageProbability: 22, riskScore: 31, lastCleaned: '2024-07-18', cleaningFrequency: 45, historicalIncidents: 1, nearbyPopulation: 12000, status: 'GOOD', recommendation: 'ROUTINE MAINTENANCE' },
  ],
  SURAT: [
    { id: 'DRN-S1022', zone: 'ADAJAN', city: 'SURAT', capacity: 900, condition: 39, blockageProbability: 82, riskScore: 94, lastCleaned: '2024-06-08', cleaningFrequency: 21, historicalIncidents: 9, nearbyPopulation: 28000, status: 'CRITICAL', recommendation: 'EMERGENCY CLEANING' },
    { id: 'DRN-S2047', zone: 'VESU', city: 'SURAT', capacity: 1100, condition: 51, blockageProbability: 71, riskScore: 81, lastCleaned: '2024-06-25', cleaningFrequency: 21, historicalIncidents: 5, nearbyPopulation: 22000, status: 'POOR', recommendation: 'CLEAN TODAY' },
    { id: 'DRN-S3088', zone: 'VARACHHA', city: 'SURAT', capacity: 750, condition: 63, blockageProbability: 58, riskScore: 68, lastCleaned: '2024-07-08', cleaningFrequency: 30, historicalIncidents: 3, nearbyPopulation: 19000, status: 'WARNING', recommendation: 'INSPECT' },
    { id: 'DRN-S4011', zone: 'ATHWA', city: 'SURAT', capacity: 820, condition: 76, blockageProbability: 35, riskScore: 45, lastCleaned: '2024-07-16', cleaningFrequency: 45, historicalIncidents: 1, nearbyPopulation: 14000, status: 'GOOD', recommendation: 'ROUTINE MAINTENANCE' },
  ],
};

export const INCIDENTS = {
  AHMEDABAD: [
    { id: 'INC-1024', zone: 'PALDI', city: 'AHMEDABAD', type: 'FLOODING', severity: 'CRITICAL', priorityScore: 96, status: 'ACTIVE', reportedAt: '2024-07-20T10:01:00Z', description: 'Major waterlogging on SP Ring Road near Paldi junction. 3 vehicles stranded.', teamAssigned: 'T-07', lat: 23.0160, lng: 72.5700, reportsCount: 7, verifiedReports: 5, timeline: [
      { time: '10:01', event: 'Citizen report received', type: 'report' },
      { time: '10:03', event: 'AI classified: FLOODING (94% confidence)', type: 'ai' },
      { time: '10:04', event: '3 duplicate reports clustered → INC-1024', type: 'ai' },
      { time: '10:05', event: 'Risk raised to CRITICAL (96/100)', type: 'risk' },
      { time: '10:06', event: 'Response Agent recommended T-07', type: 'ai' },
      { time: '10:08', event: 'Officer approved dispatch', type: 'approval' },
      { time: '10:19', event: 'Team T-07 arrived on site', type: 'response' },
    ]},
    { id: 'INC-1025', zone: 'VASTRAPUR', city: 'AHMEDABAD', type: 'DRAIN_BLOCKAGE', severity: 'HIGH', priorityScore: 84, status: 'ACTIVE', reportedAt: '2024-07-20T09:45:00Z', description: 'DRN-2031 showing blockage. Water backing up in Vastrapur residential.', teamAssigned: 'T-03', lat: 23.0460, lng: 72.5280, reportsCount: 4, verifiedReports: 3, timeline: [] },
    { id: 'INC-1026', zone: 'MANINAGAR', city: 'AHMEDABAD', type: 'WATERLOGGING', severity: 'MODERATE', priorityScore: 72, status: 'MONITORING', reportedAt: '2024-07-20T09:30:00Z', description: 'Road waterlogging near Maninagar underpass.', teamAssigned: null, lat: 22.9940, lng: 72.6030, reportsCount: 3, verifiedReports: 2, timeline: [] },
  ],
  SURAT: [
    { id: 'INC-2047', zone: 'ADAJAN', city: 'SURAT', type: 'FLOODING', severity: 'CRITICAL', priorityScore: 94, status: 'ACTIVE', reportedAt: '2024-07-20T10:05:00Z', description: 'Severe flooding near Adajan Patiya. Hospital access road blocked.', teamAssigned: 'T-03', lat: 21.2090, lng: 72.8085, reportsCount: 9, verifiedReports: 7, timeline: [] },
    { id: 'INC-2048', zone: 'VESU', city: 'SURAT', type: 'DRAIN_BLOCKAGE', severity: 'HIGH', priorityScore: 79, status: 'ACTIVE', reportedAt: '2024-07-20T09:55:00Z', description: 'DRN-S2047 critically blocked. Vesu residential flooding imminent.', teamAssigned: 'T-01', lat: 21.1568, lng: 72.7895, reportsCount: 5, verifiedReports: 4, timeline: [] },
  ],
};

export const CITIZEN_REPORTS = [
  { id: 'RPT-101', zone: 'PALDI', city: 'AHMEDABAD', type: 'FLOODING', severity: 'HIGH', description: 'Water knee deep on main road, cars stuck', confidence: 0.92, timestamp: '2024-07-20T09:58:00Z', status: 'VERIFIED', clusteredTo: 'INC-1024', lat: 23.016, lng: 72.570 },
  { id: 'RPT-102', zone: 'PALDI', city: 'AHMEDABAD', type: 'FLOODING', severity: 'HIGH', description: 'Same flood at Paldi - cant drive', confidence: 0.87, timestamp: '2024-07-20T10:00:00Z', status: 'VERIFIED', clusteredTo: 'INC-1024', lat: 23.0162, lng: 72.5698 },
  { id: 'RPT-103', zone: 'VASTRAPUR', city: 'AHMEDABAD', type: 'BLOCKED_DRAIN', severity: 'MODERATE', description: 'Drain overflowing near my apartment', confidence: 0.88, timestamp: '2024-07-20T09:43:00Z', status: 'VERIFIED', clusteredTo: 'INC-1025', lat: 23.046, lng: 72.528 },
  { id: 'RPT-104', zone: 'PALDI', city: 'AHMEDABAD', type: 'ROAD_DAMAGE', severity: 'MODERATE', description: 'Big pothole formed due to waterlogging', confidence: 0.75, timestamp: '2024-07-20T10:04:00Z', status: 'PENDING', clusteredTo: null, lat: 23.0155, lng: 72.5710 },
  { id: 'RPT-105', zone: 'ADAJAN', city: 'SURAT', type: 'FLOODING', severity: 'CRITICAL', description: 'Hospital road completely flooded 2 feet water', confidence: 0.95, timestamp: '2024-07-20T10:03:00Z', status: 'VERIFIED', clusteredTo: 'INC-2047', lat: 21.2092, lng: 72.8083 },
  { id: 'RPT-106', zone: 'ADAJAN', city: 'SURAT', type: 'FLOODING', severity: 'CRITICAL', description: 'Can\'t reach hospital road blocked by flood', confidence: 0.91, timestamp: '2024-07-20T10:04:00Z', status: 'VERIFIED', clusteredTo: 'INC-2047', lat: 21.2088, lng: 72.8079 },
  { id: 'RPT-107', zone: 'VESU', city: 'SURAT', type: 'BLOCKED_DRAIN', severity: 'HIGH', description: 'Drain blocked near Vesu circle', confidence: 0.83, timestamp: '2024-07-20T09:52:00Z', status: 'VERIFIED', clusteredTo: 'INC-2048', lat: 21.157, lng: 72.789 },
];

export const RESPONSE_TEAMS = {
  AHMEDABAD: [
    { id: 'T-01', name: 'Team Alpha', city: 'AHMEDABAD', status: 'AVAILABLE', members: 4, vehicle: 'Water Pump Truck', equipment: ['High-power pump', 'Barriers', 'Safety gear'], lat: 23.029, lng: 72.575, assignedTo: null },
    { id: 'T-03', name: 'Team Gamma', city: 'AHMEDABAD', status: 'DEPLOYED', members: 5, vehicle: 'Drainage Van', equipment: ['Drain cleaning equipment', 'Camera probe', 'Pumps'], lat: 23.046, lng: 72.527, assignedTo: 'INC-1025' },
    { id: 'T-05', name: 'Team Epsilon', city: 'AHMEDABAD', status: 'AVAILABLE', members: 3, vehicle: 'Emergency Response', equipment: ['Rescue gear', 'Pumps', 'Communication'], lat: 23.002, lng: 72.596, assignedTo: null },
    { id: 'T-07', name: 'Team Eta', city: 'AHMEDABAD', status: 'DEPLOYED', members: 6, vehicle: 'Heavy Pump Truck', equipment: ['Industrial pump', 'Traffic barriers', 'Dewatering equipment'], lat: 23.017, lng: 72.570, assignedTo: 'INC-1024' },
  ],
  SURAT: [
    { id: 'T-01', name: 'Team Alpha', city: 'SURAT', status: 'DEPLOYED', members: 5, vehicle: 'Water Pump Truck', equipment: ['High-power pump', 'Barriers', 'Safety gear'], lat: 21.209, lng: 72.808, assignedTo: 'INC-2048' },
    { id: 'T-03', name: 'Team Gamma', city: 'SURAT', status: 'DEPLOYED', members: 4, vehicle: 'Emergency Response', equipment: ['Rescue gear', 'Communication', 'Pumps'], lat: 21.210, lng: 72.808, assignedTo: 'INC-2047' },
    { id: 'T-05', name: 'Team Epsilon', city: 'SURAT', status: 'AVAILABLE', members: 3, vehicle: 'Drainage Van', equipment: ['Drain equipment', 'Camera probe'], lat: 21.182, lng: 72.832, assignedTo: null },
  ],
};

export const WEATHER = {
  AHMEDABAD: { current: 76, intensity: 'HEAVY', humidity: 94, windSpeed: 22, temperature: 26, forecast: [{ hour: '08:00', rain: 18 }, { hour: '09:00', rain: 35 }, { hour: '10:00', rain: 58 }, { hour: '11:00', rain: 76 }, { hour: '12:00', rain: 82 }, { hour: '13:00', rain: 71 }, { hour: '14:00', rain: 55 }, { hour: '15:00', rain: 38 }], stormAlert: true },
  SURAT: { current: 80, intensity: 'HEAVY', humidity: 96, windSpeed: 28, temperature: 27, forecast: [{ hour: '08:00', rain: 22 }, { hour: '09:00', rain: 41 }, { hour: '10:00', rain: 65 }, { hour: '11:00', rain: 80 }, { hour: '12:00', rain: 88 }, { hour: '13:00', rain: 76 }, { hour: '14:00', rain: 60 }, { hour: '15:00', rain: 42 }], stormAlert: true },
};

export const SENSORS = {
  AHMEDABAD: [
    { id: 'RG-104', type: 'RAIN_GAUGE', zone: 'PALDI', rainfall: 72, waterLevel: 82, status: 'WARNING', lat: 23.017, lng: 72.569 },
    { id: 'RG-201', type: 'RAIN_GAUGE', zone: 'VASTRAPUR', rainfall: 81, waterLevel: 88, status: 'CRITICAL', lat: 23.047, lng: 72.527 },
    { id: 'WL-305', type: 'WATER_LEVEL', zone: 'MANINAGAR', rainfall: 65, waterLevel: 71, status: 'WARNING', lat: 22.995, lng: 72.602 },
    { id: 'DF-412', type: 'DRAIN_FLOW', zone: 'NAVRANGPURA', rainfall: 58, waterLevel: 64, status: 'MODERATE', lat: 23.039, lng: 72.561 },
  ],
  SURAT: [
    { id: 'RG-S101', type: 'RAIN_GAUGE', zone: 'ADAJAN', rainfall: 79, waterLevel: 91, status: 'CRITICAL', lat: 21.210, lng: 72.808 },
    { id: 'RG-S202', type: 'RAIN_GAUGE', zone: 'VESU', rainfall: 73, waterLevel: 84, status: 'CRITICAL', lat: 21.157, lng: 72.789 },
    { id: 'WL-S303', type: 'WATER_LEVEL', zone: 'VARACHHA', rainfall: 60, waterLevel: 67, status: 'WARNING', lat: 21.207, lng: 72.872 },
  ],
};

export const CRITICAL_INFRASTRUCTURE = {
  AHMEDABAD: [
    { id: 'CI-001', type: 'HOSPITAL', name: 'Civil Hospital', zone: 'PALDI', lat: 23.0197, lng: 72.5661 },
    { id: 'CI-002', type: 'RAILWAY', name: 'Maninagar Station', zone: 'MANINAGAR', lat: 22.9970, lng: 72.6040 },
    { id: 'CI-003', type: 'METRO', name: 'Vastrapur Metro', zone: 'VASTRAPUR', lat: 23.0455, lng: 72.5265 },
    { id: 'CI-004', type: 'POLICE', name: 'Navrangpura Police', zone: 'NAVRANGPURA', lat: 23.0405, lng: 72.5625 },
    { id: 'CI-005', type: 'SCHOOL', name: 'Navrangpura School', zone: 'NAVRANGPURA', lat: 23.038, lng: 72.560 },
  ],
  SURAT: [
    { id: 'CI-S001', type: 'HOSPITAL', name: 'New Civil Hospital', zone: 'ADAJAN', lat: 21.2110, lng: 72.8065 },
    { id: 'CI-S002', type: 'POWER', name: 'Vesu Power Station', zone: 'VESU', lat: 21.1558, lng: 72.7875 },
    { id: 'CI-S003', type: 'FIRE', name: 'Athwa Fire Station', zone: 'ATHWA', lat: 21.1825, lng: 72.8330 },
    { id: 'CI-S004', type: 'RAILWAY', name: 'Surat Railway Station', zone: 'VARACHHA', lat: 21.2080, lng: 72.8725 },
  ],
};

export const AGENTS = [
  { id: 'ORCHESTRATOR', name: 'Urban Flood Orchestrator', role: 'Central Intelligence', status: 'ONLINE', confidence: 0.94, lastRun: '30s ago', mission: 'Coordinate all specialized agents to deliver unified flood response intelligence', tasks: 12, toolCalls: 47, icon: '🧠' },
  { id: 'FLOOD_RISK', name: 'Flood Risk Prediction', role: 'Risk Engine', status: 'PROCESSING', confidence: 0.91, lastRun: '12s ago', mission: 'Predict flood risk scores for all zones using numerical models + historical data', tasks: 8, toolCalls: 23, icon: '🌊' },
  { id: 'DRAINAGE', name: 'Drainage Intelligence', role: 'Infrastructure Monitor', status: 'ONLINE', confidence: 0.88, lastRun: '45s ago', mission: 'Monitor drain health, predict blockages, schedule maintenance', tasks: 6, toolCalls: 18, icon: '🔧' },
  { id: 'WEATHER', name: 'Weather Intelligence', role: 'Meteorological AI', status: 'ONLINE', confidence: 0.92, lastRun: '15s ago', mission: 'Ingest and forecast rainfall events, issue storm alerts', tasks: 5, toolCalls: 14, icon: '🌧️' },
  { id: 'CITIZEN', name: 'Citizen Report Intelligence', role: 'Signal Processor', status: 'PROCESSING', confidence: 0.87, lastRun: '8s ago', mission: 'Verify citizen reports, cluster duplicates, extract field intelligence', tasks: 7, toolCalls: 31, icon: '👥' },
  { id: 'RESPONSE', name: 'Civic Response Agent', role: 'Resource Coordinator', status: 'ONLINE', confidence: 0.90, lastRun: '22s ago', mission: 'Optimize team dispatch, route planning, and resource allocation', tasks: 9, toolCalls: 19, icon: '🚨' },
  { id: 'RESOURCE', name: 'Resource Optimization', role: 'Allocation AI', status: 'WAITING', confidence: 0.85, lastRun: '2m ago', mission: 'Balance resource constraints across simultaneous incidents', tasks: 4, toolCalls: 11, icon: '⚙️' },
  { id: 'DAMAGE', name: 'Damage Assessment', role: 'Impact Analyst', status: 'WAITING', confidence: 0.83, lastRun: '5m ago', mission: 'Assess post-flood damage, prioritize infrastructure repairs', tasks: 3, toolCalls: 8, icon: '🏗️' },
  { id: 'RESILIENCE', name: 'Urban Resilience Analyst', role: 'Post-Event Learning', status: 'WAITING', confidence: 0.86, lastRun: '10m ago', mission: 'Calculate city resilience score, derive improvement recommendations', tasks: 2, toolCalls: 6, icon: '📊' },
  { id: 'GOVERNANCE', name: 'Safety & Governance', role: 'Compliance Monitor', status: 'ONLINE', confidence: 0.96, lastRun: '1m ago', mission: 'Ensure human-in-the-loop, audit all AI decisions, enforce safety policies', tasks: 11, toolCalls: 22, icon: '🛡️' },
];

export const PENDING_APPROVALS = [
  { id: 'APR-001', type: 'ROAD_CLOSURE', zone: 'PALDI', city: 'AHMEDABAD', description: 'Temporarily close SP Ring Road near Paldi junction', reason: 'Predicted flood depth exceeds 0.4m safety threshold', confidence: 0.93, raisedAt: '2024-07-20T10:06:00Z', status: 'PENDING', team: 'T-07', alternative: 'Place temporary barriers only' },
  { id: 'APR-002', type: 'RESOURCE_REQUEST', zone: 'ADAJAN', city: 'SURAT', description: 'Request 2 additional pump trucks from Surat North depot', reason: 'Current resources insufficient for 3 simultaneous critical incidents', confidence: 0.89, raisedAt: '2024-07-20T10:08:00Z', status: 'PENDING', team: null, alternative: 'Prioritize INC-2047 only' },
  { id: 'APR-003', type: 'EVACUATION_ADVISORY', zone: 'VASTRAPUR', city: 'AHMEDABAD', description: 'Issue precautionary evacuation advisory for low-lying areas', reason: 'Risk projected to exceed 90/100 within 45 minutes', confidence: 0.86, raisedAt: '2024-07-20T10:10:00Z', status: 'PENDING', team: null, alternative: 'Issue shelter-in-place advisory' },
];

export const RISK_TIMELINE = {
  PALDI: [
    { time: '08:00', risk: 38, rainfall: 18 }, { time: '09:00', risk: 52, rainfall: 35 },
    { time: '10:00', risk: 63, rainfall: 58 }, { time: '11:00', risk: 87, rainfall: 76 },
    { time: '12:00', risk: 91, rainfall: 82 }, { time: '13:00', risk: 85, rainfall: 71 },
    { time: '14:00', risk: 74, rainfall: 55 }, { time: '15:00', risk: 58, rainfall: 38 },
  ],
  VASTRAPUR: [
    { time: '08:00', risk: 35, rainfall: 18 }, { time: '09:00', risk: 48, rainfall: 35 },
    { time: '10:00', risk: 61, rainfall: 58 }, { time: '11:00', risk: 89, rainfall: 82 },
    { time: '12:00', risk: 94, rainfall: 88 }, { time: '13:00', risk: 88, rainfall: 76 },
    { time: '14:00', risk: 76, rainfall: 60 }, { time: '15:00', risk: 62, rainfall: 42 },
  ],
  MANINAGAR: [
    { time: '08:00', risk: 28, rainfall: 14 }, { time: '09:00', risk: 42, rainfall: 28 },
    { time: '10:00', risk: 55, rainfall: 48 }, { time: '11:00', risk: 72, rainfall: 68 },
    { time: '12:00', risk: 78, rainfall: 74 }, { time: '13:00', risk: 71, rainfall: 65 },
    { time: '14:00', risk: 61, rainfall: 48 }, { time: '15:00', risk: 49, rainfall: 33 },
  ],
  ADAJAN: [
    { time: '08:00', risk: 40, rainfall: 22 }, { time: '09:00', risk: 55, rainfall: 41 },
    { time: '10:00', risk: 65, rainfall: 65 }, { time: '11:00', risk: 88, rainfall: 80 },
    { time: '12:00', risk: 93, rainfall: 88 }, { time: '13:00', risk: 87, rainfall: 76 },
    { time: '14:00', risk: 77, rainfall: 60 }, { time: '15:00', risk: 60, rainfall: 42 },
  ],
};

export function getRiskLevel(score) {
  if (score >= 81) return { level: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
  if (score >= 61) return { level: 'HIGH', color: '#f97316', bg: 'rgba(249,115,22,0.15)' };
  if (score >= 41) return { level: 'ELEVATED', color: '#eab308', bg: 'rgba(234,179,8,0.15)' };
  if (score >= 21) return { level: 'MODERATE', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
  return { level: 'LOW', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' };
}

export function getTrendIcon(trend) {
  if (trend === 'RAPIDLY_INCREASING') return '⬆️⬆️';
  if (trend === 'INCREASING') return '⬆️';
  if (trend === 'STABLE') return '➡️';
  if (trend === 'DECREASING') return '⬇️';
  return '➡️';
}
