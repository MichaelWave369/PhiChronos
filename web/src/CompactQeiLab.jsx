import React, {useMemo, useState} from 'react'
import { ArrowUpRight, Activity, FlaskConical, Info, Scale, ShieldAlert } from 'lucide-react'
import { BUMP_COEFFICIENT, shapeWeight, compactQei, compactPlateau, curvatureGate } from './qeiCompact.js'
import './qeiCompact.css'

const exp = n => Number.isFinite(n)?n.toExponential(3).replace('e+',' × 10^').replace('e-',' × 10^-'):'n/a'
const fmt = n => Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5})

function CompactSamplerPlot({tau}) {
  const w=720,h=290, pad={l:55,r:20,t:22,b:43}
  const px = u => pad.l + (u+1.3)/2.6*(w-pad.l-pad.r)
  const py = v => h-pad.b - v/1.14*(h-pad.t-pad.b)
  const samples=Array.from({length:230},(_,i)=>-1.3+2.6*i/229)
  const line=samples.map((u,i)=>(i?'L':'M')+px(u).toFixed(2)+','+py(shapeWeight(u)).toFixed(2)).join(' ')
  const area=line+' L'+px(1.3)+','+py(0)+' L'+px(-1.3)+','+py(0)+' Z'
  return <div className="compact-plot">
    <div className="compact-plot-head"><strong>Normalized sampling weight</strong><span>τ gτ(t)² vs t/τ</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Smooth compact sampling function. It is strictly zero before minus tau and after plus tau, with no abrupt cut at the boundaries.">
      <rect x={pad.l} y={pad.t} width={w-pad.l-pad.r} height={h-pad.t-pad.b} fill="#091a2b" rx="5"/>
      {[-1,-0.5,0,0.5,1].map(u=><g key={u}><line x1={px(u)} x2={px(u)} y1={pad.t} y2={h-pad.b} stroke={Math.abs(u)===1?'#c69c77':'#304456'} strokeDasharray="4 6"/><text x={px(u)} y={h-pad.b+19} textAnchor="middle" fontSize="12" fill="#8ba3b6">{u}</text></g>)}
      {[0,0.25,0.5,0.75,1].map(v=><g key={v}><line x1={pad.l} x2={w-pad.r} y1={py(v)} y2={py(v)} stroke="#284154" strokeDasharray="3 7"/><text x={pad.l-9} y={py(v)+4} textAnchor="end" fontSize="11" fill="#8ba3b6">{v}</text></g>)}
      <path d={area} fill="#61d5c4" opacity=".15"/>
      <path d={line} fill="none" stroke="#8eead9" strokeWidth="3.3" strokeLinecap="round"/>
      <text x={w-pad.r-3} y={h-10} textAnchor="end" fontSize="11" fill="#86a4b8">t / τ</text>
      <text x={pad.l+9} y={pad.t+17} fontSize="11" fill="#9ec1c3">support: −τ to +τ</text>
    </svg>
    <p>Outside the finite window, the weight is exactly zero. The sampler and all its derivatives approach zero smoothly at the boundary. Support width is <strong>{exp(2*tau)} seconds</strong>.</p>
  </div>
}

function ScalingPlot({tau}) {
  const w=720,h=215, pad={l:61,r:20,t:19,b:36}
  const left=-18,right=-12
  const px=x=>pad.l+(x-left)/(right-left)*(w-pad.l-pad.r)
  const py=y=>h-pad.b-(y+12)/25*(h-pad.t-pad.b)
  const logBound=t=>Math.log10(Math.abs(compactQei(10**t).lower))
  const path=Array.from({length:120},(_,i)=>{
    const x=left+(right-left)*i/119
    return (i?'L':'M')+px(x).toFixed(2)+','+py(logBound(x)).toFixed(2)
  }).join(' ')
  return <div className="compact-plot">
    <div className="compact-plot-head"><strong>Lower-bound scaling</strong><span>log₁₀ |bound| [J/m³] versus log₁₀ τ [s]</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Logarithmic plot showing the compact-supported Minkowski scalar lower bound magnitude falling with the inverse fourth power of sampling time.">
      <rect x={pad.l} y={pad.t} width={w-pad.l-pad.r} height={h-pad.t-pad.b} fill="#091a2b" rx="5"/>
      {[-18,-17,-16,-15,-14,-13,-12].map(x=><g key={x}><line x1={px(x)} x2={px(x)} y1={pad.t} y2={h-pad.b} stroke="#2e4559" strokeDasharray="2 6"/><text x={px(x)} y={h-pad.b+17} textAnchor="middle" fontSize="12" fill="#829caf">{x}</text></g>)}
      {[-10,-5,0,5,10].map(y=><g key={y}><line x1={pad.l} x2={w-pad.r} y1={py(y)} y2={py(y)} stroke="#2e4559" strokeDasharray="2 6"/><text x={pad.l-9} y={py(y)+4} textAnchor="end" fontSize="11" fill="#829caf">{y}</text></g>)}
      <path d={path} fill="none" stroke="#8eead9" strokeWidth="3.3"/>
      <line x1={px(Math.log10(tau))} x2={px(Math.log10(tau))} y1={pad.t} y2={h-pad.b} stroke="#e4bd89" strokeDasharray="5 6"/>
      <circle cx={px(Math.log10(tau))} cy={py(Math.log10(Math.abs(compactQei(tau).lower)))} r="5.8" stroke="#0c1b29" strokeWidth="2" fill="#ffb981"/>
    </svg>
  </div>
}

function Stat({title,value,sub}) {return <div className="compact-stat"><span>{title}</span><strong>{value}</strong><small>{sub}</small></div>}

function FiniteLab() {
  const [logTau,setLogTau]=useState(-15)
  const [strength,setStrength]=useState(0.7)
  const tau=10**logTau
  const bound=useMemo(()=>compactQei(tau),[tau])
  const trial=useMemo(()=>compactPlateau(tau,strength*Math.abs(bound.lower)),[tau,strength,bound])
  const failed=trial.status==='excluded_for_this_flat_field'
  return <section className="compact-inner">
    <div className="compact-heading">
      <div className="compact-kicker"><FlaskConical size={16}/> PUBLISHED FLAT-SPACE MODEL / SMOOTH FINITE WINDOW</div>
      <h3>Time-limited quantum energy sampling</h3>
      <p>We choose a genuinely smooth test function with exact finite support. Its second derivative sets a quantum energy lower bound for one particular free scalar field in flat spacetime.</p>
    </div>
    <div className="compact-layout">
      <div className="compact-control-panel">
        <label htmlFor="compact-tau">Window half-width τ <strong>{exp(tau)} s</strong></label>
        <input id="compact-tau" type="range" min="-18" max="-12" step="0.1" value={logTau} onChange={e=>setLogTau(Number(e.target.value))}/>
        <div className="compact-range"><span>1 as</span><span>1 ps</span></div>
        <label htmlFor="compact-strength">Hypothetical negative plateau <strong>{strength.toFixed(2)} × bound</strong></label>
        <input id="compact-strength" type="range" min="0" max="3" step="0.05" value={strength} onChange={e=>setStrength(Number(e.target.value))}/>
        <div className="compact-formula">
          <small>SAMPLER SHAPE</small>
          b(u) = exp[−1/(1−u²)]
          <small>FIELD-SPECIFIC LOWER BOUND</small>
          −ℏ ∫|g″(t)|²dt / (16π²c³)
          <small>NUMERIC COEFFICIENT</small>
          I₂/I₀ = {fmt(BUMP_COEFFICIENT)}
        </div>
        <div className="compact-info"><Info size={17}/><p>The negative plateau is an illustrative classical stress profile sampled during the window. No quantum field state has been constructed, even when it passes this one inequality.</p></div>
      </div>
      <div className="compact-data-panel">
        <div className="compact-stats">
          <Stat title="SMOOTH SUPPORT DURATION" value={exp(2*tau)+' s'} sub="Exactly finite time window"/>
          <Stat title="LOWER BOUND" value={exp(bound.lower)+' J/m³'} sub="Free massless 4D Minkowski scalar"/>
          <Stat title="TOY SAMPLED DENSITY" value={exp(trial.trialMean)+' J/m³'} sub="Unrealized classical plateau"/>
          <Stat title="TRIAL / BOUND MAGNITUDE" value={fmt(trial.fraction)+'×'} sub="One necessary inequality"/>
        </div>
        <div className={'compact-verdict '+(failed?'compact-reject':'compact-caution')}>
          <ShieldAlert size={20}/><div><strong>{failed?'Excluded under the selected flat-field assumptions':'Not excluded by this single flat-field bound'}</strong><p>{failed?'The hypothetical plateau has a sampled density below the published lower bound.':'This is not proof that an admissible physical quantum state produces the chosen negative stress.'}</p></div>
        </div>
        <CompactSamplerPlot tau={tau}/>
        <ScalingPlot tau={tau}/>
      </div>
    </div>
    <div className="compact-boundary"><Info size={18}/><p><strong>Scope:</strong> 4D Minkowski spacetime, inertial observer, free real massless minimally coupled scalar, vacuum normal ordering. Exact compact support does not transform this into a curved-wormhole theorem, quantum state construction, or backward time travel.</p></div>
  </section>
}

function CurvatureLab() {
  const [logThroat,setLogThroat]=useState(0)
  const [ratio,setRatio]=useState(1)
  const [logTau,setLogTau]=useState(-15)
  const throat=10**logThroat,tau=10**logTau
  const m=useMemo(()=>curvatureGate(throat,ratio,tau),[throat,ratio,tau])
  return <section className="compact-inner">
    <div className="compact-heading">
      <div className="compact-kicker"><Activity size={16}/> CURVED SPACETIME DIAGNOSTICS / NOT A QEI THEOREM</div>
      <h3>Measure the curvature before making claims</h3>
      <p>Our previous audit used the Ricci scalar alone. This version also calculates independent orthonormal Riemann components and the Kretschmann scalar. Those give a better picture of the geometry, but still no quantum-state or backreaction verdict.</p>
    </div>
    <div className="compact-layout">
      <div className="compact-control-panel">
        <label htmlFor="compact-radius">Throat radius r₀ <strong>{fmt(throat)} m</strong></label>
        <input id="compact-radius" type="range" min="-1" max="4" step="0.1" value={logThroat} onChange={e=>setLogThroat(Number(e.target.value))}/>
        <label htmlFor="compact-ratio">Areal radius r / r₀ <strong>{ratio.toFixed(2)}</strong></label>
        <input id="compact-ratio" type="range" min="1" max="6" step="0.05" value={ratio} onChange={e=>setRatio(Number(e.target.value))}/>
        <label htmlFor="compact-sample">Half-width of finite sampling window <strong>{exp(tau)} s</strong></label>
        <input id="compact-sample" type="range" min="-18" max="-12" step="0.1" value={logTau} onChange={e=>setLogTau(Number(e.target.value))}/>
        <div className="compact-formula">
          <small>ULTRASTATIC ELLIS-TYPE METRIC</small>
          R(l) = √(l²+r₀²)
          <small>RICCI SCALAR</small>
          R = −2r₀² / r⁴
          <small>KRETSCHMANN</small>
          K = 12r₀⁴ / r⁸
        </div>
      </div>
      <div className="compact-data-panel">
        <div className="compact-stats">
          <Stat title="RICCI SCALAR" value={exp(m.ricci)+' m⁻²'} sub="Contracted curvature"/>
          <Stat title="KRETSCHMANN SCALAR" value={exp(m.kretschmann)+' m⁻⁴'} sub="Riemann squared"/>
          <Stat title="COMPONENT CURVATURE LENGTH" value={exp(m.componentCurvatureLength)+' m'} sub="From max |R_abcd|"/>
          <Stat title="SAMPLING / CURVATURE SCALE" value={exp(m.scaleRatio)} sub="cτ / L, diagnostic only"/>
          <Stat title="RADIAL–ANGULAR SECTION" value={exp(m.radialAngularSection)+' m⁻²'} sub="Orthonormal component"/>
          <Stat title="ANGULAR SECTION" value={exp(m.angularSection)+' m⁻²'} sub="Orthonormal component"/>
        </div>
        <div className="compact-verdict compact-reject"><ShieldAlert size={21}/><div><strong>Curved-space QEI compliance: UNDETERMINED</strong><p>A finite sampling interval and a small curvature-scale ratio are not an error-controlled derivation of a bound in curved spacetime. Semiclassical backreaction is also untested.</p></div></div>
        <div className="compact-todo">
          <h4>What is still required</h4>
          <p>Specify an admissible Hadamard field state and renormalized stress tensor.</p>
          <p>Evaluate the applicable curved-spacetime QEI, with its own smearing and geometric terms.</p>
          <p>Check the semiclassical Einstein equation and stability against perturbations.</p>
        </div>
      </div>
    </div>
    <div className="compact-boundary"><Scale size={19}/><p><strong>Not a feasibility result:</strong> the plotted Riemann components are geometric consequences of the selected classical metric. They provide no construction method, wormhole stability proof, or observation of a closed timelike curve.</p></div>
  </section>
}
export default function CompactQeiLab() {
  const [mode,setMode]=useState('finite')
  return <div className="compact-root">
    <div className="compact-tabs">
      <button className={mode==='finite'?'active':''} onClick={()=>setMode('finite')}><FlaskConical size={15}/> Finite window</button>
      <button className={mode==='curvature'?'active':''} onClick={()=>setMode('curvature')}><Activity size={15}/> Curvature invariants</button>
    </div>
    {mode==='finite'?<FiniteLab/>:<CurvatureLab/>}
    <div className="compact-footer"><a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/FINITE_SUPPORT_QEI.md" target="_blank" rel="noreferrer">Read equations and full limitations <ArrowUpRight size={15}/></a><a href="https://arxiv.org/pdf/gr-qc/9805024" target="_blank" rel="noreferrer">Fewster–Eveson original paper <ArrowUpRight size={15}/></a></div>
  </div>
}
