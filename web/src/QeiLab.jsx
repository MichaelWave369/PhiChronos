import React, { useMemo, useState } from 'react'
import { ArrowUpRight, Atom, BookOpen, Info, Scale, ShieldAlert } from 'lucide-react'
import { flatBounds, pulseTrial, curvedGate } from './qei.js'
import './qei.css'

const format = n => n.toExponential(3).replace('e+', ' × 10^').replace('e-', ' × 10^-')
const plain = n => Number(n.toPrecision(4)).toLocaleString('en-US',{maximumFractionDigits:5})

function Plot({eta, selectedRatio}) {
  const w=650,h=300,p={l:56,r:20,t:22,b:49}
  const logmin=-2,logmax=2, ymin=-4,ymax=5
  const xMap=z=>p.l+(z-logmin)/(logmax-logmin)*(w-p.l-p.r)
  const yMap=z=>h-p.b-(z-ymin)/(ymax-ymin)*(h-p.t-p.b)
  const xy=Array.from({length:300},(_,i)=>{
    const logx=logmin+i/299*(logmax-logmin)
    const x=10**logx
    const ratio=eta*x**4/(1+x)
    return {x:xMap(logx),y:yMap(Math.max(ymin,Math.min(ymax,Math.log10(Math.max(1e-40,ratio)))))}
  })
  const path=xy.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+','+p.y.toFixed(2)).join(' ')
  const xr=Math.log10(selectedRatio)
  const yr=eta*selectedRatio**4/(1+selectedRatio)
  const my=yMap(Math.max(ymin,Math.min(ymax,Math.log10(Math.max(1e-40,yr)))))
  return <svg viewBox={'0 0 '+w+' '+h} className="qei-graph" role="img"
    aria-label="Dimensionless toy sampled negative energy divided by the Fewster Eveson bound, against sampling-time to pulse-width ratio. Values above one are excluded under the chosen flat scalar-field assumptions.">
    <rect x={p.l} y={p.t} width={w-p.l-p.r} height={h-p.t-p.b} rx="5" fill="#0d1c2b"/>
    {[-4,-3,-2,-1,0,1,2,3,4,5].map(z=><g key={z}><line x1={p.l} y1={yMap(z)} x2={w-p.r} y2={yMap(z)} stroke={z===0?'#e0aa80':'#294254'} strokeDasharray={z===0?'4 3':'2 5'}/><text x={p.l-9} y={yMap(z)+4} textAnchor="end" fill="#829fb0" fontSize="11">10^{z}</text></g>)}
    {[-2,-1,0,1,2].map(z=><g key={z}><line x1={xMap(z)} y1={p.t} x2={xMap(z)} y2={h-p.b} stroke="#294254" strokeDasharray="2 5"/><text x={xMap(z)} y={h-p.b+18} textAnchor="middle" fill="#829fb0" fontSize="11">10^{z}</text></g>)}
    <path d={path} fill="none" stroke="#7ae5d5" strokeWidth="3" strokeLinecap="round"/>
    <line x1={xMap(xr)} x2={xMap(xr)} y1={p.t} y2={h-p.b} stroke="#f3bf8b" strokeDasharray="5 6"/>
    <circle cx={xMap(xr)} cy={my} r="5.5" fill="#ffbc8b" stroke="#0b1726" strokeWidth="2"/>
    <text x={w-p.r-4} y={h-10} textAnchor="end" fill="#a0b4c3" fontSize="12">τ / pulse width T (log)</text>
    <text x="17" y="19" fill="#a0b4c3" fontSize="10">Ratio (log)</text>
  </svg>
}

function Value({label,children,sub}) {
  return <div className="qei-value"><span>{label}</span><strong>{children}</strong><small>{sub}</small></div>
}

function FlatField() {
  const [logTau,setLogTau]=useState(-15)
  const [logWidth,setLogWidth]=useState(-15)
  const [eta,setEta]=useState(1)
  const tau=10**logTau, width=10**logWidth
  const bounds=useMemo(()=>flatBounds(tau),[tau])
  const reference=useMemo(()=>flatBounds(width),[width])
  const trial=useMemo(()=>pulseTrial(tau,width,eta*Math.abs(reference.fewsterEveson)),[tau,width,eta,reference])
  const excluded=trial.status==='excluded_for_this_flat_field'
  return <div className="qei-inner">
    <div className="qei-heading"><div className="qei-eyebrow">THEOREM DOMAIN / FREE MASSLESS REAL SCALAR IN 4D MINKOWSKI</div>
      <h3>How long can energy stay negative?</h3>
      <p>Sample a hypothetical negative-energy pulse over time. The bound becomes dramatically stricter at longer sampling durations. The trial pulse is not a physical quantum state.</p>
    </div>
    <div className="qei-columns">
      <div className="qei-controls">
        <label htmlFor="qei-tau">Sampling duration τ <b>{format(tau)} s</b></label>
        <input id="qei-tau" type="range" min="-18" max="-12" step="0.1" value={logTau} onChange={e=>setLogTau(Number(e.target.value))}/>
        <div className="qei-range"><span>1 attosecond</span><span>1 picosecond</span></div>
        <label htmlFor="qei-width">Illustrative pulse width T <b>{format(width)} s</b></label>
        <input id="qei-width" type="range" min="-18" max="-12" step="0.1" value={logWidth} onChange={e=>setLogWidth(Number(e.target.value))}/>
        <label htmlFor="qei-eta">Trial pulse strength η <b>{eta.toFixed(1)} × reference</b></label>
        <input id="qei-eta" type="range" min="0" max="8" step="0.1" value={eta} onChange={e=>setEta(Number(e.target.value))}/>
        <div className="qei-formula"><small>FORD–ROMAN</small>−3ℏ / (32π²c³τ⁴)<small>FEWSTER–EVESON (STRONGER)</small>−27ℏ / (2048π²c³τ⁴)</div>
        <div className="qei-explain"><Info size={16}/><p>η defines the peak trial amplitude relative to the Fewster–Eveson bound at T. An input that passes one inequality does not establish a physically preparable quantum state.</p></div>
      </div>
      <div className="qei-results">
        <div className="qei-stats">
          <Value label="FORD–ROMAN LOWER BOUND" sub="J/m³, averaged energy density">{format(bounds.fordRoman)}</Value>
          <Value label="FEWSTER–EVESON LOWER BOUND" sub="J/m³, stronger for this sampler">{format(bounds.fewsterEveson)}</Value>
          <Value label="TRIAL'S SAMPLED DENSITY" sub="J/m³, classical function only">{format(trial.average)}</Value>
          <Value label="TRIAL / FE BOUND MAGNITUDE" sub="Dimensionless ratio">{format(trial.ratio)}</Value>
        </div>
        <div className={'qei-verdict '+(excluded?'qei-excluded':'qei-undetermined')}>
          <ShieldAlert size={21}/><div><strong>{excluded?'Trial excluded by this field-specific bound':'Not excluded by this one inequality'}</strong>
            <p>{excluded?'The negative-only trial average lies below the theorem’s allowed lower bound for this chosen flat quantum field.':'This necessary check alone cannot establish that any quantum state realizes the toy profile.'}</p></div>
        </div>
        <div className="qei-plot"><div className="qei-plot-top"><strong>Try longer sampling windows</strong><span>Threshold = 1</span></div><Plot eta={eta} selectedRatio={tau/width}/>
          <p>Dimensionless plot of |sampled trial| / |FE bound| versus τ/T. Values above 1 fail the selected flat-field inequality. The selected point follows the sliders.</p>
        </div>
      </div>
    </div>
  </div>
}

function CurvedAudit() {
  const [logThroat,setLogThroat]=useState(0)
  const [logTau,setLogTau]=useState(-15)
  const throat=10**logThroat,tau=10**logTau
  const audit=curvedGate(throat,1,tau)
  return <div className="qei-inner">
    <div className="qei-heading"><div className="qei-eyebrow">MODEL APPLICABILITY GATE / MORRIS–THORNE CURVED THROAT</div>
      <h3>Can we apply that inequality to a wormhole?</h3>
      <p>Not automatically. We can compare characteristic length scales, but a flat-spacetime theorem with an infinite-tail sampler is not by itself a rigorous bound for a curved throat.</p>
    </div>
    <div className="qei-columns">
      <div className="qei-controls">
        <label htmlFor="qei-r0">Hypothetical throat radius r₀ <b>{plain(throat)} m</b></label>
        <input id="qei-r0" type="range" min="-1" max="3" step="0.1" value={logThroat} onChange={e=>setLogThroat(Number(e.target.value))}/>
        <label htmlFor="qei-curved-tau">Sampling time τ <b>{format(tau)} s</b></label>
        <input id="qei-curved-tau" type="range" min="-18" max="-12" step="0.1" value={logTau} onChange={e=>setLogTau(Number(e.target.value))}/>
        <div className="qei-formula"><small>GEOMETRY DIAGNOSTIC ONLY</small>Lᵣ = 1 / √|R|<small>LOCAL SCALE RATIO</small>cτ / Lᵣ</div>
        <div className="qei-explain"><Info size={16}/><p>Lᵣ is derived from the Ricci scalar, one curvature diagnostic, not a certified minimum local curvature radius. It does not control infinite sampling tails or quantum field states.</p></div>
      </div>
      <div className="qei-results">
        <div className="qei-stats">
          <Value label="RICCI-DERIVED LENGTH" sub="m; not all curvature scales">{format(audit.ricciLength)}</Value>
          <Value label="SAMPLING LENGTH cτ" sub="meters">{format(audit.samplingLength)}</Value>
          <Value label="LENGTH-SCALE RATIO" sub="dimensionless">{format(audit.scaleRatio)}</Value>
          <Value label="CLASSICAL LOCAL THROAT STRESS" sub="J/m³, not a quantum expectation">{format(audit.localClassicalEnergyDensity)}</Value>
        </div>
        <div className="qei-verdict qei-excluded"><ShieldAlert size={22}/><div><strong>No QEI compliance verdict</strong>
          <p>The relevant curved-spacetime bound, quantum state, renormalized source, and backreaction have not been evaluated. This is not a finding that the wormhole passes or fails the flat theorem.</p></div></div>
        <div className="qei-checklist"><h4>Unresolved physics required</h4>
          <p>Specified quantum field and admissible state</p><p>Curved-spacetime worldline sampling theorem</p><p>All relevant curvature scales and corrections</p><p>Renormalization and semiclassical backreaction</p>
        </div>
      </div>
    </div>
  </div>
}
export default function QeiLab() {
  const [tab,setTab]=useState('flat')
  return <div className="qei-lab">
    <div className="qei-tabs">
      <button className={tab==='flat'?'active':''} onClick={()=>setTab('flat')}><Atom size={16}/> Flat-spacetime QEI</button>
      <button className={tab==='curved'?'active':''} onClick={()=>setTab('curved')}><Scale size={16}/> Wormhole applicability audit</button>
    </div>
    {tab==='flat'?<FlatField/>:<CurvedAudit/>}
    <div className="qei-footer">
      <div><BookOpen size={17}/> Research references: <a href="https://doi.org/10.1103/PhysRevD.53.5496" target="_blank" rel="noreferrer">Ford–Roman 1996 <ArrowUpRight size={13}/></a><a href="https://doi.org/10.1103/PhysRevD.58.084010" target="_blank" rel="noreferrer">Fewster–Eveson 1998 <ArrowUpRight size={13}/></a><a href="https://doi.org/10.3390/universe10070291" target="_blank" rel="noreferrer">Kontou 2024 <ArrowUpRight size={13}/></a></div>
      <p>All visualized inequalities are published mathematical bounds under their stated field assumptions. No past-directed information transfer or physical wormhole has been demonstrated.</p>
      <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/QEI_MODEL.md" target="_blank" rel="noreferrer">Full mathematics and limitations <ArrowUpRight size={14}/></a>
    </div>
  </div>
}
