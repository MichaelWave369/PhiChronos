import test from 'node:test'
import assert from 'node:assert/strict'
import {ellisPotential,ellisScatter,LOW_K_POWER,squareBarrierExact,squareBarrierNumeric} from './scalarModes.js'
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(Math.abs(a),Math.abs(b),1e-80),a+' != '+b)

test('radial potentials exactly scale and remain nonnegative',()=>{
  for(let l=0;l<=4;l++){
    near(ellisPotential(0,l),1+l*(l+1))
    near(ellisPotential(2,l),l*(l+1)/5+1/25)
    near(ellisPotential(-2,l),ellisPotential(2,l))
    for(const x of [0,1,3,8,20])assert.ok(ellisPotential(x,l)>0)
  }
})
test('published low-frequency Ellis transmission power',()=>{
  near(LOW_K_POWER,4/Math.PI**2)
  const x=ellisScatter(1,.03,36,5000)
  assert.ok(Math.abs(x.T/.03**2-LOW_K_POWER)<.02)
  assert.ok(x.R>.999 && x.T<.001)
  near(x.theoreticalLowK,LOW_K_POWER*.03**2)
})
test('wave current conservation and radius invariance',()=>{
  for(const k of [.1,.5,1,2]){
    const a=ellisScatter(1,k,32,5000),b=ellisScatter(10,k,32,5000)
    near(a.T,b.T)
    near(a.frequencyHz/b.frequencyHz,10)
    assert.ok(a.fluxResidual<1e-5 && a.wronskianResidual<1e-5)
    assert.ok(a.T>0 && a.R>0)
    assert.equal(a.qeiSolved,false)
    assert.equal(a.backreactionSolved,false)
  }
})
test('exact independent rectangular barrier comparison',()=>{
  for(const [k,v] of [[.5,.8],[1.1,.8],[2,.8],[1.5,0]]){
    const exact=squareBarrierExact(k,v,8)
    const actual=squareBarrierNumeric(k,v,8,4000)
    assert.ok(Math.abs(exact-actual.T)<3e-6)
    assert.ok(actual.fluxResidual<1e-6)
  }
})
test('truncation sensitivity and input rejection',()=>{
  const a=ellisScatter(1,.5,24,3000),b=ellisScatter(1,.5,36,5000)
  assert.ok(Math.abs(a.T-b.T)<6e-4)
  for(const k of [0,-1,3,NaN])assert.throws(()=>ellisScatter(1,k),RangeError)
  assert.throws(()=>ellisScatter(-1,.5),RangeError)
  assert.throws(()=>ellisScatter(1,.5,32,51),RangeError)
  assert.throws(()=>ellisPotential(0,1.5),RangeError)
  assert.throws(()=>squareBarrierExact(1,-1,8),RangeError)
})
