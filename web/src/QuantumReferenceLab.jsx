import React,{useMemo,useState} from 'react'
import {Activity,ArrowUpRight,Atom,BookOpen,CheckCircle2,Info,ShieldAlert,Waves} from 'lucide-react'
import {minkowskiWightman,spectralIntegral,ellisChannel} from './quantumReference.js'
import './quantumReference.css'

const exp=x=>Number.isFinite(x)?x.toExponential(4).replace('e+',' × 10^').replace('e-',' × 10^-'):'unknown'
const fmt=x=>Number(x.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:6})
const phase=(re,im)=>Math.atan2(im,re)*180/Math.PI

function Metric({label,value,note}){return <div className="qr-metric"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>}
function WightmanGraph({r,eps,ct}){
  const W=720,H=270,p={l:58,r:20,t:24,b:44}
  const tmin=-1.2,tmax=1.2
  const points=Array.from({length:220},(_,i)=>{
    const dt=tmin+i*(tmax-tmin)/219
    return {time:dt,...minkowskiWightman(dt,r,eps)}
  })
  const max=Math.max(.1,...points.flatMap(z=>[Math.abs(z.real),Math.abs(z.imag)]))
  const x=t=>p.l+(t-tmin)/(tmax-tmin)*(W-p.l-p.r)
  const y=z=>p.t+(max-z)/(2*max)*(H-p.t-p.b)
  const path=key=>points.map((z,i)=>(i?'L':'M')+x(z.time).toFixed(2)+','+y(z[key]).toFixed(2)).join(' ')
  const chosen=minkowskiWightman(ct,r,eps)
  return <div className="qr-chart"><div className="qr-chart-head"><strong>Regulated two-point function</strong><span>Wε(Δct,r), natural units m⁻²</span></div>
    <svg viewBox={'0 0 '+W+' '+H} role="img" aria-label="Positive frequency Wightman function real and imaginary components against time separation, for the given spatial separation and regulator.">
      <rect x={p.l} y={p.t} width={W-p.l-p.r} height={H-p.t-p.b} rx="5" fill="#0b1b29"/>
      {[-1,-.5,0,.5,1].map(t=><g key={t}><line x1={x(t)} x2={x(t)} y1={p.t} y2={H-p.b} stroke="#294454" strokeDasharray="3 6"/><text x={x(t)} y={H-p.b+19} fill="#95acb8" fontSize="11" textAnchor="middle">{t}</text></g>)}
      <line x1={p.l} x2={W-p.r} y1={y(0)} y2={y(0)} stroke="#617788" strokeDasharray="4 5"/>
      <path d={path('real')} fill="none" stroke="#7ce3d3" strokeWidth="3"/>
      <path d={path('imag')} fill="none" stroke="#f2b68e" strokeWidth="3"/>
      <line x1={x(ct)} x2={x(ct)} y1={p.t} y2={H-p.b} stroke="#e8e2ab" strokeDasharray="5 6"/>
      <circle cx={x(ct)} cy={y(chosen.real)} r="5" fill="#7ce3d3" stroke="#0b1b29" strokeWidth="2"/>
      <circle cx={x(ct)} cy={y(chosen.imag)} r="5" fill="#f2b68e" stroke="#0b1b29" strokeWidth="2"/>
      <text x={W-p.r} y={H-9} textAnchor="end" fill="#92aabc" fontSize="11">Δct (m)</text>
    </svg><div className="qr-legend"><span><i style={{background:'#7ce3d3'}}/> Real W</span><span><i style={{background:'#f2b68e'}}/> Imag W</span><span>Vertical = selected Δct</span></div></div>
}
function FlatReference(){
  const [ct,setCt]=useState(.3),[r,setR]=useState(.7),[eps,setEps]=useState(.5)
  const z=useMemo(()=>spectralIntegral(ct,r,eps,100,4096),[ct,r,eps])
  return <div className="qr-content">
    <div className="qr-heading"><div className="qr-kicker"><Atom size={16}/> EXACT 4D MINKOWSKI QUANTUM VACUUM • REFERENCE ONLY</div>
      <h3>Rebuild a vacuum correlation from its modes</h3>
      <p>A positive-frequency spectral integral and the closed-form vacuum correlator must agree. Explore the real and imaginary components, while the finite regulator keeps our numerical result well-defined.</p>
    </div>
    <div className="qr-grid">
      <div className="qr-controls">
        <label htmlFor="qrct">Time separation Δct <b>{ct.toFixed(2)} m</b></label>
        <input id="qrct" type="range" min="-1.2" max="1.2" step=".02" value={ct} onChange={e=>setCt(Number(e.target.value))}/>
        <label htmlFor="qrr">Spatial separation r <b>{r.toFixed(2)} m</b></label>
        <input id="qrr" type="range" min="0" max="2" step=".02" value={r} onChange={e=>setR(Number(e.target.value))}/>
        <label htmlFor="qreps">Convergence regulator ε <b>{eps.toFixed(2)} m</b></label>
        <input id="qreps" type="range" min=".2" max="1.2" step=".02" value={eps} onChange={e=>setEps(Number(e.target.value))}/>
        <div className="qr-equation"><small>ANALYTIC POSITIVE-FREQUENCY WIGHTMAN</small>Wε = 1/[4π²(r² − (Δct−iε)²)]<small>INDEPENDENT MODE INTEGRAL</small>∫₀∞ dk k e^(−εk)e^(−ikΔct)sinc(kr)/(4π²)<small>NUMERICAL CONVENTION</small>ℏ = c = 1; field units m⁻²</div>
        <div className="qr-info"><Info size={17}/><p>ε is a regularization length, not a measurable quantum energy or an instrument sensitivity. Sending ε→0 requires a distributional limit; no finite pointwise value at coincidence is inferred.</p></div>
      </div>
      <div className="qr-results">
        <div className="qr-metrics">
          <Metric label="ANALYTIC REAL" value={exp(z.analyticReal)} note="Inverse square metres"/>
          <Metric label="SPECTRAL REAL" value={exp(z.real)} note="Independent Simpson quadrature"/>
          <Metric label="ANALYTIC IMAGINARY" value={exp(z.analyticImag)} note="Positive-frequency time ordering"/>
          <Metric label="SPECTRAL IMAGINARY" value={exp(z.imag)} note="Independent Simpson quadrature"/>
          <Metric label="ABSOLUTE NUMERICAL DISCREPANCY" value={exp(z.absoluteDiscrepancy)} note="Includes quadrature and finite cutoff"/>
          <Metric label="OMITTED-TAIL UPPER BOUND" value={exp(z.cutoffTailBound)} note="Only truncation error, not quadrature"/>
        </div>
        <div className="qr-note"><CheckCircle2 size={21}/><div><strong>Independent reference computations</strong><p>This calculation compares separate analytic and numerical formulations. Matching them does not establish a Hadamard state on the Ellis wormhole.</p></div></div>
        <WightmanGraph ct={ct} r={r} eps={eps}/>
      </div>
    </div>
  </div>
}
function EllisChannels(){
  const [k,setK]=useState(.5),[logR,setLogR]=useState(0),[extent,setExtent]=useState(32)
  const r0=10**logR
  const a=useMemo(()=>ellisChannel(r0,k,extent,4096),[r0,k,extent])
  const unitary=a.probabilityResidual<.00001 && a.phaseUnitarityResidual<.00001
  return <div className="qr-content">
    <div className="qr-heading"><div className="qr-kicker"><Waves size={16}/> ELLIS WORMHOLE • PARTIAL WAVE CHANNEL MODEL</div>
      <h3>Check the phases and normalization of two-ended modes</h3>
      <p>The previous solver gave transmission and reflection <i>power</i>. This extends it to complex wave amplitudes and a formal Klein–Gordon continuum-mode normalization, checked against unitarity and parity symmetry.</p>
    </div>
    <div className="qr-grid">
      <div className="qr-controls">
        <label htmlFor="qrk">Dimensionless frequency κ <b>{k.toFixed(2)}</b></label>
        <input id="qrk" type="range" min=".03" max="2.25" step=".01" value={k} onChange={e=>setK(Number(e.target.value))}/>
        <label htmlFor="qrr0">Postulated throat r₀ <b>{fmt(r0)} m</b></label>
        <input id="qrr0" type="range" min="-1" max="3" step=".1" value={logR} onChange={e=>setLogR(Number(e.target.value))}/>
        <label htmlFor="qrextent">Numerical half-domain <b>{extent} × r₀</b></label>
        <input id="qrextent" type="range" min="16" max="48" step="8" value={extent} onChange={e=>setExtent(Number(e.target.value))}/>
        <div className="qr-equation"><small>LEFT INCIDENT CHANNEL</small>u(-L)=1+r, u′(-L)=iκ(1−r)<small>RIGHT TRANSMITTED CHANNEL</small>u(+L)=t, u′(+L)=iκt<small>FORMAL KG CONTINUUM FACTOR</small>Nκ=1/√(4πκ), with δ(κ−κ′)<small>CHECK</small>2κ × 2π × |Nκ|² = 1</div>
        <div className="qr-info"><Info size={17}/><p>The continuum factor is a normalization <b>convention</b> under a completeness assumption. We have not constructed or normalized all angular modes or the curved two-point function.</p></div>
      </div>
      <div className="qr-results">
        <div className="qr-metrics">
          <Metric label="TRANSMISSION AMPLITUDE t" value={exp(a.transmission.re)+' + i('+exp(a.transmission.im)+')'} note={'Phase '+phase(a.transmission.re,a.transmission.im).toFixed(2)+'°'}/>
          <Metric label="REFLECTION AMPLITUDE r" value={exp(a.reflection.re)+' + i('+exp(a.reflection.im)+')'} note={'Phase '+phase(a.reflection.re,a.reflection.im).toFixed(2)+'°'}/>
          <Metric label="TRANSMITTED POWER" value={(100*a.transmissionPower).toFixed(4)+'%'} note="Classical s-wave fraction"/>
          <Metric label="REFLECTED POWER" value={(100*a.reflectionPower).toFixed(4)+'%'} note="Classical s-wave fraction"/>
          <Metric label="CONTINUUM NORMALIZATION" value={a.formalKgDeltaKappaNorm.toFixed(9)} note="Formal 2κ·2π·N² identity"/>
          <Metric label="UNITARITY/PHASE RESIDUAL" value={exp(Math.max(a.probabilityResidual,a.phaseUnitarityResidual))} note="Finite-domain numerical residual"/>
        </div>
        <div className={'qr-note '+(unitary?'':'qr-alert')}><Activity size={21}/><div><strong>{unitary?'S-wave channel flux and phase checks agree':'Numerical channel check needs tighter convergence'}</strong><p>Parity-compatible complex amplitudes satisfy the two-channel unitary scattering relation at the tested resolution. This checks wave propagation, not a full quantum state.</p></div></div>
        <div className="qr-sdiagram"><div><span>LEFT ASYMPTOTIC END</span><strong>Incident 1</strong><small>Reflected |r|² = {a.reflectionPower.toFixed(5)}</small></div><div className="qr-center"><Waves size={30}/><span>THEORETICAL THROAT</span></div><div><span>RIGHT ASYMPTOTIC END</span><strong>Transmitted |t|² = {a.transmissionPower.toFixed(5)}</strong><small>r₀={fmt(r0)} metres</small></div></div>
        <div className="qr-checklist"><strong>Still unproven for a curved quantum vacuum</strong>
          <p>Complete two-channel, all-angular-mode Klein–Gordon spectrum and completeness</p>
          <p>Hadamard two-point function and ultraviolet singular structure</p>
          <p>Renormalized expectation of the four-dimensional stress tensor</p>
          <p>Curved-space QEI bound, quantum support of geometry, and backreaction</p>
        </div>
      </div>
    </div>
  </div>
}
export default function QuantumReferenceLab(){
  const [tab,setTab]=useState('flat')
  return <div className="qr-lab">
    <div className="qr-switch"><button className={tab==='flat'?'active':''} onClick={()=>setTab('flat')}><Atom size={16}/> 4D vacuum reference</button>
      <button className={tab==='ellis'?'active':''} onClick={()=>setTab('ellis')}><Waves size={16}/> Ellis mode channels</button></div>
    {tab==='flat'?<FlatReference/>:<EllisChannels/>}
    <div className="qr-footer"><BookOpen size={17}/>
      <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/QUANTUM_STATE_REFERENCE_4D.md" target="_blank" rel="noreferrer">Derivation and remaining blockers <ArrowUpRight size={14}/></a>
      <a href="https://doi.org/10.1007/s00023-008-0361-0" target="_blank" rel="noreferrer">Fewster–Smith 4D QEI <ArrowUpRight size={14}/></a>
    </div>
  </div>
}
