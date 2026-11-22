import test from 'node:test'
import assert from 'node:assert/strict'
import {BUMP_COEFFICIENT,BUMP_NORM,shapeWeight,compactQei,compactPlateau,curvatureGate} from './qeiCompact.js'
const close=(a,b,r=1e-10)=>assert.ok(Math.abs(a-b)<=r*Math.max(Math.abs(a),Math.abs(b),1e-100),a+' != '+b)

test('smooth bump coefficient and normalized finite support',()=>{
  close(BUMP_COEFFICIENT,81.407946543258,1e-8)
  close(BUMP_NORM,0.133086120844994,1e-8)
  assert.equal(shapeWeight(1),0)
  assert.equal(shapeWeight(-2),0)
  close(shapeWeight(0),Math.exp(-2)/BUMP_NORM)
  close(shapeWeight(-0.3),shapeWeight(0.3))
})
test('independent Simpson integration normalizes g^2',()=>{
  let sum=0;const n=2048,h=2/n
  for(let i=1;i<n;i++) sum+=(i%2?4:2)*shapeWeight(-1+i*h)
  close(sum*h/3,1,1e-8)
})
test('finite-duration bound and inverse-fourth scaling',()=>{
  const r=compactQei(1e-15)
  close(r.lower,-2.017721047850942,1e-8)
  assert.equal(r.supportSeconds,2e-15)
  close(r.lower/compactQei(1e-14).lower,1e4)
  assert.equal(r.curvedTransferProven,false)
})
test('hypothetical plateau is not a constructed quantum state',()=>{
  const bound=Math.abs(compactQei(1e-15).lower)
  assert.equal(compactPlateau(1e-15,bound*0.3).status,'not_excluded_by_one_bound')
  assert.equal(compactPlateau(1e-15,bound*2).status,'excluded_for_this_flat_field')
  assert.equal(compactPlateau(1e-15,bound).constructedState,false)
})
test('curvature invariants and required closed gate',()=>{
  for (const radius of [0.1,1,100,1000]){
    const x=curvatureGate(radius,1,1e-15)
    close(x.ricci,-2/radius**2)
    close(x.kretschmann,12/radius**4)
    close(x.componentCurvatureLength,radius)
    assert.equal(x.flatQeiApplicable,false)
    assert.equal(x.qeiCompliance,null)
    assert.equal(x.backreactionEvaluated,false)
  }
})
test('all numerical parameter guards',()=>{
  for (const tau of [0,1,Infinity,NaN,1e-30]) assert.throws(()=>compactQei(tau),RangeError)
  assert.throws(()=>compactPlateau(1e-15,-1),RangeError)
  assert.throws(()=>curvatureGate(0,1,1e-15),RangeError)
  assert.throws(()=>shapeWeight(NaN),RangeError)
})
