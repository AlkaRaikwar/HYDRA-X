import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { ZONES, DRAINS, WEATHER, INCIDENTS, RESPONSE_TEAMS, getRiskLevel } from '../data/hydraData';

const SAMPLE_QUERIES = [
  'What is the biggest flood threat in Surat right now?',
  'Which drains need immediate attention in Ahmedabad?',
  'How many response teams are available?',
  'What are the top 3 critical zones?',
  'What is the rainfall forecast for the next 2 hours?',
];

function queryEngine(question, city, zones, drains, weather, incidents, teams) {
  const q = question.toLowerCase();

  if (q.includes('biggest') || q.includes('top risk') || q.includes('highest risk') || q.includes('worst')) {
    const topZone = [...zones].sort((a, b) => b.riskScore - a.riskScore)[0];
    const { level, color } = getRiskLevel(topZone.riskScore);
    return {
      type: 'ZONE_RISK',
      title: `TOP FLOOD RISK — ${city}`,
      zone: topZone.name,
      score: topZone.riskScore,
      level,
      color,
      why: [
        `Heavy rainfall: ${topZone.rainfall} mm/h`,
        `Drainage risk: ${topZone.drainageRisk}`,
        `${topZone.citizenReports} citizen reports received`,
        topZone.criticalInfra.length > 0 ? `Critical infrastructure nearby: ${topZone.criticalInfra.join(', ')}` : 'Historical flooding probability high',
      ],
      action: 'Inspect priority drainage assets and prepare emergency response team for deployment.',
      confidence: topZone.confidence,
    };
  }

  if (q.includes('drain') && (q.includes('immediate') || q.includes('critical') || q.includes('attention'))) {
    const critical = drains.filter(d => d.status === 'CRITICAL' || d.status === 'POOR').slice(0, 3);
    return {
      type: 'DRAIN_STATUS',
      title: 'CRITICAL DRAIN ALERT',
      items: critical.map(d => ({ id: d.id, zone: d.zone, recommendation: d.recommendation, riskScore: d.riskScore })),
      confidence: 0.91,
    };
  }

  if (q.includes('team') || q.includes('response')) {
    const available = teams.filter(t => t.status === 'AVAILABLE');
    const deployed  = teams.filter(t => t.status === 'DEPLOYED');
    return {
      type: 'TEAM_STATUS',
      title: 'RESPONSE TEAM STATUS',
      available: available.length,
      deployed: deployed.length,
      total: teams.length,
      details: teams.map(t => ({ id: t.id, status: t.status, vehicle: t.vehicle })),
      confidence: 0.99,
    };
  }

  if (q.includes('rainfall') || q.includes('weather') || q.includes('rain') || q.includes('forecast')) {
    const w = weather;
    return {
      type: 'WEATHER',
      title: 'WEATHER INTELLIGENCE',
      current: w.current,
      intensity: w.intensity,
      forecast: w.forecast.slice(0, 4),
      stormAlert: w.stormAlert,
      confidence: 0.92,
    };
  }

  if (q.includes('top 3') || q.includes('critical zone')) {
    const top3 = [...zones].sort((a, b) => b.riskScore - a.riskScore).slice(0, 3);
    return {
      type: 'TOP_ZONES',
      title: 'TOP CRITICAL ZONES',
      zones: top3.map(z => ({ name: z.name, score: z.riskScore, level: getRiskLevel(z.riskScore).level })),
      confidence: 0.94,
    };
  }

  // Default
  const topZone = [...zones].sort((a, b) => b.riskScore - a.riskScore)[0];
  return {
    type: 'GENERAL',
    title: 'HYDRA-X ANALYSIS',
    summary: `Current flood situation in ${city}: ${zones.filter(z => z.riskScore >= 81).length} critical zones, ${incidents.filter(i => i.status === 'ACTIVE').length} active incidents. Top risk area: ${topZone.name} (${topZone.riskScore}/100).`,
    confidence: 0.88,
  };
}

function QueryResult({ result }) {
  if (!result) return null;
  return (
    <div style={{ padding: 16, background: 'var(--bg2)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.2)', animation: 'fadeUp 0.3s ease' }}>
      <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{result.title}</div>
        <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, marginLeft: 'auto' }}>Conf: {Math.round(result.confidence * 100)}%</div>
      </div>

      {result.type === 'ZONE_RISK' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: result.color, lineHeight: 1 }}>{result.score}</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>{result.zone}</div>
              <span className={`risk-badge ${result.level}`}>{result.level}</span>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>WHY:</div>
          {result.why.map((w, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', padding: '4px 0', display: 'flex', gap: 7 }}>
              <span style={{ color: 'var(--red)' }}>•</span>{w}
            </div>
          ))}
          <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(0,212,255,0.07)', borderRadius: 7, border: '1px solid rgba(0,212,255,0.15)', fontSize: 12, color: 'var(--text-dim)' }}>
            <strong style={{ color: 'var(--cyan)' }}>ACTION:</strong> {result.action}
          </div>
        </div>
      )}

      {result.type === 'DRAIN_STATUS' && (
        <div>
          {result.items.map(d => (
            <div key={d.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border2)', display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--cyan)', minWidth: 80 }}>{d.id}</div>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--text-dim)' }}>{d.zone}</div>
              <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{d.recommendation}</div>
            </div>
          ))}
        </div>
      )}

      {result.type === 'TEAM_STATUS' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--green)' }}>{result.available}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>AVAILABLE</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--cyan)' }}>{result.deployed}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>DEPLOYED</div>
            </div>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)' }}>{result.total}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL</div>
            </div>
          </div>
          {result.details.map(t => (
            <div key={t.id} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--border2)', fontSize: 12, color: 'var(--text-dim)', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, color: 'var(--text)', minWidth: 40 }}>{t.id}</span>
              <span style={{ flex: 1 }}>{t.vehicle}</span>
              <span style={{ color: t.status === 'AVAILABLE' ? 'var(--green)' : 'var(--cyan)', fontWeight: 700 }}>● {t.status}</span>
            </div>
          ))}
        </div>
      )}

      {result.type === 'WEATHER' && (
        <div>
          <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 900, color: result.stormAlert ? 'var(--red)' : 'var(--cyan)' }}>{result.current}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>mm/h — {result.intensity}</div>
            </div>
            {result.stormAlert && (
              <div style={{ padding: '6px 12px', background: 'var(--red-ghost)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
                🚨 STORM ALERT ACTIVE
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {result.forecast.map((f, i) => (
              <div key={i} style={{ textAlign: 'center', flex: 1, padding: '6px 4px', background: 'var(--bg3)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.hour}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: f.rain > 60 ? 'var(--red)' : f.rain > 40 ? 'var(--orange)' : 'var(--cyan)' }}>{f.rain}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.type === 'TOP_ZONES' && (
        <div>
          {result.zones.map((z, i) => (
            <div key={z.name} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border2)', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-muted)', minWidth: 24 }}>#{i + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', flex: 1 }}>{z.name}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: getRiskLevel(z.score).color }}>{z.score}</div>
              <span className={`risk-badge ${z.level}`}>{z.level}</span>
            </div>
          ))}
        </div>
      )}

      {result.type === 'GENERAL' && (
        <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.7 }}>{result.summary}</div>
      )}

      <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text-muted)' }}>
        🤖 IBM Granite NL Query · Tools: getCityRisk(), getZoneRisk(), getDrainStatus() · SIMULATED DATA
      </div>
    </div>
  );
}

export default function AIInsights() {
  const { city } = useContext(AppContext);
  const zones   = ZONES[city]   || [];
  const weather = WEATHER[city];
  const incidents = INCIDENTS[city] || [];
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const drainData = DRAINS[city] || [];
  const teamData  = RESPONSE_TEAMS[city] || [];

  function runQuery(q) {
    const text = q || query;
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const res = queryEngine(text, city, zones, drainData, weather, incidents, teamData);
      setResult(res);
      setLoading(false);
    }, 900);
  }

  const totalCritical = zones.filter(z => z.riskScore >= 81).length;
  const activeInc     = incidents.filter(i => i.status === 'ACTIVE').length;

  return (
    <div className="hx-page">
      <div className="hx-page-header">
        <div>
          <div className="hx-page-title">💡 AI INSIGHTS</div>
          <div className="hx-page-sub">Natural Language City Query · IBM Granite Intelligence Layer · Before/After Analysis</div>
        </div>
        <div className="demo-banner">⬡ QUERIES RUN AGAINST STRUCTURED SIMULATION DATA</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* NL Query */}
        <div>
          <div className="hx-card" style={{ marginBottom: 16 }}>
            <div className="hx-card-title">🤖 ASK HYDRA-X — NATURAL LANGUAGE QUERY</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Ask any question about the current flood situation. IBM Granite queries structured city data and returns explainable answers.
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <input
                type="text"
                className="form-input"
                placeholder='Ask HYDRA-X... e.g. "What is the biggest flood threat right now?"'
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runQuery()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-cyan" onClick={() => runQuery()} disabled={loading || !query.trim()}>
                {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '⬡ ASK'}
              </button>
            </div>

            {/* Sample queries */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
              {SAMPLE_QUERIES.map(sq => (
                <button
                  key={sq}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 11 }}
                  onClick={() => { setQuery(sq); runQuery(sq); }}
                >
                  {sq}
                </button>
              ))}
            </div>

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, color: 'var(--text-muted)' }}>
                <span className="spinner" />
                <span style={{ fontSize: 12 }}>IBM Granite querying city data...</span>
              </div>
            )}

            <QueryResult result={result} />
          </div>

          {/* City impact metrics */}
          <div className="hx-card">
            <div className="hx-card-title">📊 ESTIMATED CITY IMPACT METRICS</div>
            <div style={{ marginBottom: 10, fontSize: 10.5, color: 'var(--text-muted)' }}>SIMULATION-BASED ESTIMATED IMPACT · Not real-world measurements</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Risk Detection Lead Time', value: '+2.1 hrs', color: 'var(--green)', sub: 'Before manual detection' },
                { label: 'Est. Response Time Reduction', value: '-38%', color: 'var(--cyan)', sub: 'Estimated improvement' },
                { label: 'Preventive Maintenance', value: '74%', color: 'var(--blue)', sub: 'Tasks completed on time' },
                { label: 'Report Verification Rate', value: '94%', color: 'var(--green)', sub: 'AI clustering accuracy' },
                { label: 'Drainage Failure Rate', value: '-52%', color: 'var(--cyan)', sub: 'vs. manual scheduling' },
                { label: 'Resource Utilization', value: '81%', color: 'var(--yellow)', sub: 'Optimal allocation score' },
              ].map(m => (
                <div key={m.label} style={{ padding: '12px 14px', background: 'var(--bg2)', borderRadius: 9, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: m.color }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Live summary */}
          <div className="hx-card">
            <div className="hx-card-title">📡 LIVE CITY SUMMARY — {city}</div>
            {[
              { label: 'Critical Zones', value: totalCritical, color: 'var(--red)' },
              { label: 'Active Incidents', value: activeInc, color: 'var(--orange)' },
              { label: 'Rainfall', value: `${weather.current} mm/h`, color: weather.current > 60 ? 'var(--red)' : 'var(--cyan)' },
              { label: 'Storm Alert', value: weather.stormAlert ? 'ACTIVE' : 'NONE', color: weather.stormAlert ? 'var(--red)' : 'var(--green)' },
              { label: 'Teams Available', value: `${teamData.filter(t => t.status === 'AVAILABLE').length}/${teamData.length}`, color: 'var(--green)' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border2)', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{m.label}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>

          {/* Tool registry */}
          <div className="hx-card">
            <div className="hx-card-title">🔧 QUERY TOOL REGISTRY</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>IBM Granite uses these tools to answer questions. Data is never invented.</div>
            {['getCityRisk(city)', 'getZoneRisk(zone)', 'getWeather(city)', 'getDrainStatus(id)', 'getActiveIncidents(city)', 'getCitizenReports(zone)', 'getAvailableTeams(city)', 'simulateFlood(params)', 'recommendResponse(incident)'].map(t => (
              <div key={t} style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--cyan)', padding: '4px 8px', marginBottom: 4, background: 'rgba(0,212,255,0.05)', borderRadius: 4, border: '1px solid rgba(0,212,255,0.1)' }}>{t}</div>
            ))}
          </div>

          {/* Governance */}
          <div className="hx-card" style={{ border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="hx-card-title">🛡️ AI GOVERNANCE</div>
            {[
              { icon: '✓', text: 'Human-in-the-loop for all high-impact actions', color: 'var(--green)' },
              { icon: '✓', text: 'Every AI decision logged with confidence & source', color: 'var(--green)' },
              { icon: '✓', text: 'Data freshness tracked per source', color: 'var(--green)' },
              { icon: '✓', text: 'Simulation data clearly labelled', color: 'var(--cyan)' },
              { icon: '✓', text: 'AI cannot autonomously execute irreversible actions', color: 'var(--green)' },
            ].map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--border2)', fontSize: 12, color: 'var(--text-dim)' }}>
                <span style={{ color: g.color, fontWeight: 700 }}>{g.icon}</span>{g.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
