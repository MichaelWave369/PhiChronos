/** Genuine 2D curved-spacetime quantum inequality. NEVER a 4D wormhole bound.
 * Flanagan (2002, corrected 2020) Eq. 1.7; same smooth L2 bump as v0.6.
 */
const C=299792458, HBAR=6.62607015e-34/(2*Math.PI)
const WIDTH_MIN=1e3, WIDTH_MAX=1e9
function validate(alpha,L,tau) {
  if(![alpha,L,tau].every(Number.isFinite)||alpha<0||alpha>1||
     L<WIDTH_MIN||L>WIDTH_MAX) {
    throw new RangeError('invalid curved 2D parameters')
  }
  // Proper time sampling in seconds: [1e-24,1e-3] is deliberately NOT
  // required for this distinct 2D reference; accept up to 100 seconds.
  if(tau<1e-9||tau>100) throw new RangeError('tau outside [1e-9,100] s')
}
function bumpAndDerivative(u){
  if(Math.abs(u)>=1)return [0,0]
  const z=(1-u)*(1+u),b=Math.exp(-1/z)
  return [b,-2*u*b/(z*z)]
}
function integrals(n=4096) {
  const h=2/n;let i0=0,i1=0
  for(let i=1;i<n;i++){
    const u=-1+i*h,[b,bp]=bumpAndDerivative(u),w=i%2?4:2
    i0+=w*b*b;i1+=w*bp*bp
  }
  return {i0:i0*h/3,i1:i1*h/3}
}
const coeffs=integrals()
export const FLANAGAN_2D_GRADIENT=4*coeffs.i1/coeffs.i0
export const FLANAGAN_2D_NORM=coeffs.i0
export function curved2dBound(alpha,L,tau){
  validate(alpha,L,tau)
  const ricci=2*alpha*Math.exp(-2*alpha)/(L*L)
  const sampling=-HBAR/(24*Math.PI*C)*FLANAGAN_2D_GRADIENT/tau**2
  const curvature=ricci===0?0:-HBAR*C/(24*Math.PI)*ricci
  return {ricci, sampling, curvature, lower:sampling+curvature,
    dimension:2, units:'J/m', staticCenterGeodesic:true,
    conformalGlobally:true, supportSeconds:2*tau,
    appliesTo4dWormhole:false, wormholeCompliance:null,
    backreactionSolved:false, physicalStateConstructed:false}
}
export function curved2dTrial(alpha,L,tau,amplitude) {
  if(!Number.isFinite(amplitude)||amplitude<0)throw new RangeError('amplitude must be finite nonnegative')
  const r=curved2dBound(alpha,L,tau)
  const ratio=amplitude/Math.abs(r.lower)
  return {...r,ratio,average:-amplitude,
    status:ratio>1+1e-12?'excluded_for_selected_2d_field':
     ratio<1-1e-12?'not_excluded_by_one_2d_bound':'roundoff_boundary',
    trialIsNotQuantumState:true}
}
