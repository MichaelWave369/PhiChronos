import React, { useState } from 'react'
import { ArrowRightLeft, Crosshair, Gauge, Info } from 'lucide-react'
import { boostLightSeconds, intervalLightSecondsSquared, causalRegion } from './physics.js'

const fmt = (n, digits = 3) => Object.is(n, -0) ? '0' : n.toFixed(digits).replace(/\.?0+$/, '')

function MinkowskiPanel({ name, ct, x, range, beta = 0, showBoostAxes = false }) {
  const side = 330
  const mid = side / 2
  const pad = 22
  const half = mid - pad
  const toX = n => mid + n / range * half
  const toY = n => mid - n / range * half
  const markerInBounds = Math.abs(ct) <= range && Math.abs(x) <= range
  const gridSteps = [-range, -range / 2, 0, range / 2, range]
  const xAxisY = toY(0)
  const yAxisX = toX(0)
  const clipId = showBoostAxes ? 'plot-s' : 'plot-sp'

  return <div className="minkowski-panel">
    <div className="minkowski-panel-head"><strong>{name}</strong><span>{showBoostAxes ? "unprimed S" : "moving S′"}</span></div>
    <svg viewBox="0 0 330 330" className="minkowski-svg" role="img" aria-label={name + ' spacetime coordinate diagram with a light cone and a selected event'}>
      <defs><clipPath id={clipId}><rect x={pad} y={pad} width={side - 2 * pad} height={side - 2 * pad}/></clipPath></defs>
      <rect x={pad} y={pad} width={side - 2 * pad} height={side - 2 * pad} fill="#0b1725" stroke="#34465a" rx="4"/>
      <g clipPath={'url(#' + clipId + ')'}>
        <polygon points={toX(0)+','+toY(0)+' '+toX(-range)+','+toY(range)+' '+toX(range)+','+toY(range)} fill="#1a6357" opacity=".18"/>
        <polygon points={toX(0)+','+toY(0)+' '+toX(-range)+','+toY(-range)+' '+toX(range)+','+toY(-range)} fill="#ad6f48" opacity=".13"/>
        {gridSteps.map(n => <g key={n}><line x1={toX(n)} y1={pad} x2={toX(n)} y2={side-pad} stroke="#283b4a" strokeDasharray="2 5"/><line x1={pad} y1={toY(n)} x2={side-pad} y2={toY(n)} stroke="#283b4a" strokeDasharray="2 5"/></g>)}
        <line x1={pad} y1={xAxisY} x2={side-pad} y2={xAxisY} stroke="#8295aa" strokeWidth="1.3"/>
        <line x1={yAxisX} y1={side-pad} x2={yAxisX} y2={pad} stroke="#8295aa" strokeWidth="1.3"/>
        <line x1={toX(-range)} y1={toY(-range)} x2={toX(range)} y2={toY(range)} stroke="#85e7d6" strokeWidth="2" strokeDasharray="5 4"/>
        <line x1={toX(-range)} y1={toY(range)} x2={toX(range)} y2={toY(-range)} stroke="#85e7d6" strokeWidth="2" strokeDasharray="5 4"/>
        {showBoostAxes && <g>
          <line x1={toX(-beta * range)} y1={toY(-range)} x2={toX(beta * range)} y2={toY(range)} stroke="#e4b976" strokeWidth="2.6"/>
          <line x1={toX(-range)} y1={toY(-beta*range)} x2={toX(range)} y2={toY(beta*range)} stroke="#9bb4ff" strokeWidth="2.6"/>
        </g>}
        {markerInBounds && <g><line x1={toX(x)} y1={toY(ct)} x2={toX(x)} y2={toY(0)} stroke="#ffa86e" strokeDasharray="3 6"/><line x1={toX(x)} y1={toY(ct)} x2={toX(0)} y2={toY(ct)} stroke="#ffa86e" strokeDasharray="3 6"/><circle cx={toX(x)} cy={toY(ct)} r="6" fill="#ffa86e" stroke="#0b1725" strokeWidth="2"/><text x={toX(x)+10} y={toY(ct)-10} className="minkowski-event">B</text></g>}
        <circle cx={mid} cy={mid} r="4" fill="#e5edf6"/>
      </g>
      <text x={side-pad-1} y={mid-8} textAnchor="end" className="axis-label">x {showBoostAxes ? '' : '′'}</text>
      <text x={mid+9} y={pad+14} className="axis-label">ct{showBoostAxes ? '' : '′'}</text>
      <text x={pad+5} y={side-pad-8} className="axis-label">−{fmt(range,1)}</text>
      <text x={side-pad-5} y={side-pad-8} textAnchor="end" className="axis-label">+{fmt(range,1)}</text>
    </svg>
    <div className="minkowski-legend"><span><i className="legend-light"/>light cone</span>{showBoostAxes && <><span><i className="legend-time"/>ct′ axis</span><span><i className="legend-space"/>x′ axis</span></>}</div>
  </div>
}

export default function CausalityLab() {
  const [ct, setCt] = useState(3)
  const [x, setX] = useState(1)
  const [beta, setBeta] = useState(0.6)
  const primed = boostLightSeconds(ct, x, beta)
  const s2 = intervalLightSecondsSquared(ct, x)
  const s2prime = intervalLightSecondsSquared(primed.ct, primed.x)
  const range = Math.max(6, Math.ceil(Math.max(Math.abs(ct), Math.abs(x), Math.abs(primed.ct), Math.abs(primed.x)) * 1.15))
  const region = causalRegion(ct, x)
  const presets = [
    {label:'Future event',t:3,x:1,b:0.6},
    {label:'Light ray',t:3,x:3,b:0.6},
    {label:'Spacelike',t:1,x:4,b:0.6},
    {label:'Past event',t:-3,x:1,b:-0.6},
  ]
  return <div className="causality-lab">
    <div className="causal-intro"><div><div className="causal-status">MATHEMATICAL MODEL / SPECIAL RELATIVITY</div><h3>Map the light cone</h3><p>Move event B and change the observer's speed. The event coordinates change, but its causal classification and spacetime interval don't.</p></div><Crosshair size={28}/></div>
    <div className="causal-presets" aria-label="Example events">{presets.map(p => <button key={p.label} onClick={() => {setCt(p.t);setX(p.x);setBeta(p.b)}}>{p.label}</button>)}</div>
    <div className="causal-controls">
      <label>Time coordinate, ct <b>{fmt(ct,1)} light-seconds</b><input type="range" min="-5" max="5" step="0.1" value={ct} onChange={e=>setCt(Number(e.target.value))}/></label>
      <label>Position, x <b>{fmt(x,1)} light-seconds</b><input type="range" min="-5" max="5" step="0.1" value={x} onChange={e=>setX(Number(e.target.value))}/></label>
      <label>Relative velocity, v/c <b>{fmt(beta,2)} c</b><input type="range" min="-0.9" max="0.9" step="0.05" value={beta} onChange={e=>setBeta(Number(e.target.value))}/></label>
    </div>
    <div className="causal-plot-row"><MinkowskiPanel name="Frame S" ct={ct} x={x} beta={beta} range={range} showBoostAxes/><div className="transform-symbol" aria-hidden="true"><ArrowRightLeft size={25}/><span>LORENTZ<br/>BOOST</span></div><MinkowskiPanel name="Frame S′" ct={primed.ct} x={primed.x} range={range}/></div>
    <div className="causal-readouts"><div><span>CAUSAL REGION</span><strong>{region}</strong></div><div><span>INVARIANT INTERVAL s²</span><strong>{fmt(s2,3)} (light-seconds)²</strong></div><div><span>BOOSTED INTERVAL s′²</span><strong>{fmt(s2prime,3)} (light-seconds)²</strong></div><div><span>BOOSTED EVENT B′ (ct′, x′)</span><strong>({fmt(primed.ct)}, {fmt(primed.x)})</strong></div></div>
    <div className="causal-equations"><Gauge size={17}/><code>ct′ = γ(ct − βx) &nbsp; | &nbsp; x′ = γ(x − βct)</code></div>
    <div className="causal-warning"><Info size={18}/><p><strong>Physics boundary:</strong> Both panels show the same events in different inertial coordinate systems. Light-seconds are distance units; ct is plotted in light-seconds so photons travel along 45° lines. This visualization does <em>not</em> model curved spacetime, wormholes, or closed timelike curves, and it cannot demonstrate travel into the past.</p></div>
  </div>
}
