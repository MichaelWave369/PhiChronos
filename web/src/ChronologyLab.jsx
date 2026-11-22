import React, { useMemo, useState } from 'react'
import { ArrowUpRight, Atom, BookOpen, GitCompare, Info, Network, ShieldAlert, Waves } from 'lucide-react'
import { quotientAnalysis, bellCnotPostselection } from './chronology.js'
import records from '../../research/ctc-constraints.json'

const f = (n, digits=2) => Number(n.toFixed(digits)).toLocaleString('en-US',{maximumFractionDigits:digits})
const descriptions = {
  timelike: {
    title:'Closed timelike generator in the quotient',
    note:'A future-directed timelike segment closes only because its endpoints were identified by the model. This is not a process for creating a physical time machine.',
    color:'chronology-timelike'
  },
  null: {
    title:'Closed null generator, not a CTC',
    note:'Lightlike separation closes under the imposed identification. It does not provide a massive observer with a timelike closed trajectory.',
    color:'chronology-null'
  },
  spacelike: {
    title:'Spatial cylinder: no closed causal generator',
    note:'The identification connects spacelike-separated events. A spatial compactification of flat 1+1D Minkowski space does not create time travel.',
    color:'chronology-spacelike'
  }
}

function QuotientDiagram({dt,dx,type}) {
  const w=440, h=336, midX=220, midY=168, scale=16.5
  const X=v=>midX+v*scale, Y=v=>midY-v*scale
  const bounds=[-9,-6,-3,0,3,6,9]
  return <svg className="quotient-diagram" viewBox="0 0 440 336" role="img"
    aria-label={'Covering spacetime diagram. The chosen '+type+' identification vector joins the origin with its assumed equivalent copy.'}>
    <defs>
      <marker id="quotient-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#ffa76c"/></marker>
      <clipPath id="quotient-clip"><rect x="47" y="20" width="346" height="292" rx="4"/></clipPath>
    </defs>
    <rect x="47" y="20" width="346" height="292" fill="#0a1827" stroke="#2c4157" rx="6"/>
    <g clipPath="url(#quotient-clip)">
      <polygon points={X(0)+','+Y(0)+' '+X(-11)+','+Y(11)+' '+X(11)+','+Y(11)} fill="#247163" opacity=".19"/>
      <polygon points={X(0)+','+Y(0)+' '+X(-11)+','+Y(-11)+' '+X(11)+','+Y(-11)} fill="#bc7c4a" opacity=".13"/>
      {bounds.map(a=><g key={a}><line x1={X(a)} y1="20" x2={X(a)} y2="312" stroke="#26384c" strokeDasharray="2 6"/><line x1="47" y1={Y(a)} x2="393" y2={Y(a)} stroke="#26384c" strokeDasharray="2 6"/></g>)}
      <line x1="47" y1={Y(0)} x2="393" y2={Y(0)} stroke="#778fa3" strokeWidth="1.6"/>
      <line x1={X(0)} y1="20" x2={X(0)} y2="312" stroke="#778fa3" strokeWidth="1.6"/>
      <line x1={X(-11)} y1={Y(-11)} x2={X(11)} y2={Y(11)} stroke="#86e9d8" strokeDasharray="6 5" strokeWidth="2"/>
      <line x1={X(-11)} y1={Y(11)} x2={X(11)} y2={Y(-11)} stroke="#86e9d8" strokeDasharray="6 5" strokeWidth="2"/>
      <line x1={X(0)} y1={Y(0)} x2={X(dx)} y2={Y(dt)} stroke="#ffa76c" strokeWidth="3.3" markerEnd="url(#quotient-arrow)"/>
      <circle cx={X(0)} cy={Y(0)} r="4.5" fill="#eaf5f5"/>
      <circle cx={X(dx)} cy={Y(dt)} r="5" fill="#ffa76c"/>
      <text x={X(dx)+9} y={Y(dt)-9} fill="#ffc497" fontSize="13" fontFamily="monospace">P'</text>
    </g>
    <text x="367" y={Y(0)-11} fill="#98aaba" fontSize="12">x</text>
    <text x={X(0)+11} y="36" fill="#98aaba" fontSize="12">ct</text>
    <text x={X(0)-12} y={Y(0)+19} fill="#98aaba" fontSize="12">P</text>
    <text x="220" y="329" textAnchor="middle" fill="#738ca2" fontSize="10">SPACE AND ct IN LIGHT-SECONDS</text>
  </svg>
}

function Geometry() {
  const [dt,setDt]=useState(5)
  const [dx,setDx]=useState(3)
  const [turns,setTurns]=useState(3)
  const valid=dt!==0 || dx!==0
  const r=valid?quotientAnalysis(dt,dx):null
  const summary=r?descriptions[r.type]:null
  const presets=[
    {label:'Timelike',dt:5,dx:3},
    {label:'Null',dt:5,dx:5},
    {label:'Spacelike',dt:1,dx:5},
    {label:'Periodic time',dt:5,dx:0}
  ]
  return <div className="chronology-inner">
    <div className="chronology-heading"><div><span className="eyebrow">MATHEMATICAL TOY / GLOBAL TOPOLOGY</span><h3>What makes a loop timelike?</h3><p>We identify the origin P with a shifted copy P′. Classification follows the Minkowski interval, not any physical mechanism that could create the identification.</p></div><Network size={29}/></div>
    <div className="chronology-preset-row">{presets.map(p=><button key={p.label} onClick={()=>{setDt(p.dt);setDx(p.dx)}}>{p.label}</button>)}</div>
    <div className="chronology-grid">
      <div className="chronology-settings">
        <label htmlFor="delta-ct">Shift in ct (light-seconds)<strong>{f(dt,1)}</strong></label>
        <input id="delta-ct" type="range" min="-8" max="8" step="0.25" value={dt} onChange={e=>setDt(Number(e.target.value))}/>
        <label htmlFor="delta-x">Shift in x (light-seconds)<strong>{f(dx,1)}</strong></label>
        <input id="delta-x" type="range" min="-8" max="8" step="0.25" value={dx} onChange={e=>setDx(Number(e.target.value))}/>
        <label htmlFor="windings">Number of illustrative windings<strong>{turns}</strong></label>
        <input id="windings" type="range" min="1" max="6" step="1" value={turns} onChange={e=>setTurns(Number(e.target.value))}/>
        <div className="chronology-formula">‖v‖² = (Δct)² − (Δx)²<small>Metric (+,−). Events differing by n·v are identified by assumption.</small></div>
        <div className="chronology-status" aria-live="polite">
          <strong>{summary?summary.title:'Zero vector: no identification'}</strong>
          <p>{summary?summary.note:'Choose a nonzero time or space shift to define a quotient.'}</p>
        </div>
      </div>
      <div className="chronology-visual">
        <QuotientDiagram dt={dt} dx={dx} type={r?.type||'undefined'}/>
        <div className="chronology-results">
          <div><span>GENERATOR CLASS</span><strong>{r?r.type:'undefined'}</strong></div>
          <div><span>INTERVAL, (light-seconds)²</span><strong>{r?f(r.norm,3):'—'}</strong></div>
          <div><span>PROPER TIME PER TURN</span><strong>{r&&r.properTimeSeconds!==null?f(r.properTimeSeconds,3)+' s':'not timelike'}</strong></div>
          <div><span>WINDING {turns} ENDPOINT (ct, x)</span><strong>{r?'('+f(turns*dt,2)+', '+f(turns*dx,2)+')':'—'}</strong></div>
        </div>
      </div>
    </div>
    <div className="chronology-caution"><ShieldAlert size={20}/><p><strong>Not a time-machine design.</strong> The covering-space events P and P′ are distinct, but become equivalent only after we impose the identification. The visualization solves no Einstein field equations, demonstrates no topology change, and supplies no physical mechanism to realize the quotient.</p></div>
  </div>
}

function Quantum() {
  const [p,setP]=useState(0.5)
  const [shots,setShots]=useState(1000)
  const r=bellCnotPostselection(p,shots)
  return <div className="chronology-inner">
    <div className="chronology-heading"><div><span className="eyebrow">QUANTUM INFORMATION / CONDITIONAL POSTSELECTION</span><h3>A simulated postselected time-loop model</h3><p>Explore a specific Bell-pair and CNOT circuit. Successful postselection keeps only part of an ordinary measurement record, rather than sending a message into the past.</p></div><Atom size={29}/></div>
    <div className="chronology-grid">
      <div className="chronology-settings">
        <label htmlFor="q-prob">Input probability of |0⟩<strong>{f(p*100,0)}%</strong></label>
        <input id="q-prob" type="range" min="0" max="1" step="0.01" value={p} onChange={e=>setP(Number(e.target.value))}/>
        <label htmlFor="q-shots">Hypothetical circuit trials<strong>{shots.toLocaleString()}</strong></label>
        <input id="q-shots" type="range" min="100" max="10000" step="100" value={shots} onChange={e=>setShots(Number(e.target.value))}/>
        <div className="chronology-formula">K = ⟨Φ⁺| CNOT |Φ⁺⟩ = |0⟩⟨0|<small>P(Bell success) = P(input |0⟩). Conditional output exists only if P(success) &gt; 0.</small></div>
        <div className="chronology-status"><strong>{r.outcomeDefined?'Conditional retained output: |0⟩':'No retained output exists'}</strong><p>{r.outcomeDefined?'The outcome is selected from successful trials. The failed trials are discarded and must be accounted for.':'At zero success probability, division by zero is undefined. This does not magically force an impossible event to occur.'}</p></div>
      </div>
      <div className="chronology-visual chronology-quantum">
        <div className="chronology-quantum-card"><div className="eyebrow">IDEALIZED CIRCUIT</div><div className="quantum-wires"><div><span>|ψ⟩</span><div className="wire">●</div><span>CR</span></div><div><span>|Φ⁺⟩</span><div className="wire">⊕</div><span>Bell projection</span></div><div><span>ancilla</span><div className="wire">◇</div><span>postselect</span></div></div><p>Conceptual circuit schematic, not a hardware run or a complete circuit diagram.</p></div>
        <div className="chronology-quantum-card"><div className="quantum-stats"><span>Success probability</span><strong>{f(p*100,1)}%</strong></div><div className="quantum-meter"><div style={{width:(p*100)+'%'}}/></div><div className="quantum-stats"><span>Expected retained trials</span><strong>{f(r.expectedAccepted,2)}</strong></div><div className="quantum-stats"><span>Expected discarded trials</span><strong>{f(r.expectedDiscarded,2)}</strong></div><p>These are analytical expectations, not random samples or experimental measurements.</p></div>
      </div>
    </div>
    <div className="chronology-caution"><Info size={19}/><p><strong>Interpretation boundary:</strong> P-CTC theory idealizes postselected teleportation. This implementation computes one effective conditional map with explicit success accounting. It does not demonstrate a spacetime CTC, violation of causality, or information transfer to the real past.</p></div>
  </div>
}

function Constraints() {
  const [active,setActive]=useState('all')
  const filtered = useMemo(()=>active==='all'?records.entries:records.entries.filter(r=>r.status===active),[active])
  const statuses=[
    ['all','All models'],['mathematical-model','Exact/ideal metrics'],['hypothetical-physical-mechanism','Conditional physics'],['conjecture-not-theorem','Obstructions'],['illustrative-toy-model','Toy']
  ]
  return <div className="constraint-section">
    <div className="chronology-heading"><div><span className="eyebrow">EVIDENCE LEDGER / THEORY ≠ ENGINEERING</span><h3>Candidate models and their constraints</h3><p>Every entry includes assumptions, physical obstacles, research status, and references. The source of truth is maintained as structured evidence in the repository.</p></div><BookOpen size={29}/></div>
    <div className="chronology-preset-row">{statuses.map(([key,label])=><button key={key} className={active===key?'selected':''} onClick={()=>setActive(key)}>{label}</button>)}</div>
    <div className="constraint-list">{filtered.map(entry=><article key={entry.id}>
      <div className="constraint-card-title"><div><span className="constraint-tag">{entry.status.replaceAll('-',' ').toUpperCase()}</span><h4>{entry.name}</h4><small>{entry.kind}</small></div><span className="constraint-id">{entry.id}</span></div>
      <p>{entry.claim}</p><dl><div><dt>Required assumptions</dt><dd>{entry.assumptions}</dd></div><div><dt>Physical obstacle</dt><dd>{entry.obstacles}</dd></div><div><dt>Energy / stability</dt><dd>{entry.energy}</dd></div><div><dt>Research next step</dt><dd>{entry.next_check}</dd></div></dl><div className="constraint-sources">{entry.sources.map((source,i)=><a href={source} target="_blank" rel="noreferrer" key={source}>Source {i+1} <ArrowUpRight size={14}/></a>)}</div>
    </article>)}</div>
  </div>
}
export default function ChronologyLab() {
  const [mode,setMode]=useState('geometry')
  return <div className="chronology-lab">
    <div className="chronology-subtabs"><button className={mode==='geometry'?'active':''} onClick={()=>setMode('geometry')}><Waves size={16}/> Geometry quotient</button><button className={mode==='quantum'?'active':''} onClick={()=>setMode('quantum')}><Atom size={16}/> Quantum postselection</button><button className={mode==='constraints'?'active':''} onClick={()=>setMode('constraints')}><GitCompare size={16}/> Constraints ledger</button></div>
    {mode==='geometry'?<Geometry/>:mode==='quantum'?<Quantum/>:<Constraints/>}
    <a className="chronology-doc" target="_blank" rel="noreferrer" href="https://github.com/MichaelWave369/PhiChronos/blob/main/docs/CHRONOLOGY_MODEL.md">Methodology & reproducibility <ArrowUpRight size={15}/></a>
  </div>
}
