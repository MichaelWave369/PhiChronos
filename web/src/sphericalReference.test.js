import test from 'node:test'
import assert from 'node:assert/strict'
import {besselAll,partialAngular,sphericalWightman,ellisInfrared} from './sphericalReference.js'
const near=(a,b,delta=1e-10)=>assert.ok(Math.abs(a-b)<=delta,a+' != '+b)
test('known spherical j0/j1 and recurrence',()=>{
 for(const z of [.001,.1,1,5,15,25]){
  const v=besselAll(z,10)
  near(v[0],Math.sin(z)/z)
  near(v[1],Math.sin(z)/z**2-Math.cos(z)/z)
  for(let l=1;l<9;l++)near(v[l+1]-(2*l+1)/z*v[l]+v[l-1],0)
 }
 assert.deepEqual(besselAll(0,3),[1,0,0,0])
})
test('spherical angular sum reproduces independent sinc kernel',()=>{
 const a=.7,b=.9,mu=.4,d=Math.sqrt(a*a+b*b-2*a*b*mu)
 for(const k of [.1,1,5,15,30])near(partialAngular(k,a,b,mu,40),Math.sin(k*d)/(k*d),2e-10)
})
test('spherical Wightman approaches analytic flat reference',()=>{
 for(const [a,b,mu,ct,eps] of [[.7,.9,.4,.3,.5],[.5,.8,-.3,0,.6],[.4,.6,.8,-.3,.4]]){
  const v=sphericalWightman(a,b,mu,ct,eps,24,80,1024)
  assert.ok(v.analyticDelta<1e-6,JSON.stringify(v))
  assert.ok(v.directDelta<1e-6)
  assert.equal(v.ellisHadamard,false)
 }
})
test('angular convergence and numerical units gate',()=>{
 const lo=sphericalWightman(.7,.9,.4,.3,.5,4,80,512)
 const mid=sphericalWightman(.7,.9,.4,.3,.5,10,80,512)
 const hi=sphericalWightman(.7,.9,.4,.3,.5,24,80,512)
 assert.ok(lo.analyticDelta>mid.analyticDelta)
 assert.ok(mid.analyticDelta>hi.analyticDelta)
 assert.equal(hi.angularTruncationRigorouslyBounded,false)
})
test('massless Ellis infrared wave packets have no uniform gap',()=>{
 const a=ellisInfrared(1,1),b=ellisInfrared(1,10),c=ellisInfrared(1,100)
 assert.ok(a.quotient>b.quotient && b.quotient>c.quotient)
 assert.ok(c.quotient<a.quotient/1000)
 near(c.widthScaled,3.08496509,1e-5)
 assert.equal(c.noHadamardStateInferred,false)
 assert.equal(c.uniformPositiveGap,false)
})
test('numerical guards',()=>{
 assert.throws(()=>besselAll(-1,5),RangeError)
 assert.throws(()=>partialAngular(5,.5,.7,0,41),RangeError)
 assert.throws(()=>sphericalWightman(3,1,0,.2,.5),RangeError)
 assert.throws(()=>sphericalWightman(.5,1,0,.2,.5,24,80,13),RangeError)
 assert.throws(()=>ellisInfrared(1,-1),RangeError)
})
