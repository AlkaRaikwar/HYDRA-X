import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { AGENTS } from '../data/hydraData';

const ORCHESTRATOR = AGENTS[0];
const SPECIALIZED = AGENTS.slice(1);

const AGENT_FLOW = [
  { label: 'EVENT', color: 'var(--orange)', icon: '⚡' },
  { label: 'ORCHESTRATOR', color: 'var(--cyan)', icon: '🧠' },
  { label: 'AGENTS', color: 'var(--blue)', icon: '⚙️' },
  { label: 'TOOLS', color: '#a78bfa', icon: '🔧' },
  { label: 'DECISION', color: 'var(--yellow)', icon: '📊' },
  { label: 'APPROVAL', color: 'var(--orange)', icon: '👤' },
  { label: 'ACTION', color: 'var(--green)', icon: '🚨' },
];

function ConfBar({ val, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: 'var(--bg3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${val * 100}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 11, color, fontWeight: 700, minWidth: 34 }}>{Math.round(val * 100)}%</span>
    </div>
  );
}

function AgentCard({ agent, isSelected, onClick }) {
  const confColor =
    agent.confidence >= 0.9 ? 'var(--green)' :
    agent.confidence >= 0.8 ? 'var(--cyan)' : 'var(--yellow)';

  return (
    <div
      className={`agent-card ${agent.status}`}
      style={{ cursor: 'pointer', border: isSelected ? '1px solid var(--cyan)' : undefined, boxShadow: isSelected ? '0 0 12px rgba(0,212,255,0.15)' : undefined }}
      onClick={onClick}
    >
      <div className={`agent-status-bar ${agent.status}`} />
      <div className="agent-icon">{agent.icon}</div>
      <div className="agent-name">{agent.name}</div>
      <div className="agent-role">{agent.role}</div>
      <div className={`agent-badge ${agent.status}`}>{agent.status}</div>
      <ConfBar val={agent.confidence} color={confColor} />
      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <div className="agent-metric">
          <span className="agent-metric-label">Tasks</span>
          <span className="agent-metric-value">{agent.tasks}</span>
        </div>
        <div className="agent-metric">
          <span className="agent-metric-label">Tools</span>
          <span className="agent-metric-value">{agent.toolCalls}</span>
        </div>
        <div className="agent-metric" style={{ gridColumn: '1/-1' }}>
          <span className="agent-metric-label">Last run</span>
          <span className="agent-metric-value">{agent.lastRun}</span>
        </div>
      </div>
    </div>
  );
}

const AGENT_TOOLS = {
  FLOOD_RISK: ['getZoneRisk()', 'getRainfallData()', 'getHistoricalIncidents()', 'computeRiskScore()', 'getCitizenReports()'],
  DRAINAGE: ['getDrainStatus()', 'getBlockageProbability()', 'getMaintenanceHistory()', 'createMaintenanceTask()', 'prioritizeDrains()'],
  WEATHER: ['getCurrentRainfall()', 'getWeatherForecast()', 'detectStormSystem()', 'getRainfallIntensity()'],
  CITIZEN: ['getCitizenReports()', 'clusterReports()', 'classifyReport()', 'detectDuplicates()', 'computeReportConfidence()'],
  RESPONSE: ['getAvailableTeams()', 'getNearestTeam()', 'optimizeRoute()', 'recommendDispatch()', 'estimateArrivalTime()'],
  RESOURCE: ['getResourceInventory()', 'allocateResources()', 'identifyShortages()', 'requestExternalResources()'],
  DAMAGE: ['getDamageReports()', 'analyzeInfrastructure()', 'prioritizeRepairs()', 'estimateDamageCost()'],
  RESILIENCE: ['computeResilienceScore()', 'generateImprovementPlan()', 'benchmarkMetrics()'],
  GOVERNANCE: ['auditDecision()', 'validateAction()', 'logApproval()', 'enforcePolicy()', 'generateAuditTrail()'],
};

const SAMPLE_OUTPUT = {
  FLOOD_RISK: {
    label: 'Latest Output',
    json: JSON.stringify({ zone: 'Paldi', riskScore: 87, riskLevel: 'CRITICAL', forecastWindow: '0-2 hours', confidence: 0.91, drivers: ['rainfall+76mm/h', 'DRN-1047 blocked', '4 citizen reports'] }, null, 2),
  },
  DRAINAGE: {
    label: 'Latest Output',
    json: JSON.stringify({ drain: 'DRN-1047', health: 42, blockageProbability: 0.78, recommendation: 'CLEAN WITHIN 2 HOURS', priority: 1 }, null, 2),
  },
  WEATHER: {
    label: 'Latest Output',
    json: JSON.stringify({ current: 76, intensity: 'HEAVY', forecast12h: 82, stormAlert: true, trend: 'INTENSIFYING' }, null, 2),
  },
  CITIZEN: {
    label: 'Latest Output',
    json: JSON.stringify({ totalReports: 17, verifiedIncidents: 7, clusteringConfidence: 0.94, topCluster: 'INC-1024 (7 reports)' }, null, 2),
  },
  RESPONSE: {
    label: 'Latest Dispatch',
    json: JSON.stringify({ recommendation: 'Dispatch T-07 to Paldi', teamId: 'T-07', distance: '2.8km', eta: '11 min', confidence: 0.91, alternative: 'T-03 at 4.6km' }, null, 2),
  },
  RESOURCE: {
    label: 'Allocation Plan',
    json: JSON.stringify({ T01: 'Paldi', T03: 'Adajan', T07: 'Vesu', uncoveredIncidents: 4, recommendation: 'Request 2 external units' }, null, 2),
  },
  DAMAGE: {
    label: 'Assessment',
    json: JSON.stringify({ zones: ['Paldi', 'Adajan'], severity: 'HIGH', estimatedCost: '₹7.0L', priorityRepairs: ['DRN-1047', 'SP Ring Road'] }, null, 2),
  },
  RESILIENCE: {
    label: 'Resilience Score',
    json: JSON.stringify({ city: 'Ahmedabad', score: 74, drainage: 68, response: 82, infrastructure: 71, preparedness: 65 }, null, 2),
  },
  GOVERNANCE: {
    label: 'Audit Entry',
    json: JSON.stringify({ action: 'ROAD_CLOSURE', actor: 'Officer Joshi', aiConf: 0.93, status: 'APPROVED', timestamp: '2024-07-20T10:08Z' }, null, 2),
  },
};

export default function AIAgentsPage() {
  const { showToast } = useContext(AppContext);
  const [selected, setSelected] = useState('FLOOD_RISK');
  const [runningAll, setRunningAll] = useState(false);
  const [agentStates, setAgentStates] = useState({});

  const selectedAgent = AGENTS.find(a => a.id === selected) || SPECIALIZED[0];

  function runAllAgents() {
    setRunningAll(true);
    const order = SPECIALIZED.map(a => a.id);
    order.forEach((id, i) => {
      setTimeout(() => {
        setAgentStates(prev => ({ ...prev, [id]: 'PROCESSING' }));
        setTimeout(() => {
          setAgentStates(prev => ({ ...prev, [id]: 'COMPLETED' }));
          if (i === order.length - 1) {
            setRunningAll(false);
            showToast('✓ All agents completed analysis cycle', 'success');
          }
        }, 1800);
      }, i * 900);
    });
  }

  const tools = AGENT_TOOLS[selected] || [];
  const output = SAMPLE_OUTPUT[selected];

  return (
    <div className="hx-page">
      {/* Header */}
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">🤖 AI AGENTS — MULTI-AGENT SYSTEM</div>
          <div className="hx-page-sub">Urban Flood Orchestrator + 9 Specialized Agents · IBM Granite Reasoning Layer</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="demo-banner">⬡ SIMULATED AGENT RUNS</div>
          <button
            className="btn btn-cyan"
            onClick={runAllAgents}
            disabled={runningAll}
          >
            {runningAll ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Running...</> : '▶ RUN ALL AGENTS'}
          </button>
        </div>
      </div>

      {/* Architecture Flow */}
      <div className="hx-card mb-4" style={{ marginBottom: 16 }}>
        <div className="hx-card-title">⚡ AGENT ORCHESTRATION FLOW</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', padding: '8px 0' }}>
          {AGENT_FLOW.map((node, i) => (
            <React.Fragment key={node.label}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: `${node.color}18`, border: `1px solid ${node.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>
                  {node.icon}
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, color: node.color, letterSpacing: '0.06em', textAlign: 'center' }}>{node.label}</span>
              </div>
              {i < AGENT_FLOW.length - 1 && (
                <div style={{ flex: 1, height: 1, background: 'var(--border)', minWidth: 20, maxWidth: 60, marginBottom: 18 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Orchestrator */}
      <div className="hx-card mb-4" style={{ marginBottom: 16, border: '1px solid rgba(0,212,255,0.3)', background: 'linear-gradient(135deg, var(--surface), rgba(0,212,255,0.04))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 32 }}>{ORCHESTRATOR.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--cyan)', letterSpacing: 1 }}>URBAN FLOOD ORCHESTRATOR</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Central Intelligence · Coordinates all specialized agents</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="agent-badge ONLINE">● ONLINE</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Confidence</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--cyan)' }}>94%</div>
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-dim)', lineHeight: 1.6, maxWidth: 700 }}>
          {ORCHESTRATOR.mission}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 14 }}>
          {[
            { label: 'Active Tasks', value: ORCHESTRATOR.tasks },
            { label: 'Tool Calls', value: ORCHESTRATOR.toolCalls },
            { label: 'Last Run', value: ORCHESTRATOR.lastRun },
            { label: 'Agents Managed', value: 9 },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--bg2)', borderRadius: 7, padding: '10px 14px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--cyan)' }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialized Agents Grid + Detail */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr) 340px', gap: 16 }}>
        {/* Agents Grid (3 cols) */}
        <div style={{ gridColumn: '1 / 4', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {SPECIALIZED.map(agent => (
            <AgentCard
              key={agent.id}
              agent={{ ...agent, status: agentStates[agent.id] || agent.status }}
              isSelected={selected === agent.id}
              onClick={() => setSelected(agent.id)}
            />
          ))}
        </div>

        {/* Detail Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Agent detail */}
          <div className="hx-card" style={{ border: '1px solid rgba(0,212,255,0.25)' }}>
            <div className="hx-card-title">⚙ AGENT DETAIL</div>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{selectedAgent.icon}</div>
            <div style={{ fontSize: 13.5, fontWeight: 900, color: 'var(--text)', marginBottom: 4 }}>{selectedAgent.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>{selectedAgent.role}</div>
            <div className={`agent-badge ${agentStates[selectedAgent.id] || selectedAgent.status}`} style={{ marginBottom: 12 }}>
              {agentStates[selectedAgent.id] || selectedAgent.status}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: 12 }}>{selectedAgent.mission}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>TOOL REGISTRY</div>
            {tools.map(t => (
              <div key={t} style={{
                fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--cyan)', padding: '4px 8px', marginBottom: 4,
                background: 'rgba(0,212,255,0.06)', borderRadius: 4,
                border: '1px solid rgba(0,212,255,0.12)',
              }}>{t}</div>
            ))}
          </div>

          {/* Sample output */}
          {output && (
            <div className="hx-card">
              <div className="hx-card-title">📤 {output.label.toUpperCase()}</div>
              <pre style={{
                fontSize: 10.5, fontFamily: "'JetBrains Mono', monospace",
                color: 'var(--text-dim)', background: 'var(--bg)',
                padding: 10, borderRadius: 6, overflow: 'auto',
                border: '1px solid var(--border)', maxHeight: 200,
                lineHeight: 1.6,
              }}>{output.json}</pre>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    showToast(`${selectedAgent.name} triggered manually`, 'info');
                  }}
                >▶ RUN AGENT</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* IBM Architecture */}
      <div className="hx-card" style={{ marginTop: 16 }}>
        <div className="hx-card-title">🏗️ IBM TECHNOLOGY ARCHITECTURE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative' }}>
          {[
            { layer: 'APPLICATION', desc: 'HYDRA-X React UI', color: 'var(--cyan)', icon: '💻' },
            { layer: 'ORCHESTRATOR', desc: 'Urban Flood Orchestrator', color: 'var(--blue)', icon: '🧠' },
            { layer: 'IBM GRANITE', desc: 'watsonx.ai · Reasoning', color: '#7c3aed', icon: '⬡' },
            { layer: 'RISK ENGINE', desc: 'Numerical + GIS + ML', color: 'var(--orange)', icon: '📊' },
            { layer: 'HUMAN LOOP', desc: 'Officer Approval Gateway', color: 'var(--green)', icon: '👤' },
          ].map((item, i) => (
            <div key={item.layer} style={{
              padding: '16px 12px',
              textAlign: 'center',
              borderRight: i < 4 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: item.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{item.layer}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          {['IBM Granite 3.3', 'IBM watsonx.ai', 'IBM Cloud', 'IBM Bob'].map(badge => (
            <div key={badge} className="ibm-badge">⬡ {badge}</div>
          ))}
        </div>
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg2)', borderRadius: 7, fontSize: 11.5, color: 'var(--text-muted)', border: '1px solid var(--border)', textAlign: 'center' }}>
          🛡️ <strong style={{ color: 'var(--text-dim)' }}>AI Governance:</strong> AI provides decision support. All high-impact public-safety actions require human officer approval before execution.
        </div>
      </div>
    </div>
  );
}
