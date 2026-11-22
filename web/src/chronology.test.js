import test from 'node:test'
import assert from 'node:assert/strict'
import { quotientAnalysis, bellCnotPostselection } from './chronology.js'

test('spacelike, null and timelike identifications', () => {
  assert.deepEqual(quotientAnalysis(0, 4), {
    type:'spacelike',norm:-16,isClosedTimelikeGenerator:false,isClosedNullGenerator:false,properTimeSeconds:null,
  })
  assert.equal(quotientAnalysis(4,4).type, 'null')
  assert.equal(quotientAnalysis(4,4).isClosedTimelikeGenerator, false)
  assert.equal(quotientAnalysis(5,3).type, 'timelike')
  assert.equal(quotientAnalysis(5,3).properTimeSeconds, 4)
  assert.equal(quotientAnalysis(-5,3).type, 'timelike')
})

test('generator class unchanged by positive winding/scaling', () => {
  for (const [dt, dx] of [[0,3],[2,2],[4,1],[-4,3]]) {
    const initial = quotientAnalysis(dt,dx)
    for (const n of [2,3,5]) {
      const scaled = quotientAnalysis(n*dt,n*dx)
      assert.equal(scaled.type, initial.type)
      assert.ok(Math.abs(scaled.norm - initial.norm*n*n) < 1e-10)
    }
  }
})

test('invalid zero or nonfinite generator rejected', () => {
  for(const args of [[0,0],[NaN,5],[1,Infinity]]) {
    assert.throws(()=>quotientAnalysis(...args),RangeError)
  }
})

test('P-CTC toy accounts for accepted and discarded trials', () => {
  for(const p of [0,0.2,0.5,0.9,1]) {
    const r=bellCnotPostselection(p,1000)
    assert.ok(Math.abs(r.expectedAccepted+r.expectedDiscarded-1000) < 1e-10)
    assert.equal(r.successProbability,p)
    assert.equal(r.conditionalP0,p===0?null:1)
  }
})

test('P-CTC toy refuses paradoxically impossible successful outcome', () => {
  const p=bellCnotPostselection(0)
  assert.equal(p.outcomeDefined,false)
  assert.equal(p.expectedAccepted,0)
  assert.equal(p.conditionalP0,null)
})

test('P-CTC toy rejects invalid probabilities and shots', () => {
  for(const p of [-1,1.1,NaN,Infinity]) assert.throws(()=>bellCnotPostselection(p),RangeError)
  for(const n of [0,1.2,Infinity,1000001]) assert.throws(()=>bellCnotPostselection(0.5,n),RangeError)
})
