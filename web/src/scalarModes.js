/** 3+1D fixed Ellis wormhole free massless minimally coupled probe-scalar modes.
 * S-wave plane-wave scattering and analytic potential only; NOT a QEI.
 */
const C=299792458
export const LOW_K_POWER=4/Math.PI**2
export function ellisPotential(x,ell=0) {
  if(!Number.isFinite(x)||Math.abs(x)>100||!Number.isInteger(ell)||ell<0||ell>8)throw new RangeError('invalid mode')
  const r2=1+x*x
  return ell*(ell+1)/r2 + 1/(r2*r2)
}
function transfer(k,extent,steps,potential) {
  if(!Number.isFinite(k)||k<.02||k>2.5||!Number.isFinite(extent)||extent<4||extent>80||
    !Number.isInteger(steps)||steps<512||steps>30000||steps%2)throw new RangeError('invalid integration domain')
  const h=2*extent/steps,k2=k*k
  let x=-extent,a=1,c=0,b=0,d=1
  function rates(t,x1,x2,x3,x4) {
    const v=potential(t)-k2
    return [x2,v*x1,x4,v*x3]
  }
  for(let i=0;i<steps;i++){
    const k1=rates(x,a,c,b,d)
    const k2v=rates(x+h/2,a+h*k1[0]/2,c+h*k1[1]/2,b+h*k1[2]/2,d+h*k1[3]/2)
    const k3=rates(x+h/2,a+h*k2v[0]/2,c+h*k2v[1]/2,b+h*k2v[2]/2,d+h*k2v[3]/2)
    const k4=rates(x+h,a+h*k3[0],c+h*k3[1],b+h*k3[2],d+h*k3[3])
    a+=h*(k1[0]+2*k2v[0]+2*k3[0]+k4[0])/6
    c+=h*(k1[1]+2*k2v[1]+2*k3[1]+k4[1])/6
    b+=h*(k1[2]+2*k2v[2]+2*k3[2]+k4[2])/6
    d+=h*(k1[3]+2*k2v[3]+2*k3[3]+k4[3])/6
    x+=h
  }
  const determinant=a*d-b*c
  const den=(c-k2*b)**2+k2*(a+d)**2
  const T=4*k2/den
  const R=((c+k2*b)**2+k2*(d-a)**2)/den
  return {T,R,fluxResidual:Math.abs(T+R-1),wronskianResidual:Math.abs(determinant-1)}
}
export function ellisScatter(throat,k,extent=32,steps=2048) {
  if(!Number.isFinite(throat)||throat<.001||throat>1e9)throw new RangeError('invalid throat')
  const s=transfer(k,extent,steps,x=>ellisPotential(x,0))
  return {...s,k,throat,frequencyHz:C*k/(2*Math.PI*throat),
    theoreticalLowK:k<=.1?LOW_K_POWER*k*k:null,
    tailPotential:ellisPotential(extent,0),
    qeiSolved:false,quantizedState:false,backreactionSolved:false}
}
export function squareBarrierExact(k,v,width) {
  if (![k,v,width].every(Number.isFinite)||k<=0||v<0||width<=0)throw new RangeError('bad square barrier')
  const E=k*k
  let term
  if(Math.abs(E-v)<1e-14) term=v*v*width*width/(4*E)
  else if(E>v)term=v*v*Math.sin(Math.sqrt(E-v)*width)**2/(4*E*(E-v))
  else term=v*v*Math.sinh(Math.sqrt(v-E)*width)**2/(4*E*(v-E))
  return 1/(1+term)
}
export function squareBarrierNumeric(k,v,width,steps=2048) {
  if(!Number.isFinite(v)||v<0)throw new RangeError('invalid height')
  return transfer(k,width/2,steps,()=>v)
}
