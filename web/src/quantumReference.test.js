import test from 'node:test'
import assert from 'node:assert/strict'
import {minkowskiWightman,spectralIntegral,ellisChannel} from './quantumReference.js'
const near=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<=t*Math.max(Math.abs(a),Math.abs(b),1e-75),a+' differs from '+b)
test('positive-frequency flat 4D Minkowski vacuum reference',()=>{
  for(const [ct,r,eps] of [[0,0,.4],[0,1,.3],[.3,.7,.5],[-.2,1.2,.4]]){
    const q=spectralIntegral(ct,r,eps,100,4096)
    assert.ok(q.absoluteDiscrepancy<2e-7,JSON.stringify(q))
    assert.ok(q.cutoffTailBound<1e-6)
  }
})
test('Hermiticity and UV regulated short-distance inverse square',()=>{
  for(const [ct,r] of [[.3,.4],[1,2],[.5,0]]){
    const a=minkowskiWightman(ct,r,.3),b=minkowskiWightman(-ct,r,.3)
    near(a.real,b.real); near(a.imag,-b.imag)
  }
  near(minkowskiWightman(0,0,.2).real/minkowskiWightman(0,0,.4).real,4)
})
test('four-dimensional Ellis mode amplitudes match phase and flux properties',()=>{
  for(const k of [.05,.25,.5,1,2]){
    const x=ellisChannel(1,k,32,4096)
    assert.ok(x.consistencyWithPowerSolver<1e-8)
    assert.ok(x.probabilityResidual<3e-6)
    assert.ok(x.wronskianResidual<3e-6)
    assert.ok(x.phaseUnitarityResidual<3e-6)
    assert.ok(x.parityTransferResidual<3e-5)
    near(x.formalKgDeltaKappaNorm,1)
    assert.equal(x.ellisWightmanConstructed,false)
    assert.equal(x.hadamardVerified,false)
  }
})
test('dimensional scaling and unfulfilled state gate',()=>{
  const a=ellisChannel(1,.5,20,2048)
  const b=ellisChannel(10,.5,20,2048)
  near(a.transmissionPower,b.transmissionPower)
  assert.equal(a.allAngularModesIncluded,false)
  assert.equal(a.renormalizedStressComputed,false)
  assert.equal(a.curvedQeiEvaluated,false)
  assert.equal(a.backreactionSolved,false)
})
test('input domain checks',()=>{
  assert.throws(()=>minkowskiWightman(0,-1,.4),RangeError)
  assert.throws(()=>minkowskiWightman(0,1,0),RangeError)
  assert.throws(()=>spectralIntegral(0,.5,.4,20,7),RangeError)
  assert.throws(()=>ellisChannel(1,0),RangeError)
  assert.throws(()=>ellisChannel(-1,.3),RangeError)
})
