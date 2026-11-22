import React, { useMemo, useState } from 'react'
import { ArrowUpRight, Atom, BookOpen, Info, ShieldAlert, Waves } from 'lucide-react'
import {wormholeAt, arealRadius} from './wormhole.js'
import './wormhole.css'

function scientific(n) {
  if (!Number.isFinite(n)) return 'invalid'
  if (n === 0) return '0'
  return n.toExponential(3).replace('e+', ' × 10^').replace('e-', ' × 10^-')
}
function pretty(n) { return Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5}) }
function Field({label,value,sub,negative=false}) {
  return <div className={'wormhole-stat '+(negative?'wormhole-stat-negative':'')}>
    <span>{label}</span><strong>{value}</strong><small>{sub}</small>
  </div>
}
function StressPlot({ratio}) {
  const w=700,h=290,l=62,r=20,t=22,b=40
  const fx=x=>l+(x-1)/5*(w-l-r)
  const fy=y=>t+(1.2-y)/3.45*(h-t-b)
  const xs=Array.from({length:150},(_,i)=>1+i/149*5)
  const series=[
    {name:'Energy density ε',key:'density',color:'#6fd7cf',fn:x=>-1/x**4},
    {name:'Radial NEC ε + pᵣ',key:'nec',color:'#ffad79',fn:x=>-2/x**4},
    {name:'Tangential pressure pₜ',key:'tangent',color:'#aba2fd',fn:x=>1/x**4},
  ]
  const path=fn=>xs.map((x,i)=>(i===0?'M':'L')+fx(x).toFixed(2)+','+fy(fn(x)).toFixed(2)).join(' ')
  return <div className="wormhole-chart">
    <div className="wormhole-chart-head"><strong>Stress profile vs r/r₀</strong><span>Normalized by c⁴ / (8πGr₀²)</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Dimensionless stress curves. Radial null energy condition is negative at every plotted radius.">
      <rect x={l} y={t} width={w-l-r} height={h-t-b} fill="#0b1b2a" rx="4"/>
      {[-2,-1,0,1].map(y=><g key={y}><line x1={l} y1={fy(y)} x2={w-r} y2={fy(y)} stroke={y===0?'#53687e':'#273d4e'} strokeDasharray={y===0?'0':'3 6'}/><text x={l-13} y={fy(y)+4} textAnchor="end" fill="#879cb0" fontSize="12">{y}</text></g>)}
      {[1,2,3,4,5,6].map(x=><g key={x}><line x1={fx(x)} y1={t} x2={fx(x)} y2={h-b} stroke="#293d4f" strokeDasharray="3 6"/><text x={fx(x)} y={h-15} textAnchor="middle" fill="#879cb0" fontSize="12">{x}</text></g>)}
      {series.map(s=><path key={s.key} d={path(s.fn)} stroke={s.color} strokeWidth="2.8" fill="none" strokeLinecap="round"/>)}
      <line x1={fx(ratio)} y1={t} x2={fx(ratio)} y2={h-b} stroke="#e4dca6" strokeWidth="1.5" strokeDasharray="5 5"/>
      <circle cx={fx(ratio)} cy={fy(-2/ratio**4)} r="5" fill="#ffad79" stroke="#09111d" strokeWidth="2"/>
      <text x={w-r-7} y={h-15} textAnchor="end" fill="#859db0" fontSize="11">r/r₀</text>
    </svg>
    <div className="wormhole-legend">{series.map(s=><span key={s.key}><i style={{background:s.color}}/>{s.name}</span>)}</div>
    <p>The normalized curves are independent of absolute throat size. The *physical* stress magnitudes change as 1/r₀².</p>
  </div>
}
function CrossSection() {
  // Embedded spatial slice (Flamm/elliptic catenoid): r/r0=cosh(z/r0).
  // The two branches are an illustrative 2D embedding, not a tunnel rendering.
  const w=360,h=270
  const Y=u=>h/2-u*49
  const X=(u,side)=>w/2+side*Math.cosh(u)*27
  const us=Array.from({length:130},(_,i)=>-2.0+i/129*4)
  const curve=side=>us.map((u,i)=>(i===0?'M':'L')+X(u,side).toFixed(2)+','+Y(u).toFixed(2)).join(' ')
  return <svg className="wormhole-cross" viewBox={'0 0 '+w+' '+h} role="img" aria-label="Schematic two-sided embedded spatial wormhole slice with the narrow throat at its center.">
    <rect x="0.5" y="0.5" width={w-1} height={h-1} rx="6" fill="#0b1827" stroke="#32485c"/>
    <line x1="180" y1="19" x2="180" y2="248" stroke="#35485c" strokeDasharray="3 6"/>
    <line x1="43" y1="135" x2="318" y2="135" stroke="#35485c" strokeDasharray="3 6"/>
    <path d={curve(-1)} fill="none" stroke="#80e6d7" strokeWidth="3" strokeLinecap="round"/>
    <path d={curve(1)} fill="none" stroke="#80e6d7" strokeWidth="3" strokeLinecap="round"/>
    <line x1={X(0,-1)} y1="135" x2={X(0,1)} y2="135" stroke="#ffbd83" strokeWidth="2.5"/>
    <text x="180" y="121" textAnchor="middle" fill="#ffce94" fontSize="12">r₀</text>
    <text x="31" y="32" fill="#849baa" fontSize="11">+ l</text>
    <text x="31" y="246" fill="#849baa" fontSize="11">− l</text>
    <text x="180" y="257" textAnchor="middle" fill="#71899e" fontSize="10">SPATIAL EMBEDDING • NOT A PHYSICAL DEVICE</text>
  </svg>
}
function ThroatSweep({chosen}) {
  const w=700,h=210, l=58,r=26,t=15,b=40
  const K=Math.abs(wormholeAt(1).radialNEC)
  const xPos=log=>l+(log+1)/6*(w-l-r)
  const yPos=logMag=>t+(45-logMag)/15*(h-t-b)
  const path=Array.from({length:85},(_,i)=>{
    const log=-1+6*i/84
    return (i?'L':'M')+xPos(log).toFixed(2)+','+yPos(Math.log10(K)-2*log).toFixed(2)
  }).join(' ')
  const logChosen=Math.log10(chosen)
  return <div className="wormhole-chart wormhole-sweep">
    <div className="wormhole-chart-head"><strong>Throat-size parameter sweep</strong><span>log₁₀ |radial NEC at throat| [J/m³]</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Log-log scaling showing inverse-square decrease in the local NEC magnitude as throat radius increases.">
      <rect x={l} y={t} width={w-l-r} height={h-t-b} fill="#0b1b2a" rx="4"/>
      {[30,33,36,39,42,45].map(y=><g key={y}><line x1={l} x2={w-r} y1={yPos(y)} y2={yPos(y)} stroke="#293e51" strokeDasharray="3 5"/><text x={l-11} y={yPos(y)+4} textAnchor="end" fill="#8ba1af" fontSize="11">{y}</text></g>)}
      {[-1,0,1,2,3,4,5].map(x=><g key={x}><line x1={xPos(x)} x2={xPos(x)} y1={t} y2={h-b} stroke="#293e51" strokeDasharray="3 5"/><text x={xPos(x)} y={h-17} textAnchor="middle" fill="#8ba1af" fontSize="11">{x}</text></g>)}
      <path d={path} stroke="#88e7d8" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx={xPos(logChosen)} cy={yPos(Math.log10(K)-2*logChosen)} r="6" fill="#ffb278" stroke="#0b1b2a" strokeWidth="2"/>
      <text x={w-r} y={h-14} textAnchor="end" fill="#8ba1af" fontSize="10">log₁₀ r₀ [m]</text>
    </svg>
    <p>Changing the radius modifies a mathematical stress requirement. This graph is not a feasible-material or total-energy calculation.</p>
  </div>
}
export default function WormholeLab() {
  const [logRadius,setLogRadius]=useState(0)
  const [ratio,setRatio]=useState(1)
  const radius=10**logRadius
  const state=useMemo(()=>wormholeAt(radius,ratio),[radius,ratio])
  const [view,setView]=useState('local')
  return <section className="wormhole-lab">
    <div className="wormhole-header"><div className="wormhole-overline"><Atom size={17}/> CLASSICAL GENERAL RELATIVITY • MODEL-REQUIRED STRESS</div>
      <h3>The wormhole constraint laboratory</h3>
      <p>For one explicit Morris–Thorne geometry, calculate the classical stress-energy that Einstein's equations demand. Examine the radial null energy condition, then test how the numbers scale with throat size.</p>
    </div>
    <div className="wormhole-main">
      <div className="wormhole-controls">
        <label htmlFor="wh-throat">Throat radius r₀ <strong>{pretty(radius)} m</strong></label>
        <input id="wh-throat" type="range" min="-1" max="5" step="0.1" value={logRadius} onChange={e=>setLogRadius(Number(e.target.value))}/>
        <div className="wormhole-range"><span>0.1 m</span><span>100 km</span></div>
        <label htmlFor="wh-ratio">Location r / r₀ <strong>{ratio.toFixed(2)}</strong></label>
        <input id="wh-ratio" type="range" min="1" max="6" step="0.05" value={ratio} onChange={e=>setRatio(Number(e.target.value))}/>
        <div className="wormhole-range"><span>Throat (1×)</span><span>6× throat</span></div>
        <div className="wormhole-equations"><span>SELECTED METRIC</span><code>Φ(r) = 0<br/>b(r) = r₀²/r<br/>r(l) = √(l²+r₀²)</code><small>Two ends • finite throat • static and spherically symmetric • signature (−,+,+,+)</small></div>
        <CrossSection/>
        <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/WORMHOLE_MODEL.md" target="_blank" rel="noreferrer" className="wormhole-source">Full derivation and assumptions <ArrowUpRight size={16}/></a>
      </div>
      <div className="wormhole-output">
        <div className="wormhole-status"><div><span>RADIAL NULL ENERGY CONDITION</span><strong>Violated for this metric</strong></div><ShieldAlert size={24}/></div>
        <div className="wormhole-stats">
          <Field label="LOCAL ENERGY DENSITY ε" value={scientific(state.energyDensity)} sub="J/m³ at selected radius" negative/>
          <Field label="RADIAL PRESSURE pᵣ" value={scientific(state.radialPressure)} sub="Pa (negative = tension)" negative/>
          <Field label="TANGENTIAL PRESSURE pₜ" value={scientific(state.tangentialPressure)} sub="Pa"/>
          <Field label="RADIAL NEC ε + pᵣ" value={scientific(state.radialNEC)} sub="J/m³ • strictly negative" negative/>
        </div>
        <div className="wormhole-view-tabs"><button className={view==='local'?'active':''} onClick={()=>setView('local')}>Radial stress profiles</button><button className={view==='sweep'?'active':''} onClick={()=>setView('sweep')}>Throat size scaling</button></div>
        {view==='local'?<StressPlot ratio={ratio}/>:<ThroatSweep chosen={radius}/>}
        <div className="wormhole-smallfacts"><span>Throat flare-out: b′(r₀) = −1 &lt; 1</span><span>Tangential NEC: ε + pₜ = 0</span><span>Quantum energy inequality: NOT evaluated</span></div>
      </div>
    </div>
    <div className="wormhole-caution"><Info size={19}/><div><strong>Scientific boundary</strong><p>This is an exact *classical stress requirement for a chosen metric*, not a discovered exotic material. It does not establish that a traversable wormhole can exist, remain stable, satisfy quantum energy inequalities, or enable time travel. Quantum energy restrictions require specified fields, sampling and backreaction.</p><div className="wormhole-literature"><a href="https://doi.org/10.1119/1.15620" target="_blank" rel="noreferrer">Morris–Thorne 1988 <ArrowUpRight size={13}/></a><a href="https://doi.org/10.1103/PhysRevD.53.5496" target="_blank" rel="noreferrer">Ford–Roman 1996 <ArrowUpRight size={13}/></a><a href="https://doi.org/10.3390/universe10070291" target="_blank" rel="noreferrer">Kontou 2024 <ArrowUpRight size={13}/></a></div></div></div>
  </section>
}
