import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── tiny animated counter ───────────────────────────────────── */
function Counter({ to, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = null;
      const step = ts => {
        if (!start) start = ts;
        const pct = Math.min((ts - start) / duration, 1);
        setVal(Math.floor(pct * to));
        if (pct < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ── logo svg ─────────────────────────────────────────────────── */
function LogoSVG({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="4" fill="#00d4ff" opacity="0.95" />
      <line x1="16" y1="12" x2="16" y2="4"  stroke="#00d4ff" strokeWidth="1.4" opacity="0.6" />
      <line x1="16" y1="20" x2="16" y2="28" stroke="#00d4ff" strokeWidth="1.4" opacity="0.6" />
      <line x1="12" y1="14" x2="5"  y2="9"  stroke="#00d4ff" strokeWidth="1.4" opacity="0.6" />
      <line x1="20" y1="14" x2="27" y2="9"  stroke="#00d4ff" strokeWidth="1.4" opacity="0.6" />
      <line x1="12" y1="18" x2="5"  y2="23" stroke="#3b82f6" strokeWidth="1.4" opacity="0.5" />
      <line x1="20" y1="18" x2="27" y2="23" stroke="#3b82f6" strokeWidth="1.4" opacity="0.5" />
      <circle cx="16" cy="4"  r="2.5" fill="#3b82f6" opacity="0.85" />
      <circle cx="16" cy="28" r="2.5" fill="#3b82f6" opacity="0.85" />
      <circle cx="5"  cy="9"  r="2.5" fill="#00d4ff" opacity="0.75" />
      <circle cx="27" cy="9"  r="2.5" fill="#00d4ff" opacity="0.75" />
      <circle cx="5"  cy="23" r="2"   fill="#3b82f6" opacity="0.55" />
      <circle cx="27" cy="23" r="2"   fill="#3b82f6" opacity="0.55" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#070d1a', color: '#e8f4ff', fontFamily: "'Inter', sans-serif", overflowX: 'hidden' }}>

      {/* ── HEADER ──────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 999,
        background: 'rgba(7,13,26,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        padding: '0 5%',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoSVG size={32} />
          <div>
            <div style={{
              fontSize: 18, fontWeight: 900, letterSpacing: 3,
              background: 'linear-gradient(90deg,#00d4ff,#3b82f6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>HYDRA-X</div>
            <div style={{ fontSize: 8, letterSpacing: 2, color: 'rgba(232,244,255,0.35)', fontWeight: 600, textTransform: 'uppercase' }}>
              Flood Intelligence
            </div>
          </div>
        </div>

        {/* Desktop nav links */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="lp-desktop-nav">
          {[['Features', '#features'], ['How It Works', '#how'], ['Impact', '#impact'], ['Technology', '#tech']].map(([label, href]) => (
            <a key={label} href={href} style={{
              padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
              color: 'rgba(232,244,255,0.65)', textDecoration: 'none',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.target.style.color = '#00d4ff'; e.target.style.background = 'rgba(0,212,255,0.07)'; }}
              onMouseLeave={e => { e.target.style.color = 'rgba(232,244,255,0.65)'; e.target.style.background = 'transparent'; }}
            >{label}</a>
          ))}
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            padding: '4px 10px', borderRadius: 5, fontSize: 10.5, fontWeight: 700,
            background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', color: '#eab308',
          }}>⬡ DEMO MODE</div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '8px 20px', borderRadius: 7, fontSize: 13, fontWeight: 700,
              background: '#00d4ff', color: '#000', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,212,255,0.35)', transition: 'all 0.15s',
              letterSpacing: 0.3,
            }}
            onMouseEnter={e => { e.target.style.boxShadow = '0 6px 24px rgba(0,212,255,0.55)'; e.target.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.target.style.boxShadow = '0 4px 16px rgba(0,212,255,0.35)'; e.target.style.transform = 'translateY(0)'; }}
          >Launch Platform →</button>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 5% 60px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(0,212,255,0.06) 0%, transparent 65%), linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: 'cover, 48px 48px, 48px 48px',
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          {/* Pill badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 16px', borderRadius: 20, marginBottom: 28,
            background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.22)',
            fontSize: 12, fontWeight: 700, color: '#00d4ff', letterSpacing: 1,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
            AI-POWERED · AHMEDABAD & SURAT · IBM GRANITE
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-1.5px', marginBottom: 20,
          }}>
            <span style={{ background: 'linear-gradient(135deg,#e8f4ff,#a5d8ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Predict Floods.
            </span>
            <br />
            <span style={{ background: 'linear-gradient(135deg,#00d4ff,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Before They Happen.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(15px, 2vw, 19px)', color: 'rgba(232,244,255,0.6)',
            maxWidth: 620, margin: '0 auto 36px', lineHeight: 1.75,
          }}>
            HYDRA-X is a real-time urban flood intelligence platform — combining AI prediction, multi-agent coordination, GIS mapping, and human-in-the-loop governance to protect cities before disaster strikes.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '14px 32px', borderRadius: 9, fontSize: 15, fontWeight: 800,
                background: '#00d4ff', color: '#000', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0,212,255,0.4)', letterSpacing: 0.3, transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,212,255,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,212,255,0.4)'; }}
            >
              Open Command Center →
            </button>
            <a href="#how" style={{
              padding: '14px 32px', borderRadius: 9, fontSize: 15, fontWeight: 700,
              background: 'transparent', color: '#e8f4ff', border: '1px solid rgba(232,244,255,0.2)',
              cursor: 'pointer', textDecoration: 'none', letterSpacing: 0.3, transition: 'all 0.15s',
              display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'; e.currentTarget.style.color = '#00d4ff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(232,244,255,0.2)'; e.currentTarget.style.color = '#e8f4ff'; }}
            >
              See How It Works
            </a>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap',
            border: '1px solid rgba(0,212,255,0.1)', borderRadius: 12,
            background: 'rgba(15,29,48,0.6)', backdropFilter: 'blur(8px)',
            overflow: 'hidden', maxWidth: 680, margin: '0 auto',
          }}>
            {[
              { num: 2, suffix: ' hrs', label: 'Early Warning Lead Time', color: '#00d4ff' },
              { num: 38, suffix: '%', label: 'Faster Response', color: '#22c55e' },
              { num: 94, suffix: '%', label: 'Report Accuracy', color: '#3b82f6' },
              { num: 10, suffix: '', label: 'AI Agents Active', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: '1 1 140px', padding: '20px 16px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid rgba(0,212,255,0.08)' : 'none',
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                  <Counter to={s.num} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(232,244,255,0.4)', marginTop: 5, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────── */}
      <section id="how" style={{ padding: '96px 5%', background: 'rgba(13,22,41,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00d4ff', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>THE SYSTEM</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14 }}>
              From Raw Data to<br />
              <span style={{ background: 'linear-gradient(90deg,#00d4ff,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Coordinated Response</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(232,244,255,0.5)', maxWidth: 520, margin: '0 auto' }}>
              Every step is explainable, auditable, and requires human approval before any civic action is taken.
            </p>
          </div>

          {/* Flow steps */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { icon: '📡', title: 'Observe', desc: 'IoT sensors, rain gauges, citizen reports, and weather APIs feed real-time data.', color: '#00d4ff' },
              { icon: '🧠', title: 'Predict', desc: 'Numerical risk engine scores every zone 0–100. IBM Granite explains why.', color: '#3b82f6' },
              { icon: '⚙️', title: 'Reason', desc: '10 specialized AI agents coordinate — drainage, weather, response, governance.', color: '#a78bfa' },
              { icon: '📋', title: 'Recommend', desc: 'Prioritized action plan generated with confidence scores and alternatives.', color: '#f97316' },
              { icon: '👤', title: 'Approve', desc: 'Human officer reviews every high-impact decision before execution.', color: '#eab308' },
              { icon: '🚨', title: 'Respond', desc: 'Teams dispatched, drains cleaned, roads managed — with outcome tracking.', color: '#22c55e' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', flex: '1 1 160px', maxWidth: 200 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%', marginBottom: 14,
                    background: `${step.color}14`, border: `1px solid ${step.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24, boxShadow: `0 0 20px ${step.color}18`,
                  }}>{step.icon}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: step.color, marginBottom: 6, textAlign: 'center' }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(232,244,255,0.45)', textAlign: 'center', lineHeight: 1.6, padding: '0 8px' }}>{step.desc}</div>
                </div>
                {i < 5 && (
                  <div style={{ fontSize: 20, color: 'rgba(0,212,255,0.2)', marginTop: 20, padding: '0 4px', flexShrink: 0 }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────── */}
      <section id="features" style={{ padding: '96px 5%' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00d4ff', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>CAPABILITIES</div>
            <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, letterSpacing: '-0.5px' }}>
              Built for Real Municipal<br />
              <span style={{ background: 'linear-gradient(90deg,#00d4ff,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Operations</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[
              {
                icon: '🗺️', title: 'Live GIS Risk Map',
                desc: 'Interactive city map with real-time flood risk zones, drainage status, incident markers, and response teams.',
                tag: 'GIS', tagColor: '#00d4ff', route: '/gis',
              },
              {
                icon: '🤖', title: 'Multi-Agent AI System',
                desc: '10 specialized agents coordinated by a central Urban Flood Orchestrator — each with a specific mission and tool set.',
                tag: 'AI AGENTS', tagColor: '#a78bfa', route: '/agents',
              },
              {
                icon: '🔧', title: 'Predictive Drain Maintenance',
                desc: 'AI calculates blockage probability per drain and generates a prioritized maintenance queue before floods hit.',
                tag: 'PREVENTION', tagColor: '#22c55e', route: '/drainage',
              },
              {
                icon: '👥', title: 'Citizen Report Intelligence',
                desc: 'Incoming citizen reports are automatically clustered, deduplicated, and classified — 17 reports → 7 verified incidents.',
                tag: 'CROWDSOURCING', tagColor: '#f97316', route: '/incidents',
              },
              {
                icon: '🧪', title: 'Flood Scenario Simulator',
                desc: 'Run what-if scenarios with variable rainfall, blocked drains, and team availability to pre-plan responses.',
                tag: 'SIMULATION', tagColor: '#eab308', route: '/simulator',
              },
              {
                icon: '👤', title: 'Human-in-the-Loop Governance',
                desc: 'Every high-impact action requires officer approval. AI recommends — humans decide. Full audit trail maintained.',
                tag: 'GOVERNANCE', tagColor: '#3b82f6', route: '/response',
              },
            ].map((f, i) => (
              <div
                key={i}
                onClick={() => navigate(f.route)}
                style={{
                  padding: '28px 24px', borderRadius: 14, cursor: 'pointer',
                  background: 'rgba(15,29,48,0.7)', border: '1px solid rgba(0,212,255,0.1)',
                  transition: 'all 0.2s', position: 'relative', overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.border = '1px solid rgba(0,212,255,0.28)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.border = '1px solid rgba(0,212,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e8f4ff' }}>{f.title}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                    background: `${f.tagColor}15`, color: f.tagColor, border: `1px solid ${f.tagColor}30`,
                    letterSpacing: 0.5, flexShrink: 0,
                  }}>{f.tag}</span>
                </div>
                <p style={{ fontSize: 13, color: 'rgba(232,244,255,0.5)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                <div style={{ marginTop: 16, fontSize: 12, color: f.tagColor, fontWeight: 600 }}>Open module →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IMPACT ──────────────────────────────────────────────── */}
      <section id="impact" style={{ padding: '96px 5%', background: 'rgba(13,22,41,0.8)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          {/* Left: text */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>ESTIMATED IMPACT</div>
            <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 18, lineHeight: 1.2 }}>
              Smarter Cities.<br />
              <span style={{ background: 'linear-gradient(90deg,#22c55e,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Safer Citizens.</span>
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(232,244,255,0.55)', lineHeight: 1.8, marginBottom: 24, maxWidth: 420 }}>
              HYDRA-X is designed to give Ahmedabad and Surat a proactive flood response system — replacing reactive, manual processes with intelligent, data-driven coordination.
            </p>
            <div style={{ fontSize: 11, color: 'rgba(232,244,255,0.3)', fontStyle: 'italic' }}>
              ⬡ All metrics are simulation-based estimates. Not real-world measurements.
            </div>
          </div>

          {/* Right: metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              { value: 2, suffix: ' hrs', label: 'Earlier flood detection vs manual', icon: '⏱️', color: '#00d4ff' },
              { value: 38, suffix: '%', label: 'Est. response time reduction', icon: '🚒', color: '#22c55e' },
              { value: 52, suffix: '%', label: 'Lower drainage failure rate', icon: '🔧', color: '#3b82f6' },
              { value: 94, suffix: '%', label: 'Citizen report verification rate', icon: '✓', color: '#a78bfa' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '22px 20px', borderRadius: 12,
                background: 'rgba(15,29,48,0.8)', border: `1px solid ${m.color}22`,
                boxShadow: `0 0 24px ${m.color}08`,
              }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{m.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: m.color, lineHeight: 1 }}>
                  <Counter to={m.value} suffix={m.suffix} />
                </div>
                <div style={{ fontSize: 11.5, color: 'rgba(232,244,255,0.45)', marginTop: 6, lineHeight: 1.5 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TECHNOLOGY ──────────────────────────────────────────── */}
      <section id="tech" style={{ padding: '96px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>POWERED BY</div>
          <h2 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 14 }}>
            Built on <span style={{ background: 'linear-gradient(90deg,#a78bfa,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IBM Technology</span>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(232,244,255,0.5)', maxWidth: 520, margin: '0 auto 48px', lineHeight: 1.7 }}>
            A provider abstraction ensures clean fallback to simulation mode when live credentials are unavailable. No fake API calls — ever.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 48 }}>
            {[
              { name: 'IBM Granite 3.3', desc: 'Reasoning & Explanation', color: '#a78bfa', icon: '⬡' },
              { name: 'IBM watsonx.ai', desc: 'AI Model Serving', color: '#3b82f6', icon: '⬡' },
              { name: 'IBM Cloud', desc: 'Infrastructure', color: '#00d4ff', icon: '☁️' },
              { name: 'IBM Bob', desc: 'Dev Platform', color: '#22c55e', icon: '🤖' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '18px 22px', borderRadius: 12, minWidth: 180,
                background: `${t.color}0c`, border: `1px solid ${t.color}25`,
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 22 }}>{t.icon}</div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: t.color }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,244,255,0.4)', marginTop: 2 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Architecture mini-flow */}
          <div style={{
            padding: '20px 28px', borderRadius: 12,
            background: 'rgba(15,29,48,0.7)', border: '1px solid rgba(0,212,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexWrap: 'wrap', gap: 0, overflowX: 'auto',
          }}>
            {['DATA', 'AI PERCEPTION', 'RISK ENGINE', 'IBM GRANITE', 'HUMAN APPROVAL', 'RESPONSE', 'LEARNING'].map((step, i, arr) => (
              <React.Fragment key={step}>
                <div style={{
                  padding: '7px 14px', borderRadius: 6, fontSize: 10.5, fontWeight: 700,
                  background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.15)',
                  color: '#00d4ff', whiteSpace: 'nowrap', letterSpacing: 0.5,
                }}>{step}</div>
                {i < arr.length - 1 && <div style={{ color: 'rgba(0,212,255,0.25)', margin: '0 6px', fontSize: 14 }}>→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS ────────────────────────────────────────── */}
      <section style={{ padding: '80px 5%', background: 'rgba(13,22,41,0.9)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 900, marginBottom: 8 }}>
            Explore HYDRA-X
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(232,244,255,0.45)', marginBottom: 40 }}>
            Jump directly to any module from here
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {[
              { label: '⚡ Command Center', path: '/', color: '#00d4ff' },
              { label: '📊 Flood Intelligence', path: '/flood', color: '#3b82f6' },
              { label: '🗺️ GIS Map', path: '/gis', color: '#22c55e' },
              { label: '🔧 Drainage', path: '/drainage', color: '#f97316' },
              { label: '⚠️ Incidents', path: '/incidents', color: '#ef4444' },
              { label: '🚒 Response Ops', path: '/response', color: '#eab308' },
              { label: '🧪 Simulator', path: '/simulator', color: '#a78bfa' },
              { label: '🤖 AI Agents', path: '/agents', color: '#00d4ff' },
              { label: '🏗️ Damage & Recovery', path: '/damage', color: '#f97316' },
              { label: '💡 AI Insights', path: '/insights', color: '#22c55e' },
              { label: '🔍 Observability', path: '/observability', color: '#3b82f6' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                style={{
                  padding: '9px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: `${item.color}0e`, border: `1px solid ${item.color}28`,
                  color: item.color, cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${item.color}20`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${item.color}0e`; e.currentTarget.style.transform = 'translateY(0)'; }}
              >{item.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(0,212,255,0.1)',
        padding: '44px 5% 28px',
        background: '#070d1a',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40, flexWrap: 'wrap' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <LogoSVG size={28} />
                <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: 3, background: 'linear-gradient(90deg,#00d4ff,#3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HYDRA-X</div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(232,244,255,0.4)', lineHeight: 1.75, maxWidth: 280 }}>
                AI-Powered Urban Flood Intelligence &amp; Autonomous Civic Response Platform. Built for Ahmedabad and Surat.
              </p>
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['IBM Granite', 'watsonx.ai', 'IBM Cloud'].map(b => (
                  <span key={b} style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>{b}</span>
                ))}
              </div>
            </div>
            {/* Links */}
            {[
              { heading: 'Platform', links: ['Command Center', 'GIS Map', 'AI Agents', 'Flood Simulator'] },
              { heading: 'Intelligence', links: ['Flood Intelligence', 'Drainage', 'Incidents', 'Response Ops'] },
              { heading: 'About', links: ['How It Works', 'AI Governance', 'Observability', 'IBM Technology'] },
            ].map(col => (
              <div key={col.heading}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(232,244,255,0.5)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>{col.heading}</div>
                {col.links.map(link => (
                  <div key={link} style={{ fontSize: 13, color: 'rgba(232,244,255,0.4)', marginBottom: 9, cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => { e.target.style.color = '#00d4ff'; }}
                    onMouseLeave={e => { e.target.style.color = 'rgba(232,244,255,0.4)'; }}
                  >{link}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(232,244,255,0.07)', paddingTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ fontSize: 12, color: 'rgba(232,244,255,0.3)' }}>
              © 2024 HYDRA-X · IBM Hackathon · Smart Urban Flooding & Drainage Management System
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', animation: 'pulse-dot 2s infinite' }} />
              <span style={{ fontSize: 12, color: 'rgba(232,244,255,0.3)' }}>All data is simulated · DEMO MODE</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
