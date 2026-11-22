/** Quantitative Minkowski QEI; not a wormhole feasibility test. */
import { wormholeAt } from './wormhole.js'
const C=299792458, HBAR=6.62607015e-34/(2*Math.PI)
export const FR=3/(32*Math.PI**2)
export const FE=27/(2048*Math.PI**2)
export function flatBounds(tau){
  if(!Number.isFinite(tau)||tau<1e-24||tau>1e-3)throw new RangeError('tau outside [1e-24,1e-3] s')
  const scale=HBAR/(C**3*tau**4)
  return {fordRoman:-FR*scale,fewsterEveson:-FE*scale}
}
export function pulseTrial(tau,width,amplitude){
  const bounds=flatBounds(tau)
  if(!Number.isFinite(width)||width<1e-24||width>1e-3||!Number.isFinite(amplitude)||amplitude<0)
    throw new RangeError('invalid pulse')
  const avg=-amplitude*width/(width+tau)
  const ratio=Math.abs(avg/bounds.fewsterEveson)
  return {...bounds,average:avg,ratio,
    status:ratio>1+1e-12?'excluded_for_this_flat_field':ratio<1-1e-12?'not_excluded_by_one_bound':'roundoff_boundary',
    stateConstructed:false}
}
export function curvedGate(throat,ratio,tau){
  flatBounds(tau)
  const w=wormholeAt(throat,ratio)
  const length=1/Math.sqrt(Math.abs(w.ricciScalar))
  return {ricciLength:length,samplingLength:C*tau,scaleRatio:C*tau/length,
    localClassicalEnergyDensity:w.energyDensity,transferProven:false,
    qeiCompliance:null,backreactionEvaluated:false}
}
