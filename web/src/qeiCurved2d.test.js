import test from 'node:test'
import assert from 'node:assert/strict'
import {curved2dBound,curved2dTrial,FLANAGAN_2D_GRADIENT,FLANAGAN_2D_NORM} from './qeiCurved2d.js'
const near=(a,b,r=1e-10)=>assert.ok(Math.abs(a-b)<=r*Math.max(Math.abs(a),Math.abs(b),1e-90),a+' != '+b)
test('normalized compact bump and published coefficient',()=>{
  near(FLANAGAN_2D_NORM,0.1330861208449943,1e-9)
  near(FLANAGAN_2D_GRADIENT,12.310436524927102,1e-9)
})
test('two dimensional Minkowski limit and inverse square',()=>{
  const f=curved2dBound(0,1e6,.01)
  assert.equal(f.ricci,0)
  assert.equal(f.curvature,0)
  near(f.lower/curved2dBound(0,1e6,.1).lower,100)
})
test('nonzero curvature correct result with dimensional guard',()=>{
  const f=curved2dBound(.5,1e6,.01)
  near(f.ricci,3.6787944117144233e-13)
  near(f.sampling,-5.743383245349684e-40)
  near(f.curvature,-1.5425571662321298e-40)
  near(f.lower,-7.285940411581813e-40)
  assert.equal(f.dimension,2)
  assert.equal(f.units,'J/m')
  assert.equal(f.appliesTo4dWormhole,false)
  assert.equal(f.wormholeCompliance,null)
  assert.equal(f.backreactionSolved,false)
})
test('curved correction and one-bound exclusion',()=>{
  const flat=curved2dBound(0,1e6,.01)
  const curved=curved2dBound(.5,1e6,.01)
  assert.ok(curved.lower<flat.lower)
  const b=Math.abs(curved.lower)
  assert.equal(curved2dTrial(.5,1e6,.01,.3*b).status,'not_excluded_by_one_2d_bound')
  assert.equal(curved2dTrial(.5,1e6,.01,1.5*b).status,'excluded_for_selected_2d_field')
  assert.equal(curved2dTrial(.5,1e6,.01,.3*b).trialIsNotQuantumState,true)
})
test('invalid domain protection',()=>{
  for(const a of [-1,1.1,NaN,Infinity]) assert.throws(()=>curved2dBound(a,1e6,.01),RangeError)
  for(const L of [0,100,1e10,Infinity]) assert.throws(()=>curved2dBound(.5,L,.01),RangeError)
  for(const t of [0,-1,NaN,Infinity,1e-30,101]) assert.throws(()=>curved2dBound(.5,1e6,t),RangeError)
  assert.throws(()=>curved2dTrial(.5,1e6,.01,-1),RangeError)
})
