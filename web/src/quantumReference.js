/** 4D positive-frequency Minkowski Wightman reference in natural units.
 * Analytic vs independent spectral Simpson; 4D Ellis s-wave scattering
 * complex mode phase matching. No curved quantum state constructed.
 */
import {ellisScatter} from './scalarModes.js'
const C=299792458
const FOUR_PI2=4*Math.PI**2
function chk(ct,r,eps){
  if(![ct,r,eps].every(Number.isFinite)||Math.abs(ct)>4||r<0||r>4||eps<.05||eps>2)
    throw new RangeError('invalid Minkowski point separation/regularizer')
}
export function minkowskiWightman(ct,r,eps) {
  chk(ct,r,eps)
  // denom = r²+(eps+i ct)²; complex reciprocal (a-i b)/(a²+b²).
  const a=r*r+eps*eps-ct*ct, b=2*eps*ct, den=a*a+b*b
  return {real:a/(FOUR_PI2*den),imag:-b/(FOUR_PI2*den)}
}
export function spectralIntegral(ct,r,eps,kmax=96,steps=4096) {
  chk(ct,r,eps)
  if(!Number.isFinite(kmax)||kmax<20||kmax>300||
     !Number.isInteger(steps)||steps<512||steps>16384||steps%2)
    throw new RangeError('invalid spectral quadrature')
  const h=kmax/steps
  let real=0,imag=0
  for(let i=0;i<=steps;i++){
    const k=i*h,z=k*r
    const sinc=Math.abs(z)<1e-4?1-z*z/6+z**4/120:Math.sin(z)/z
    const factor=(i===0||i===steps?1:i%2?4:2)*k*Math.exp(-eps*k)*sinc
    real+=factor*Math.cos(k*ct)
    imag-=factor*Math.sin(k*ct)
  }
  real*=h/(3*FOUR_PI2)
  imag*=h/(3*FOUR_PI2)
  const exact=minkowskiWightman(ct,r,eps)
  return {real,imag,analyticReal:exact.real,analyticImag:exact.imag,
    absoluteDiscrepancy:Math.hypot(real-exact.real,imag-exact.imag),
    cutoffTailBound:Math.exp(-eps*kmax)*(kmax/eps+1/eps**2)/FOUR_PI2,
    ellisHadamardStateConstructed:false,curvedQeiEvaluated:false}
}
function multiply(a,b){return {re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re}}
function divide(a,b){const d=b.re*b.re+b.im*b.im;return multiply(a,{re:b.re/d,im:-b.im/d})}
function magnitudeSquared(z){return z.re*z.re+z.im*z.im}
export function ellisChannel(throat,k,extent=32,steps=4096){
  // Mirror exactly the 4D free s-wave radial transfer equation.
  // This section reimplements transfer here, separate from the Python solver,
  // using the same real-coefficient RK4 initial-value method.
  if(!Number.isFinite(throat)||throat<.001||throat>1e9||!Number.isFinite(k)||k<.02||k>2.5||
     !Number.isFinite(extent)||extent<4||extent>80||
     !Number.isInteger(steps)||steps<512||steps>30000||steps%2)
    throw new RangeError('invalid Ellis wave mode parameters')
  const h=2*extent/steps,k2=k*k
  let x=-extent,a=1,c=0,b=0,d=1
  function rhs(z,aa,cc,bb,dd){
    const p=1/(1+z*z)**2-k2
    return [cc,p*aa,dd,p*bb]
  }
  for(let i=0;i<steps;i++){
    const A=rhs(x,a,c,b,d)
    const B=rhs(x+h/2,a+h*A[0]/2,c+h*A[1]/2,b+h*A[2]/2,d+h*A[3]/2)
    const D=rhs(x+h/2,a+h*B[0]/2,c+h*B[1]/2,b+h*B[2]/2,d+h*B[3]/2)
    const E=rhs(x+h,a+h*D[0],c+h*D[1],b+h*D[2],d+h*D[3])
    a+=h*(A[0]+2*B[0]+2*D[0]+E[0])/6
    c+=h*(A[1]+2*B[1]+2*D[1]+E[1])/6
    b+=h*(A[2]+2*B[2]+2*D[2]+E[2])/6
    d+=h*(A[3]+2*B[3]+2*D[3]+E[3])/6
    x+=h
  }
  const denom={re:c-k2*b,im:-k*(a+d)}
  const reflect=divide({re:-(c+k2*b),im:-k*(d-a)},denom)
  const transmit=divide({re:0,im:-2*k},denom)
  const T=magnitudeSquared(transmit),R=magnitudeSquared(reflect)
  const existing=ellisScatter(throat,k,extent,steps)
  const norm=1/Math.sqrt(4*Math.PI*k)
  return {reflection:reflect,transmission:transmit,
    reflectionPower:R,transmissionPower:T,
    phaseUnitarityResidual:Math.abs(2*(reflect.re*transmit.re+reflect.im*transmit.im)),
    probabilityResidual:Math.abs(T+R-1),
    parityTransferResidual:Math.abs(a-d),
    wronskianResidual:Math.abs(a*d-b*c-1),
    consistencyWithPowerSolver:Math.abs(T-existing.T)+Math.abs(R-existing.R),
    formalKgDeltaKappaNorm:2*k*2*Math.PI*norm*norm,
    formalAmplitude:norm,
    allAngularModesIncluded:false,
    ellisWightmanConstructed:false,
    hadamardVerified:false,
    curvedQeiEvaluated:false,
    renormalizedStressComputed:false,
    backreactionSolved:false}
}
