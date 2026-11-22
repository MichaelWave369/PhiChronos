import test from 'node:test'
import assert from 'node:assert/strict'
import {flatBounds,pulseTrial,curvedGate,FE,FR} from './qei.js'
function near(a,b){assert.ok(Math.abs(a-b)<=1e-12*Math.max(Math.abs(a),Math.abs(b),1e-70),a+' vs '+b)}
test('two paper coefficients and ordering',()=>{
  near(FE/FR,9/64)
  const a=flatBounds(1e-15)
  assert.ok(a.fordRoman<a.fewsterEveson&&a.fewsterEveson<0)
})
test('1/tau^4 scale',()=>{
  for(const t of [1e-20,1e-15,1e-10]){
    const a=flatBounds(t),b=flatBounds(t*10)
    near(a.fordRoman/b.fordRoman,1e4)
    near(a.fewsterEveson/b.fewsterEveson,1e4)
  }
})
test('toy pulse analytic average and conditional exclusion',()=>{
  const t=1e-15,A=Math.abs(flatBounds(t).fewsterEveson)
  const a=pulseTrial(t,t,A)
  near(a.average,-A/2)
  assert.equal(a.status,'not_excluded_by_one_bound')
  assert.equal(pulseTrial(10*t,t,A).status,'excluded_for_this_flat_field')
  assert.equal(a.stateConstructed,false)
})
test('no curved-spacetime compliance verdict',()=>{
  for(const throat of [0.1,1,1e3]){
    const x=curvedGate(throat,1,1e-15)
    near(x.ricciLength,throat/Math.sqrt(2))
    assert.equal(x.transferProven,false)
    assert.equal(x.qeiCompliance,null)
    assert.equal(x.backreactionEvaluated,false)
  }
})
test('bad domains rejected',()=>{
  for(const tau of [0,NaN,Infinity,1,1e-30])
    assert.throws(()=>flatBounds(tau),RangeError)
  assert.throws(()=>pulseTrial(1e-15,1e-15,-1),RangeError)
  assert.throws(()=>curvedGate(0,1,1e-15),RangeError)
})
