import React, {useMemo,useState} from 'react'
import {Atom,BookOpen,Info,ShieldAlert,ArrowUpRight} from 'lucide-react'
import {curved2dBound,curved2dTrial,FLANAGAN_2D_GRADIENT} from './qeiCurved2d.js'
import './curved2d.css'

const fmt=n=>Number.isFinite(n)?n.toExponential(3).replace('e+',' × 10^').replace('e-',' × 10^-'):'not defined'
const normal=n=>Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5})
function Stat({name,value,detail}) {
  return <div className="c2-stat"><span>{name}</span><strong>{value}</strong><small>{detail}</small></div>
}
function GeometryPlot({alpha}){
  const W=460,H=220,left=42,right=14,top=23,bottom=37
  const x=u=>left+(u+3)/6*(W-left-right)
  const y=v=>H-bottom-(v-0.75)/(7.5-0.75)*(H-top-bottom)
  const values=Array.from({length:160},(_,i)=>{
    const u=-3+6*i/159
    const v=Math.exp(2*alpha*Math.exp(-u*u/2))
    return [x(u),y(v)]
  })
  const path=values.map((v,i)=>(i?'L':'M')+v[0].toFixed(2)+','+v[1].toFixed(2)).join(' ')
  return <div className="c2-graph">
    <strong>Curved metric's conformal factor</strong>
    <svg viewBox={'0 0 '+W+' '+H} role="img" aria-label="Smooth spatial conformal factor of the two-dimensional metric, peaked at its geodesic center.">
      <rect x={left} y={top} width={W-left-right} height={H-top-bottom} rx="5" fill="#0a1929"/>
      {[1,3,5,7].map(v=><g key={v}><line x1={left} x2={W-right} y1={y(v)} y2={y(v)} stroke="#304356" strokeDasharray="3 6"/><text x={left-8} y={y(v)+4} textAnchor="end" fontSize="11" fill="#95adbd">{v}</text></g>)}
      {[-3,-2,-1,0,1,2,3].map(u=><g key={u}><line x1={x(u)} x2={x(u)} y1={top} y2={H-bottom} stroke="#304356" strokeDasharray="3 6"/><text x={x(u)} y={H-bottom+18} textAnchor="middle" fontSize="11" fill="#95adbd">{u}</text></g>)}
      <path d={path} fill="none" stroke="#8ce8d7" strokeWidth="3"/>
      <circle cx={x(0)} cy={y(Math.exp(2*alpha))} r="5" fill="#ffbc8d"/>
      <text x={W-right} y={H-8} fill="#91adbc" fontSize="11" textAnchor="end">x / L</text>
    </svg>
    <p>Selected exact 1+1D background. The center at x=0 is a static geodesic, with zero proper acceleration.</p>
  </div>
}
export default function Curved2dLab(){
  const [alpha,setAlpha]=useState(0.5)
  const [logL,setLogL]=useState(6)
  const [logTau,setLogTau]=useState(-2)
  const [strength,setStrength]=useState(0.8)
  const L=10**logL,tau=10**logTau
  const q=useMemo(()=>curved2dBound(alpha,L,tau),[alpha,L,tau])
  const p=useMemo(()=>curved2dTrial(alpha,L,tau,strength*Math.abs(q.lower)),[alpha,L,tau,strength,q])
  const excluded=p.status==='excluded_for_selected_2d_field'
  const total=Math.abs(q.sampling)+Math.abs(q.curvature)
  const samplingShare=total?Math.abs(q.sampling)/total*100:0
  return <section className="c2-lab">
    <div className="c2-kicker"><Atom size={16}/> GENUINE CURVED-SPACETIME THEOREM • TWO DIMENSIONS</div>
    <h3>Curvature changes the quantum energy bound</h3>
    <p className="c2-intro">The original Flanagan inequality includes an observer-acceleration term and a Ricci-curvature term. We reproduce it for a free massless scalar along a geodesic through a smooth, globally conformal two-dimensional spacetime.</p>
    <div className="c2-columns">
      <div className="c2-controls">
        <label htmlFor="c2alpha">Conformal strength α <b>{alpha.toFixed(2)}</b></label>
        <input id="c2alpha" type="range" min="0" max="1" step="0.05" value={alpha} onChange={v=>setAlpha(Number(v.target.value))}/>
        <label htmlFor="c2length">Geometry width L <b>{normal(L)} m</b></label>
        <input id="c2length" type="range" min="4" max="8" step="0.1" value={logL} onChange={v=>setLogL(Number(v.target.value))}/>
        <label htmlFor="c2tau">Proper sampling half-width τ <b>{fmt(tau)} s</b></label>
        <input id="c2tau" type="range" min="-5" max="0" step="0.1" value={logTau} onChange={v=>setLogTau(Number(v.target.value))}/>
        <label htmlFor="c2strength">Hypothetical plateau strength <b>{strength.toFixed(2)}× bound</b></label>
        <input id="c2strength" type="range" min="0" max="2" step="0.05" value={strength} onChange={v=>setStrength(Number(v.target.value))}/>
        <div className="c2-equation">
          <small>EXACT CURVED 1+1D METRIC</small>
          ds²=e^(2σ)(−c²dt²+dx²)
          <small>SMOOTH CONFORMAL FACTOR</small>
          σ(x)=α exp[−x²/(2L²)]
          <small>GEODESIC CENTER'S CURVATURE</small>
          R(0)=2αe^(−2α)/L²
          <small>COMPACT SAMPLER GRADIENT</small>
          4I₁/I₀ = {normal(FLANAGAN_2D_GRADIENT)}
        </div>
        <GeometryPlot alpha={alpha}/>
      </div>
      <div className="c2-results">
        <div className="c2-distinction"><Info size={20}/><div><strong>Different physical dimensions. No 4D wormhole verdict.</strong><p>Every sampled energy below is in <b>J/m</b> (two-dimensional energy per length), not the J/m³ required for our four-dimensional wormhole.</p></div></div>
        <div className="c2-stats">
          <Stat name="RICCI SCALAR AT CENTER" value={fmt(q.ricci)+' m⁻²'} detail="Curved 2D geometry, zero acceleration"/>
          <Stat name="SAMPLING CONTRIBUTION" value={fmt(q.sampling)+' J/m'} detail="Flat component: ∝ τ⁻²"/>
          <Stat name="RICCI CURVATURE CONTRIBUTION" value={fmt(q.curvature)+' J/m'} detail="From published 2D theorem"/>
          <Stat name="TOTAL SAMPLED LOWER BOUND" value={fmt(q.lower)+' J/m'} detail="One free massless 2D scalar field"/>
        </div>
        <div className="c2-decomposition">
          <div><span>Sampling term</span><b>{samplingShare.toFixed(1)}%</b></div>
          <div><span>Curvature term</span><b>{(100-samplingShare).toFixed(1)}%</b></div>
          <div className="c2-bar"><span style={{width:samplingShare+'%'}}/><span style={{width:(100-samplingShare)+'%'}}/></div>
          <p>Fractional contributions to the mathematical lower bound, not a mixture of materials or experimental results.</p>
        </div>
        <div className={'c2-verdict '+(excluded?'c2-rejected':'')}><ShieldAlert size={20}/><div><strong>{excluded?'Toy plateau excluded for the chosen 2D field':'Toy plateau not excluded by one 2D inequality'}</strong><p>{excluded?'The sampled energy in this hypothetical profile is below the proven lower bound.':'A necessary bound does not establish that an admissible quantum state produces the profile.'}</p></div></div>
        <div className="c2-next">
          <strong>Research still unresolved</strong>
          <p>We have no constructed quantum source for the metric. Applying a separate four-dimensional curved-spacetime QEI, computing a renormalized state, and checking wormhole backreaction remain open.</p>
        </div>
      </div>
    </div>
    <div className="c2-sources">
      <BookOpen size={16}/>
      <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/QEI_CURVED_2D.md" target="_blank" rel="noreferrer">Derivation and test methodology <ArrowUpRight size={13}/></a>
      <a href="https://arxiv.org/pdf/gr-qc/0208066" target="_blank" rel="noreferrer">Flanagan corrected v4 <ArrowUpRight size={13}/></a>
      <a href="https://doi.org/10.1103/PhysRevD.102.129901" target="_blank" rel="noreferrer">2020 erratum <ArrowUpRight size={13}/></a>
    </div>
  </section>
}
