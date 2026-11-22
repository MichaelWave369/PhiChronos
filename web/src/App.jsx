import React, { useState } from 'react'
import CausalityLab from './CausalityLab.jsx'
import ChronologyLab from './ChronologyLab.jsx'
import WormholeLab from './WormholeLab.jsx'
import { ArrowUpRight, Atom, BookOpen, CheckCircle2, ChevronRight, CircleDot, Clock3, Github, Orbit, ShieldCheck, Sparkles, Waves } from 'lucide-react'

const C = 299792458
const G = 9.80665
const sourceLinks = [
  { name: 'NIST • Einstein and atomic clocks', meta: 'Experimental', url: 'https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test' },
  { name: 'NIST • Relativity and optical clocks', meta: '2010 measurement', url: 'https://www.nist.gov/publications/relativity-and-optical-clocks' },
  { name: 'Closed timelike curves • survey', meta: '2021 review', url: 'https://doi.org/10.3390/universe7010012' },
  { name: 'Postselected time-loop simulation', meta: '2026 PR Research', url: 'https://doi.org/10.1103/tm83-sxpm' },
  { name: 'Retrocausal capacity of quantum channels', meta: '2026 PR Letters', url: 'https://doi.org/10.1103/znyd-npk5' },
  { name: 'Morris–Thorne wormhole geometry', meta: 'Original AJP • 1988', url: 'https://doi.org/10.1119/1.15620' },
  { name: 'Ford–Roman quantum inequality limits', meta: 'PRD • 1996', url: 'https://doi.org/10.1103/PhysRevD.53.5496' },
  { name: 'Chronology protection conjecture', meta: 'Hawking • 1992', url: 'https://doi.org/10.1103/PhysRevD.46.603' },
  { name: 'Wormholes and the weak energy condition', meta: 'Morris, Thorne & Yurtsever • 1988', url: 'https://doi.org/10.1103/PhysRevLett.61.1446' },
  { name: 'Quantum energy inequality restrictions', meta: 'Review • 2024', url: 'https://doi.org/10.3390/universe10070291' },
]
const fmt = (n, digits=3) => Number.isFinite(n) ? n.toLocaleString('en-US', {maximumFractionDigits:digits}) : 'n/a'
const scientific = (n) => Number(n).toExponential(2).replace('e+', ' × 10^')
function LorentzChart({ beta }) {
  const w=680,h=230,p=36
  const curve = Array.from({length:200},(_,i)=>{
    const b=i/199*0.995
    const gamma=1/Math.sqrt(1-b*b)
    const x=p+(w-p*2)*(b/0.995)
    const y=h-p-(h-p*2)*Math.min(gamma/11,1)
    return (i===0?'M':'L')+x.toFixed(2)+','+y.toFixed(2)
  }).join(' ')
  const gamma=1/Math.sqrt(1-beta*beta)
  const px=p+(w-p*2)*beta/0.995
  const py=h-p-(h-p*2)*Math.min(gamma/11,1)
  return <svg viewBox={'0 0 '+w+' '+h} role="img" aria-label="Lorentz gamma increases with speed. Marker indicates selected speed." className="plot">
    {[0,1,2,3,4].map(i=><line key={i} x1={p} y1={p+i*(h-2*p)/4} x2={w-p} y2={p+i*(h-2*p)/4} stroke="#23344a" strokeDasharray="3 8"/>)}
    <path d={curve} fill="none" stroke="#7ee7da" strokeWidth="3.4" strokeLinecap="round"/>
    <line x1={px} y1={p} x2={px} y2={h-p} stroke="#ffc378" strokeWidth="1.5" strokeDasharray="5 5"/>
    <circle cx={px} cy={py} r="6" fill="#ffc378" stroke="#0b1323" strokeWidth="3"/>
    <text x={p} y={h-7}>0c</text><text x={w/2} y={h-7} textAnchor="middle">0.5c</text><text x={w-p} y={h-7} textAnchor="end">~c</text>
    <text x={p+5} y={p-12}>γ (Lorentz factor)</text>
  </svg>
}
function Tag({children,kind='blue'}) {return <span className={'tag '+kind}>{children}</span>}
function PanelTitle({overline,title,children}) {return <div className="section-title"><div><div className="eyebrow">{overline}</div><h2>{title}</h2></div>{children}</div>}
function Stat({label,value,sub}) {return <div className="stat"><div className="stat-label">{label}</div><strong>{value}</strong><span>{sub}</span></div>}
function App(){
  const [beta,setBeta]=useState(0.99)
  const [earthYears,setEarthYears]=useState(10)
  const [mass,setMass]=useState(1000)
  const [height,setHeight]=useState(100)
  const [tab,setTab]=useState('velocity')
  const gamma=1/Math.sqrt((1-beta)*(1+beta))
  const traveler=earthYears/gamma
  const kinetic=(gamma-1)*mass*C*C
  const gainNs=G*height/(C*C)*86400*1e9
  const ahead=earthYears-traveler
  return <div className="app-shell">
    <header className="nav"><a className="brand" href="#home"><span className="mark">Φ</span><span>Phi<span className="brand-accent">Chronos</span><small>PHI369 LABS / OPEN RESEARCH</small></span></a><div className="nav-right"><a href="#lab">The Lab</a><a href="#evidence">Evidence</a><a className="repo" href="https://github.com/MichaelWave369/PhiChronos" target="_blank" rel="noreferrer"><Github size={17}/> GitHub <ArrowUpRight size={14}/></a></div></header>
    <main id="home">
      <div className="hero"><div className="hero-content">
        <div className="hero-pill"><span className="pulse"/> RESEARCH LAB / INITIAL EXPERIMENTS LIVE</div>
        <h1>Time is real.<br/><em>So are the questions.</em></h1>
        <p className="lead">An open computational laboratory investigating relativistic time dilation, the geometry of causality, and whether time travel is an engineering problem or a physical impossibility.</p>
        <div className="hero-links"><a className="primary" href="#lab">Enter the lab <ChevronRight size={18}/></a><a className="secondary" href="#evidence">Explore the evidence <ArrowUpRight size={17}/></a></div>
        <div className="hero-meta"><span><CheckCircle2 size={15}/> Tested numerical models</span><span><ShieldCheck size={15}/> Evidence-first research</span><span><BookOpen size={15}/> Open source</span></div>
      </div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-a"/><div className="orbit orbit-b"/><div className="orbit orbit-c"/><div className="center-glow">Φ</div><div className="orbit-caption">SPACE / TIME / CAUSALITY</div></div></div>
      <section className="status-row" aria-label="Research status"><div><span className="status-led measured"/><strong>Measured physics</strong><p>Clock-rate effects confirmed</p></div><div><span className="status-led modeled"/><strong>Theoretical models</strong><p>Causal geometries studied</p></div><div><span className="status-led unknown"/><strong>Open question</strong><p>Backward travel not demonstrated</p></div></section>
      <section id="lab" className="lab-section"><PanelTitle overline="01 / INTERACTIVE EXPERIMENTS" title="The computational lab"><span className="version">ENGINE v0.4.0</span></PanelTitle>
        <div className="tabs"><button className={tab==='velocity'?'active':''} onClick={()=>setTab('velocity')}><Orbit size={17}/> Velocity & time</button><button className={tab==='gravity'?'active':''} onClick={()=>setTab('gravity')}><Waves size={17}/> Gravity & clocks</button><button className={tab==='causality'?'active':''} onClick={()=>setTab('causality')}><Orbit size={17}/> Spacetime & causality</button><button className={tab==='chronology'?'active':''} onClick={()=>setTab('chronology')}><Atom size={17}/> Chronology protection</button><button className={tab==='wormhole'?'active':''} onClick={()=>setTab('wormhole')}><Waves size={17}/> Wormhole constraints</button></div>
        {tab==='velocity' ? <div className="experiment"><div className="controls"><Tag kind="green">ESTABLISHED PHYSICS</Tag><h3>Travel into the future</h3><p>Compare ideal clocks in relative inertial motion. This is an actual prediction of special relativity, not a feasible spacecraft plan.</p>
          <div className="control"><label htmlFor="beta">Speed relative to Earth <strong>{(beta*100).toFixed(2)}% c</strong></label><input id="beta" type="range" min="0" max="0.995" step="0.001" value={beta} onChange={e=>setBeta(Number(e.target.value))}/><div className="range-labels"><span>0% c</span><span>99.5% c</span></div></div>
          <div className="control"><label htmlFor="years">Years passing on Earth <strong>{earthYears}</strong></label><input id="years" type="range" min="1" max="100" step="1" value={earthYears} onChange={e=>setEarthYears(Number(e.target.value))}/></div>
          <div className="control"><label htmlFor="mass">Ideal payload mass <strong>{fmt(mass,0)} kg</strong></label><input id="mass" type="range" min="100" max="10000" step="100" value={mass} onChange={e=>setMass(Number(e.target.value))}/></div>
          <div className="formula">γ = 1 / √(1 − v²/c²) <small>Flat spacetime · constant speed · no acceleration</small></div>
        </div><div className="results"><div className="results-title"><span>MODEL OUTPUT</span><CircleDot size={16}/></div><div className="stat-grid"><Stat label="EARTH TIME" value={fmt(earthYears,1)+' years'} sub="Reference frame"/><Stat label="TRAVELER TIME" value={fmt(traveler,3)+' years'} sub="Elapsed onboard"/><Stat label="TIME DIFFERENCE" value={fmt(ahead,3)+' years'} sub="Earth ahead of traveler"/><Stat label="LORENTZ FACTOR" value={fmt(gamma,3)+'×'} sub="Relative clock factor"/></div><div className="chart"><div className="chart-head"><strong>Time dilation curve</strong><span>γ vs speed / c</span></div><LorentzChart beta={beta}/></div><div className="energy"><span>Ideal translational kinetic energy</span><strong>{scientific(kinetic)} J</strong><small>Excludes acceleration phases, fuel, propulsion losses and deceleration. Not an energy budget for a vehicle.</small></div></div></div>
        : tab==='gravity' ? <div className="experiment"><div className="controls"><Tag kind="green">ESTABLISHED PHYSICS</Tag><h3>Gravity changes clocks</h3><p>A higher stationary clock near Earth's surface ticks slightly faster than a lower one. Here we use a first-order weak-field approximation.</p><div className="control"><label htmlFor="height">Height above reference <strong>{fmt(height,0)} m</strong></label><input id="height" type="range" min="0" max="5000" step="1" value={height} onChange={e=>setHeight(Number(e.target.value))}/></div><div className="formula">Δt/t ≈ gh / c² <small>Constant surface gravity · local comparison · no orbit effects</small></div></div><div className="results"><div className="results-title"><span>MODEL OUTPUT</span><Clock3 size={16}/></div><div className="stat-grid"><Stat label="HEIGHT DIFFERENCE" value={fmt(height,0)+' m'} sub="Above reference clock"/><Stat label="GAIN PER DAY" value={fmt(gainNs,4)+' ns'} sub="Higher clock accumulates more time"/><Stat label="GAIN PER YEAR" value={fmt(gainNs*365.25,3)+' ns'} sub="Approximate 365.25-day year"/><Stat label="RELATIVE RATE SHIFT" value={(G*height/(C*C)).toExponential(2)} sub="Dimensionless fractional shift"/></div><div className="altitude-graphic"><div className="ground"><div className="tower" style={{height:Math.max(28,height/5000*165)+'px'}}><span className="clock-icon">◷</span></div></div><p>Clock comparisons at different elevations measure tiny differences in elapsed time.</p></div><div className="energy"><span>Scope note</span><small>This is not the timing model for an orbiting satellite. GPS also requires satellite velocity and gravitational potential corrections.</small></div></div></div> : tab==='causality' ? <CausalityLab /> : tab==='wormhole' ? <WormholeLab /> : <ChronologyLab />}
      </section>
      <section className="mission"><div className="mission-top"><div><div className="eyebrow">02 / WHAT WE KNOW</div><h2>Three different kinds<br/>of possibility.</h2></div><p>We track the difference between a measurement, a mathematical model, and a claim that has yet to survive testing.</p></div><div className="mission-cards"><article><div className="card-icon"><Clock3/></div><Tag kind="green">MEASURED</Tag><h3>Forward time dilation</h3><p>Different clock histories lead to different accumulated time. Repeated experimental support.</p><span className="index">01</span></article><article><div className="card-icon"><Orbit/></div><Tag kind="amber">THEORETICAL</Tag><h3>Closed timelike curves</h3><p>Some spacetime metrics admit loops in time. The required physical conditions remain unresolved.</p><span className="index">02</span></article><article><div className="card-icon"><Atom/></div><Tag kind="violet">SIMULATED</Tag><h3>Quantum CTC models</h3><p>Postselected circuits can emulate model predictions. No verified communication with the actual past.</p><span className="index">03</span></article></div></section>
      <section id="evidence" className="evidence"><PanelTitle overline="03 / PUBLICATIONS & SOURCE CONTROL" title="Follow the evidence"><span className="version">PRIMARY SOURCES</span></PanelTitle><div className="sources">{sourceLinks.map((source,i)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer"><div className="source-index">{String(i+1).padStart(2,'0')}</div><div><strong>{source.name}</strong><span>{source.meta}</span></div><ArrowUpRight size={18}/></a>)}</div></section>
      <section className="closing"><Sparkles size={23}/><h2>We don't need to pretend<br/>the impossible is possible.</h2><p>We need to discover whether it actually is.</p><a href="https://github.com/MichaelWave369/PhiChronos" target="_blank" rel="noreferrer">Join the open investigation <ArrowUpRight size={17}/></a></section>
    </main><footer><div><span className="mark-small">Φ</span><strong>PhiChronos</strong><span> PHI369 LABS</span></div><span>Reproducible physics. Extraordinary questions. No shortcuts.</span><a href="https://github.com/MichaelWave369/PhiChronos">Source code <ArrowUpRight size={13}/></a></footer>
  </div>
}
export default App
