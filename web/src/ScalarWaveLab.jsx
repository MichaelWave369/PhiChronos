import React, {useMemo,useState} from 'react'
import {ArrowUpRight,Atom,BookOpen,Info,ShieldAlert,Waves} from 'lucide-react'
import {ellisPotential,ellisScatter,LOW_K_POWER} from './scalarModes.js'
import './scalarWave.css'

const scientific=n=>Number.isFinite(n)?n.toExponential(3).replace('e+',' × 10^').replace('e-',' × 10^-'):'not defined'
const pretty=n=>Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5})
function Stat({label,value,sub}){
  return <div className="sw-stat"><span>{label}</span><strong>{value}</strong><small>{sub}</small></div>
}
function PotentialGraph({ell}){
  const w=700,h=290,p={l:52,r:18,t:23,b:43}
  const x=u=>p.l+(u+6)/12*(w-p.l-p.r)
  const max=13
  const y=v=>h-p.b-v/max*(h-p.t-p.b)
  const profiles=[0,1,2,3].map(n=>({n,points:Array.from({length:200},(_,i)=>{const z=-6+12*i/199;return [x(z),y(ellisPotential(z,n))]})}))
  const colors=['#78e2d3','#a8affc','#f4b98d','#e793db']
  return <div className="sw-chart">
    <div className="sw-chart-header"><strong>Curved radial barrier, all angular modes</strong><span>r₀²Vℓ(x) vs x=proper distance/r₀</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Positive and even effective potentials for scalar angular modes ell zero through three, centered on the hypothetical wormhole throat.">
      <rect x={p.l} y={p.t} width={w-p.l-p.r} height={h-p.t-p.b} fill="#0a1b2c" rx="5"/>
      {[0,3,6,9,12].map(z=><g key={z}><line x1={p.l} x2={w-p.r} y1={y(z)} y2={y(z)} stroke="#294355" strokeDasharray="3 6"/><text x={p.l-10} y={y(z)+4} textAnchor="end" fontSize="11" fill="#90aabd">{z}</text></g>)}
      {[-6,-4,-2,0,2,4,6].map(z=><g key={z}><line x1={x(z)} x2={x(z)} y1={p.t} y2={h-p.b} stroke="#294355" strokeDasharray="3 6"/><text x={x(z)} y={h-p.b+17} textAnchor="middle" fontSize="11" fill="#90aabd">{z}</text></g>)}
      {profiles.map(({n,points})=><path key={n} d={points.map((v,i)=>(i?'L':'M')+v[0].toFixed(2)+','+v[1].toFixed(2)).join(' ')} stroke={colors[n]} strokeWidth={n===ell?3.8:2} opacity={n===ell?1:.62} fill="none"/>)}
      <text x={w-p.r} y={h-11} fill="#8bacbb" textAnchor="end" fontSize="11">l / r₀</text>
    </svg>
    <div className="sw-legend">{colors.map((c,i)=><span key={i}><i style={{background:c}}/>ℓ = {i}</span>)}</div>
    <p>All profiles are derived from the same curved four-dimensional background. Only ℓ=0 is passed to the numerical transmission solver; higher angular waves need their own asymptotic matching.</p>
  </div>
}
function TransmissionGraph({selected}){
  const data=useMemo(()=>Array.from({length:40},(_,i)=>{
    const k=.03+i*(2.1-.03)/39
    return {k,T:ellisScatter(1,k,24,2048).T}
  }),[])
  const w=700,h=260,p={l:47,r:18,t:20,b:41}
  const x=k=>p.l+(k-.03)/(2.1-.03)*(w-p.l-p.r)
  const y=t=>h-p.b-Math.max(0,Math.min(1,t))*(h-p.t-p.b)
  const path=data.map((d,i)=>(i?'L':'M')+x(d.k).toFixed(2)+','+y(d.T).toFixed(2)).join(' ')
  return <div className="sw-chart">
    <div className="sw-chart-header"><strong>Two-ended s-wave transmission</strong><span>Wave power T vs κ=ωr₀/c</span></div>
    <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Numerical s-wave transmission from close to zero at low frequencies to near one at higher frequencies, for a postulated Ellis wormhole.">
      <rect x={p.l} y={p.t} width={w-p.l-p.r} height={h-p.t-p.b} fill="#0a1b2c" rx="5"/>
      {[0,.25,.5,.75,1].map(z=><g key={z}><line x1={p.l} x2={w-p.r} y1={y(z)} y2={y(z)} stroke="#294355" strokeDasharray="3 6"/><text x={p.l-10} y={y(z)+4} textAnchor="end" fontSize="11" fill="#91acbd">{z}</text></g>)}
      {[.03,.5,1,1.5,2].map(z=><g key={z}><line x1={x(z)} x2={x(z)} y1={p.t} y2={h-p.b} stroke="#294355" strokeDasharray="3 6"/><text x={x(z)} y={h-p.b+17} textAnchor="middle" fontSize="11" fill="#91acbd">{z}</text></g>)}
      <path d={path} fill="none" stroke="#8be5d8" strokeWidth="3.5" strokeLinecap="round"/>
      <line x1={x(selected.k)} x2={x(selected.k)} y1={p.t} y2={h-p.b} stroke="#edba84" strokeDasharray="5 5"/>
      <circle cx={x(selected.k)} cy={y(selected.T)} r="6" fill="#ffbd8c" stroke="#102336" strokeWidth="2"/>
      <text x={w-p.r} y={h-10} textAnchor="end" fontSize="11" fill="#91acbd">κ</text>
    </svg>
    <p>Classical test-field scattering in a theoretical metric. The computed curve is not an observed signal, a wormhole engineering proposal, or a quantum energy inequality.</p>
  </div>
}
export default function ScalarWaveLab(){
  const [logRadius,setLogRadius]=useState(0)
  const [kappa,setKappa]=useState(.5)
  const [ell,setEll]=useState(0)
  const throat=10**logRadius
  const result=useMemo(()=>ellisScatter(throat,kappa,32,4096),[throat,kappa])
  const [check,setCheck]=useState(false)
  const compare=useMemo(()=>check?ellisScatter(throat,kappa,48,6000):null,[check,throat,kappa])
  return <section className="sw-lab">
    <div className="sw-kicker"><Waves size={17}/> FOUR-DIMENSIONAL CURVED-SPACETIME FIELD DYNAMICS • FIXED METRIC</div>
    <h3>Follow a scalar wave through a theoretical wormhole</h3>
    <p className="sw-intro">We finally calculate field dynamics on the very same 3+1D Ellis/Morris–Thorne geometry used in the wormhole constraint lab. The massless probe-scalar equation predicts an effective radial barrier and two-ended wave scattering, independently benchmarked against published low-frequency physics.</p>
    <div className="sw-grid">
      <div className="sw-controls">
        <label htmlFor="sw-r0">Hypothetical throat r₀ <b>{pretty(throat)} m</b></label>
        <input type="range" id="sw-r0" min="-1" max="4" step=".1" value={logRadius} onChange={e=>setLogRadius(Number(e.target.value))}/>
        <label htmlFor="sw-k">Dimensionless frequency κ <b>{kappa.toFixed(2)}</b></label>
        <input type="range" id="sw-k" min=".03" max="2.1" step=".01" value={kappa} onChange={e=>setKappa(Number(e.target.value))}/>
        <label htmlFor="sw-ell">Displayed angular mode ℓ <b>{ell}</b></label>
        <input type="range" id="sw-ell" min="0" max="3" step="1" value={ell} onChange={e=>setEll(Number(e.target.value))}/>
        <div className="sw-equation">
          <small>METRIC • SIGNATURE (−,+,+,+)</small>
          ds² = −c²dt² + dl² + R(l)²dΩ²
          <small>AREAL RADIUS</small>
          R(l)² = l² + r₀²
          <small>SCALAR RADIAL OPERATOR</small>
          −u″ + Vℓ(l)u = (ω²/c²)u
          <small>EFFECTIVE BARRIER</small>
          Vℓ(l) = ℓ(ℓ+1)/R² + r₀²/R⁴
        </div>
        <div className="sw-info"><Info size={17}/><p>This is a free *probe* field on a fixed, postulated geometry. It does not describe the matter needed to hold the throat open or prove stability under gravity/matter perturbations.</p></div>
      </div>
      <div className="sw-results">
        <div className="sw-status"><ShieldAlert size={21}/><div><strong>Classical scalar propagation, not a 4D QEI</strong><p>Real curved-wave dynamics, but no renormalized quantum state, exotic-matter source, or backreaction solution.</p></div></div>
        <div className="sw-stats">
          <Stat label="S-WAVE TRANSMISSION T" value={(100*result.T).toFixed(3)+'%'} sub="Fraction of incoming wave power"/>
          <Stat label="S-WAVE REFLECTION R" value={(100*result.R).toFixed(3)+'%'} sub="Outgoing power on incident side"/>
          <Stat label="FREQUENCY" value={scientific(result.frequencyHz)+' Hz'} sub="Physical wave frequency for r₀"/>
          <Stat label="CURRENT-CONSERVATION ERROR" value={scientific(result.fluxResidual)} sub="Numerical |T+R−1|"/>
        </div>
        <PotentialGraph ell={ell}/>
        <TransmissionGraph selected={{k:kappa,T:result.T}}/>
        <div className="sw-crosscheck">
          <div><strong>Published analytic low-frequency test</strong><p>As κ→0: T/κ²→4/π² = {LOW_K_POWER.toFixed(6)}. The leading approximation is valid only at low κ.</p></div>
          <div><span>{result.theoreticalLowK===null?'Outside low-frequency approximation':(100*result.theoreticalLowK).toFixed(4)+'% predicted low-κ transmission'}</span></div>
        </div>
        <div className="sw-convergence">
          <button type="button" onClick={()=>setCheck(x=>!x)}>{check?'Hide':'Check'} numerical window convergence</button>
          {check&&compare?<p>Computed T at 32 throat radii: {result.T.toFixed(7)}; at 48 radii: {compare.T.toFixed(7)}. Absolute difference: {Math.abs(compare.T-result.T).toExponential(2)}. Wronskian residual (32 radii): {result.wronskianResidual.toExponential(2)}.</p>:<p>Try extending the computational half-domain to see numerical truncation sensitivity, not a physical uncertainty estimate.</p>}
        </div>
      </div>
    </div>
    <div className="sw-footer"><BookOpen size={16}/>
      <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/SCALAR_MODES_4D.md" target="_blank" rel="noreferrer">Derivation and reproducibility <ArrowUpRight size={14}/></a>
      <a href="https://doi.org/10.1140/epjc/s10052-020-08668-3" target="_blank" rel="noreferrer">2020 scalar transmission paper <ArrowUpRight size={14}/></a>
      <a href="https://arxiv.org/abs/gr-qc/0702056" target="_blank" rel="noreferrer">Unsolved 4D curved QEI application <ArrowUpRight size={14}/></a>
    </div>
  </section>
}
