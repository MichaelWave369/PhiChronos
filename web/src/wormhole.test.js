import test from 'node:test'
import assert from 'node:assert/strict'
import {wormholeAt,arealRadius,MORRIS_SCALE} from './wormhole.js'
const near=(a,b,tol=1e-12)=>assert.ok(Math.abs(a-b) <= tol * Math.max(Math.abs(a),Math.abs(b),1e-20),String(a)+' != '+String(b))

test('throat, flare-out, regular proper radial coordinate',()=>{
  for(const r0 of [0.1,1,100,100000]){
    const a=wormholeAt(r0)
    near(a.b,r0)
    assert.equal(a.bp,-1)
    assert.equal(a.gRadialInverse,0)
    assert.equal(a.lapseSquared,1)
    near(arealRadius(r0,0),r0)
    near(arealRadius(r0,3*r0),Math.sqrt(10)*r0)
  }
})
test('stress energy and NEC identities',()=>{
  for(const q of [1,1.5,2,5,10]){
    const a=wormholeAt(1,q)
    assert.ok(a.energyDensity<0 && a.radialNEC<0 && a.tangentialPressure>0)
    near(a.energyDensity, a.radialPressure)
    near(a.energyDensity,-a.tangentialPressure)
    near(a.radialNEC,2*a.energyDensity)
    near(a.tangentialNEC,0)
    near(a.ricciScalar,-2/q**4)
  }
})
test('1m throat reference magnitude and scale with throat radius',()=>{
  near(wormholeAt(1).energyDensity,-MORRIS_SCALE)
  near(wormholeAt(10).energyDensity/wormholeAt(1).energyDensity,0.01)
  near(wormholeAt(1,2).radialNEC/wormholeAt(1).radialNEC,1/16)
})
test('domain boundaries and malformed inputs',()=>{
  for(const pair of [[0,1],[-2,1],[Number.NaN,1],[1,0.9],[1,1001],[1,Infinity]]){
    assert.throws(()=>wormholeAt(...pair), RangeError)
  }
  assert.throws(()=>arealRadius(1,1001),RangeError)
})
