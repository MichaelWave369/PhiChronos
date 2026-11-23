/** Four-dimensional FLAT spherical partial wave Wightman reference and
 * Ellis static slice infrared Rayleigh tests. Neither is a curved vacuum.
 */
import {minkowskiWightman,spectralIntegral} from './quantumReference.js'

export const MAX_ELL=40
function validateEll(n){
  if(!Number.isInteger(n)||n<0||n>MAX_ELL)throw new RangeError('ell must be an integer 0..40')
}
export function besselAll(z,n){
  validateEll(n)
  if(!Number.isFinite(z)||z<0||z>300)throw new RangeError('invalid spherical Bessel argument')
  if(z===0)return [1,...Array(n).fill(0)]
  if(z<1e-4){
    const values=[1-z*z/6+z**4/120]
    let df=1,power=1
    for(let l=1;l<=n;l++){df*=2*l+1;power*=z;values.push(power/df*(1-z*z/(2*(2*l+3))))}
    return values
  }
  const j0=Math.sin(z)/z
  if(n===0)return [j0]
  const j1=Math.sin(z)/z**2-Math.cos(z)/z
  if(z>n+4){
    const a=[j0,j1]
    for(let l=1;l<n;l++)a.push((2*l+1)*a[l]/z-a[l-1])
    return a
  }
  const N=Math.max(n+40,Math.floor(z)+40),work=Array(N+2).fill(0)
  work[N]=1
  for(let l=N;l>0;l--){
    work[l-1]=(2*l+1)*work[l]/z-work[l+1]
    if(Math.abs(work[l-1])>1e100)for(let i=l-1;i<N+2;i++)work[i]*=1e-100
  }
  const scale=Math.abs(j0)>=Math.abs(j1)?j0/work[0]:j1/work[1]
  return work.slice(0,n+1).map(v=>v*scale)
}
function legendreAll(mu,n){
  if(!Number.isFinite(mu)||Math.abs(mu)>1)throw new RangeError('invalid angular cosine')
  const p=[1]
  if(n>0){p.push(mu);for(let l=1;l<n;l++)p.push(((2*l+1)*mu*p[l]-l*p[l-1])/(l+1))}
  return p
}
function validateRadii(a,b,mu){
  if(![a,b,mu].every(Number.isFinite)||a<0||a>2||b<0||b>2||mu< -1||mu>1)
    throw new RangeError('invalid flat-space radii/angle')
  return Math.sqrt(Math.max(0,a*a+b*b-2*a*b*mu))
}
export function partialAngular(k,a,b,mu,n){
  validateEll(n)
  validateRadii(a,b,mu)
  if(!Number.isFinite(k)||k<0||k>300)throw new RangeError('invalid wave number')
  const p=legendreAll(mu,n),j1=besselAll(k*a,n),j2=besselAll(k*b,n)
  let sum=0
  for(let l=0;l<=n;l++)sum+=(2*l+1)*p[l]*j1[l]*j2[l]
  return sum
}
export function sphericalWightman(a,b,mu,ct,eps,n=24,K=80,steps=1024){
  validateEll(n)
  const d=validateRadii(a,b,mu)
  if(![ct,eps,K].every(Number.isFinite)||Math.abs(ct)>2||eps<.2||eps>1.2||K<20||K>100||
     !Number.isInteger(steps)||steps<256||steps>8192||steps%2)
    throw new RangeError('invalid quadrature parameters')
  const h=K/steps
  let real=0,imag=0
  for(let i=0;i<=steps;i++){
    const k=i*h
    const sum=partialAngular(k,a,b,mu,n)
    const factor=(i===0||i===steps?1:i%2?4:2)*k*Math.exp(-eps*k)*sum
    real+=factor*Math.cos(k*ct)
    imag-=factor*Math.sin(k*ct)
  }
  real*=h/(3*4*Math.PI**2)
  imag*=h/(3*4*Math.PI**2)
  const exact=minkowskiWightman(ct,d,eps)
  const direct=spectralIntegral(ct,d,eps,K,steps)
  return {real,imag,analyticReal:exact.real,analyticImag:exact.imag,
    directReal:direct.real,directImag:direct.imag,
    directDelta:Math.hypot(real-direct.real,imag-direct.imag),
    analyticDelta:Math.hypot(real-exact.real,imag-exact.imag),
    directAnalyticDelta:direct.absoluteDiscrepancy,cutoffTail:direct.cutoffTailBound,
    separation:d,lmax:n,angularTruncationRigorouslyBounded:false,
    ellisHadamard:false,curvedQei:false,backreaction:false}
}
function bump(u){
  if(Math.abs(u)>=1)return [0,0]
  const z=1-u*u
  const b=Math.exp(-1/z)
  return [b,-2*u*b/(z*z)]
}
export function ellisInfrared(throat,width,center=12,steps=2048){
  if(!Number.isFinite(throat)||throat<.001||throat>1e9||
     !Number.isFinite(width)||width<.1||width>1e9||
     !Number.isFinite(center)||center<4||center>30||
     !Number.isInteger(steps)||steps<256||steps>8192||steps%2)
    throw new RangeError('invalid IR wave packet parameters')
  const h=2/steps
  let numerator=0,denominator=0
  for(let i=1;i<steps;i++){
    const u=-1+i*h
    const l=width*(center+u),vol=l*l+throat*throat
    const [b,bp]=bump(u)
    const w=i%2?4:2
    numerator+=w*vol*bp*bp
    denominator+=w*vol*b*b
  }
  const q=numerator/denominator/(width*width)
  return {quotient:q,widthScaled:q*width*width,packetLeft:(center-1)*width,packetRight:(center+1)*width,
    uniformPositiveGap:false,nonnegativeQuadraticForm:true,
    noHadamardStateInferred:false,curvedStateConstructed:false,qeiEvaluated:false}
}
