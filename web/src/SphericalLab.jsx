import React,{useMemo,useState} from 'react'
import {ArrowUpRight,Atom,BookOpen,CheckCircle2,Info,ShieldAlert,Waves} from 'lucide-react'
import {partialAngular,sphericalWightman,ellisInfrared} from './sphericalReference.js'
import './sphericalLab.css'
const sci=n=>Number.isFinite(n)?n.toExponential(3).replace('e+',' × 10^').replace('e-',' × 10^-'):'n/a'
const fmt=n=>Number(n.toPrecision(5)).toLocaleString('en-US',{maximumFractionDigits:5})
function Item({name,value,note}){return <div className="spl-stat"><span>{name}</span><strong>{value}</strong><small>{note}</small></div>}

function ModePlot({a,b,mu,ell}){
  const W=700,H=270,p={l:49,r:18,t:22,b:42}
  const xmax=25
  const px=k=>p.l+k/xmax*(W-p.l-p.r)
  const py=v=>p.t+(1.05-v)/2.1*(H-p.t-p.b)
  const d=Math.sqrt(Math.max(0,a*a+b*b-2*a*b*mu))
  const values=Array.from({length:160},(_,i)=>{
    const k=i*xmax/159, z=k*d
    return {k,partial:partialAngular(k,a,b,mu,ell),full:z===0?1:Math.sin(z)/z}
  })
  const path=name=>values.map((v,i)=>(i?'L':'M')+px(v.k).toFixed(2)+','+py(v[name]).toFixed(2)).join(' ')
  return <div className="spl-chart">
    <div className="spl-chart-head"><strong>Spherical modes reconstruct the angular kernel</strong><span>Σℓ vs sinc(kd)</span></div>
    <svg viewBox={'0 0 '+W+' '+H} role="img" aria-label="Comparison of finite spherical angular mode sum with the exact sinc of wave number times separation.">
      <rect x={p.l} y={p.t} width={W-p.l-p.r} height={H-p.t-p.b} fill="#0a1c2b" rx="4"/>
      {[-1,-.5,0,.5,1].map(v=><g key={v}><line x1={p.l} x2={W-p.r} y1={py(v)} y2={py(v)} stroke="#2c4457" strokeDasharray="3 6"/><text x={p.l-9} y={py(v)+4} fill="#94acbe" fontSize="11" textAnchor="end">{v}</text></g>)}
      {[0,5,10,15,20,25].map(k=><g key={k}><line x1={px(k)} x2={px(k)} y1={p.t} y2={H-p.b} stroke="#294357" strokeDasharray="3 6"/><text x={px(k)} y={H-p.b+18} fill="#95adbb" fontSize="11" textAnchor="middle">{k}</text></g>)}
      <path d={path('full')} fill="none" stroke="#f5be90" strokeWidth="2.5" strokeDasharray="5 6"/>
      <path d={path('partial')} fill="none" stroke="#89e5d8" strokeWidth="3.2"/>
      <text x={W-p.r} y={H-9} textAnchor="end" fill="#8cacba" fontSize="11">k (m⁻¹)</text>
    </svg>
    <div className="spl-legend"><span><i style={{background:'#89e5d8'}}/> ℓ ≤ {ell}</span><span><i style={{background:'#f5be90'}}/> Exact sinc(kd)</span></div>
    <p>Increasing angular modes improves this *flat-spacetime* identity. A finite cutoff does not rigorously establish a complete curved quantum mode basis.</p>
  </div>
}
function WightmanSpherical(){
  const [a,setA]=useState(.7),[b,setB]=useState(.9),[mu,setMu]=useState(.4)
  const [ct,setCt]=useState(.3),[eps,setEps]=useState(.5),[ell,setEll]=useState(24)
  const result=useMemo(()=>sphericalWightman(a,b,mu,ct,eps,ell,80,1024),[a,b,mu,ct,eps,ell])
  const analyticAbs=Math.hypot(result.analyticReal,result.analyticImag)
  const rel=result.analyticDelta/Math.max(1e-15,analyticAbs)
  return <div className="spl-content">
    <div className="spl-heading"><div className="spl-kicker"><Atom size={17}/> FOUR-DIMENSIONAL MINKOWSKI VACUUM • SPHERICAL PARTIAL-WAVE CALIBRATION</div>
      <h3>Build the vacuum correlation one angular mode at a time</h3>
      <p>We independently reconstruct the known flat-space four-dimensional Wightman correlation by summing spherical Bessel and Legendre waves, then compare against both the direct spectral integral and the exact analytic result.</p>
    </div>
    <div className="spl-layout"><div className="spl-controls">
      <label htmlFor="spl-a">First radial coordinate <b>{a.toFixed(2)} m</b></label>
      <input id="spl-a" type="range" min=".2" max="1.5" step=".05" value={a} onChange={e=>setA(Number(e.target.value))}/>
      <label htmlFor="spl-b">Second radial coordinate <b>{b.toFixed(2)} m</b></label>
      <input id="spl-b" type="range" min=".2" max="1.5" step=".05" value={b} onChange={e=>setB(Number(e.target.value))}/>
      <label htmlFor="spl-angle">Angle cosine cos γ <b>{mu.toFixed(2)}</b></label>
      <input id="spl-angle" type="range" min="-1" max="1" step=".05" value={mu} onChange={e=>setMu(Number(e.target.value))}/>
      <label htmlFor="spl-ct">Time displacement Δct <b>{ct.toFixed(2)} m</b></label>
      <input id="spl-ct" type="range" min="-1" max="1" step=".05" value={ct} onChange={e=>setCt(Number(e.target.value))}/>
      <label htmlFor="spl-eps">Regulator ε <b>{eps.toFixed(2)} m</b></label>
      <input id="spl-eps" type="range" min=".3" max="1" step=".05" value={eps} onChange={e=>setEps(Number(e.target.value))}/>
      <label htmlFor="spl-ell">Angular mode cutoff ℓmax <b>{ell}</b></label>
      <input id="spl-ell" type="range" min="0" max="32" step="1" value={ell} onChange={e=>setEll(Number(e.target.value))}/>
      <div className="spl-equations"><small>RAYLEIGH / SPHERICAL ADDITION THEOREM</small>sinc(kd) = Σℓ(2ℓ+1)jℓ(ka)jℓ(kb)Pℓ(cosγ)<small>SPATIAL SEPARATION</small>d²=a²+b²−2ab cosγ<small>VACUUM TWO-POINT FUNCTION</small>Wε = ∫₀∞ dk k e^(−εk−ikΔct) Σℓ…/(4π²)<small>REFERENCE UNITS</small>ℏ=c=1; W in m⁻²</div>
    </div><div className="spl-results">
      <div className="spl-stats">
        <Item name="FLAT SPATIAL SEPARATION" value={fmt(result.separation)+' m'} note="Euclidean geometry, not a wormhole distance"/>
        <Item name="SPHERICAL MODE RECONSTRUCTION" value={sci(result.real)+' + i('+sci(result.imag)+')'} note="Computed from truncated ℓ series"/>
        <Item name="EXACT 4D VACUUM" value={sci(result.analyticReal)+' + i('+sci(result.analyticImag)+')'} note="Minkowski positive-frequency reference"/>
        <Item name="RELATIVE MODE-TO-EXACT ERROR" value={sci(rel)} note="Contains angular, k-cutoff and quadrature errors"/>
        <Item name="MODE SUM vs DIRECT SPECTRAL" value={sci(result.directDelta)} note="Independent angular-integrated quadrature"/>
        <Item name="K-CUTOFF TAIL BOUND" value={sci(result.cutoffTail)} note="Does not bound angular ℓ truncation"/>
      </div>
      <div className="spl-note"><Info size={21}/><div><strong>Flat-space calibration only</strong><p>The exact Wightman reference includes all modes analytically. Our finite spherical sum approaches it as angular resolution increases; this is NOT yet an Ellis wormhole Wightman function.</p></div></div>
      <ModePlot a={a} b={b} mu={mu} ell={ell}/>
      <div className="spl-conditions"><strong>Conditions not satisfied for a curved quantum vacuum</strong><p>All-angular two-ended Ellis mode normalization • globally complete basis • Hadamard ultraviolet structure • renormalized stress tensor • semiclassical Einstein equation.</p></div>
    </div></div>
  </div>
}
function InfraredPlot({throat,width}){
  const W=700,H=260,p={l:55,r:21,t:20,b:42}
  const logMin=0,logMax=6
  const points=Array.from({length:37},(_,i)=>{
    const logW=i/36*6,w=10**logW
    return {x:logW,y:Math.log10(ellisInfrared(throat,w).quotient)}
  })
  const min=-19,max=3
  const px=v=>p.l+(v-logMin)/(logMax-logMin)*(W-p.l-p.r)
  const py=v=>H-p.b-(v-min)/(max-min)*(H-p.t-p.b)
  const path=points.map((z,i)=>(i?'L':'M')+px(z.x).toFixed(2)+','+py(z.y).toFixed(2)).join(' ')
  const q=Math.log10(ellisInfrared(throat,width).quotient)
  return <div className="spl-chart"><div className="spl-chart-head"><strong>Massless spatial-operator Rayleigh sequence</strong><span>log₁₀ Q vs log₁₀ W</span></div>
    <svg viewBox={'0 0 '+W+' '+H} role="img" aria-label="Logarithmic Rayleigh quotient of compactly supported radial wave packets falls toward zero as their width increases.">
      <rect x={p.l} y={p.t} width={W-p.l-p.r} height={H-p.t-p.b} rx="5" fill="#0b1b2a"/>
      {[-15,-10,-5,0].map(v=><g key={v}><line x1={p.l} x2={W-p.r} y1={py(v)} y2={py(v)} stroke="#304454" strokeDasharray="3 6"/><text x={p.l-7} y={py(v)+4} fontSize="11" fill="#95adbd" textAnchor="end">{v}</text></g>)}
      {[0,1,2,3,4,5,6].map(v=><g key={v}><line x1={px(v)} x2={px(v)} y1={p.t} y2={H-p.b} stroke="#304454" strokeDasharray="3 6"/><text x={px(v)} y={H-p.b+18} fontSize="11" fill="#95adbd" textAnchor="middle">{v}</text></g>)}
      <path d={path} stroke="#8ce4d7" strokeWidth="3" fill="none"/>
      <line x1={px(Math.log10(width))} x2={px(Math.log10(width))} y1={p.t} y2={H-p.b} stroke="#f2bc87" strokeDasharray="5 6"/>
      <circle cx={px(Math.log10(width))} cy={py(q)} r="5" fill="#f5c69d" stroke="#0a1726" strokeWidth="2"/>
      <text x={W-p.r} y={H-9} textAnchor="end" fontSize="11" fill="#9cb2bf">log₁₀ width (m)</text>
    </svg>
    <p>As the smooth radial packet spreads far along one asymptotically flat end, its gradient-to-norm ratio falls approximately like W⁻².</p>
  </div>
}
function InfraredAudit(){
  const [logW,setLogW]=useState(2),[logThroat,setLogThroat]=useState(0)
  const W=10**logW,throat=10**logThroat
  const out=useMemo(()=>ellisInfrared(throat,W),[throat,W])
  const next=useMemo(()=>ellisInfrared(throat,W*2),[throat,W])
  return <div className="spl-content"><div className="spl-heading">
    <div className="spl-kicker"><Waves size={16}/> CURVED ELLIS SPATIAL SLICE • RIGOROUS VARIATIONAL TEST FAMILY</div>
    <h3>Probe the low-frequency end of the massless field</h3>
    <p>Instead of assuming a positive gap in the massless field's spectrum, test the spatial Klein–Gordon operator with smooth wave packets supported far down one wormhole end. Their nonnegative energy-to-norm ratio approaches zero as the packet width increases.</p>
    </div><div className="spl-layout"><div className="spl-controls">
      <label htmlFor="spl-width">Wave-packet width W <b>{fmt(W)} m</b></label>
      <input id="spl-width" type="range" min="0" max="6" step=".1" value={logW} onChange={e=>setLogW(Number(e.target.value))}/>
      <label htmlFor="spl-throat">Assumed throat radius r₀ <b>{fmt(throat)} m</b></label>
      <input id="spl-throat" type="range" min="-1" max="3" step=".1" value={logThroat} onChange={e=>setLogThroat(Number(e.target.value))}/>
      <div className="spl-equations"><small>COMPLETE ELLIS SPATIAL GEOMETRY</small>h = dl² + (l²+r₀²)dΩ²<small>SMOOTH RADIAL TRIAL FUNCTION</small>ψW(l)=b((l−12W)/W)<small>RAYLEIGH QUOTIENT OF −Δh</small>Q=∫R²|ψ′|²dl / ∫R²|ψ|²dl<small>VARIATIONAL SCALING</small>Q ∼ 3.084965/W² as W ≫ r₀</div>
      <div className="spl-note"><ShieldAlert size={20}/><div><strong>Gapless does not mean impossible</strong><p>No strictly positive spectral gap does not mean the spatial operator has a normalizable zero eigenmode or that the massless field lacks a physically admissible quantum vacuum.</p></div></div>
    </div><div className="spl-results">
      <div className="spl-stats">
        <Item name="RAYLEIGH QUOTIENT" value={sci(out.quotient)+' m⁻²'} note="Gradient energy divided by norm"/>
        <Item name="WIDTH-RESCALED QUOTIENT" value={fmt(out.widthScaled)} note="Approaches a finite positive constant"/>
        <Item name="SUPPORT ON RIGHT END" value={fmt(out.packetLeft)+' to '+fmt(out.packetRight)+' m'} note="Compact, stays away from throat"/>
        <Item name="2× WIDTH REDUCTION FACTOR" value={fmt(out.quotient/next.quotient)+'×'} note="Approaches four at large W/r₀"/>
      </div>
      <div className="spl-note"><CheckCircle2 size={21}/><div><strong>Nonnegative operator, no uniform positive lower bound</strong><p>A valid compactly supported trial sequence with Q→0 establishes the spectral infimum is zero. This is a mathematical fact of the fixed Ellis geometry, not a claim that a quantum state cannot exist.</p></div></div>
      <InfraredPlot throat={throat} width={W}/>
      <div className="spl-conditions"><strong>Still open</strong><p>Ellis global mode completeness, a Hadamard two-point function, infrared behavior of that particular state, stress renormalization, the curved 4D QEI and semiclassical backreaction.</p></div>
    </div></div>
  </div>
}
export default function SphericalLab(){
  const [tab,setTab]=useState('spherical')
  return <section className="spl-root">
    <div className="spl-tabs"><button className={tab==='spherical'?'active':''} onClick={()=>setTab('spherical')}><Atom size={16}/> Spherical vacuum calibration</button>
    <button className={tab==='infrared'?'active':''} onClick={()=>setTab('infrared')}><Waves size={16}/> Ellis infrared audit</button></div>
    {tab==='spherical'?<WightmanSpherical/>:<InfraredAudit/>}
    <div className="spl-footer"><BookOpen size={16}/>
      <a href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/SPHERICAL_REFERENCE_AND_IR.md" target="_blank" rel="noreferrer">Full derivation and limitations <ArrowUpRight size={14}/></a>
      <a href="https://dlmf.nist.gov/10.60" target="_blank" rel="noreferrer">NIST spherical Bessel identities <ArrowUpRight size={14}/></a>
      <a href="https://github.com/MichaelWave369/PhiChronos/issues/8" target="_blank" rel="noreferrer">Open curved-state research <ArrowUpRight size={14}/></a>
    </div>
  </section>
}
