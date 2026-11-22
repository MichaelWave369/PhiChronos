/** Finite-support smooth-bump QEI for free massless scalar in 4D Minkowski.
 * Domain: inertial worldline, vacuum normal ordering, flat spacetime only.
 * Published derivative form: -hbar/(16pi^2 c^3) ∫ |g''(t)|² dt.
 */
import { wormholeAt } from './wormhole.js'

const C=299792458, HBAR=6.62607015e-34/(2*Math.PI)
function raw(u) {
  if(!Number.isFinite(u)) throw new RangeError('non-finite sample coordinate')
  if(Math.abs(u)>=1) return [0,0]
  const z=(1-u)*(1+u)
  const b=Math.exp(-1/z)
  return [b,b*(6*u**4-2)/(z**4)]
}
function integrated(n=4096) {
  const h=2/n
  let i0=0,i2=0
  for(let k=1;k<n;k++){
    const [b,pp]=raw(-1+k*h)
    const w=k%2?4:2
    i0+=w*b*b;i2+=w*pp*pp
  }
  return {i0:i0*h/3,i2:i2*h/3}
}
const NORMALS=integrated()
export const BUMP_COEFFICIENT=NORMALS.i2/NORMALS.i0
export const BUMP_NORM=NORMALS.i0
export function shapeWeight(u) {
  return raw(u)[0]**2/BUMP_NORM
}
export function compactQei(tau) {
  if(!Number.isFinite(tau)||tau<1e-24||tau>1e-3) throw new RangeError('tau outside numerical domain')
  return {
    coefficient:BUMP_COEFFICIENT,
    lower:-HBAR/(16*Math.PI**2*C**3*tau**4)*BUMP_COEFFICIENT,
    supportSeconds:2*tau,
    curvedTransferProven:false,
  }
}
export function compactPlateau(tau,amplitude) {
  const r=compactQei(tau)
  if(!Number.isFinite(amplitude)||amplitude<0)throw new RangeError('amplitude must be nonnegative')
  const fraction=amplitude/Math.abs(r.lower)
  return {...r,trialMean:-amplitude,fraction,
    status:fraction>1+1e-12?'excluded_for_this_flat_field':
      fraction<1-1e-12?'not_excluded_by_one_bound':'roundoff_boundary',
    constructedState:false}
}
export function curvatureGate(throat,ratio,tau){
  compactQei(tau)
  const w=wormholeAt(throat,ratio)
  const k=(throat/w.r)**2/(w.r*w.r)
  const componentLength=1/Math.sqrt(k)
  return {
    ricci:-2*k,kretschmann:12*k*k,
    radialAngularSection:-k,angularSection:k,
    componentCurvatureLength:componentLength,
    ricciLength:1/Math.sqrt(2*k),
    kretschmannLength:(12*k*k)**(-0.25),
    samplingLength:C*tau,scaleRatio:C*tau/componentLength,
    quantumStateKnown:false,flatQeiApplicable:false,
    qeiCompliance:null,backreactionEvaluated:false,
  }
}
