import test from 'node:test'
import assert from 'node:assert/strict'
import { boostLightSeconds, intervalLightSecondsSquared, causalRegion } from './physics.js'

const approximately = (a, b, tol = 1e-11) => assert.ok(Math.abs(a - b) <= tol, String(a) + ' != ' + String(b))

test('identity and reference moving origin', () => {
  assert.deepEqual(boostLightSeconds(3, 2, 0), {ct: 3, x: 2, gamma: 1})
  const moving = boostLightSeconds(5, 3, 0.6)
  approximately(moving.ct, 4)
  approximately(moving.x, 0)
})

test('Lorentz boosts preserve signed interval', () => {
  for (const b of [-0.95, -0.6, 0, 0.3, 0.8, 0.95]) {
    for (const [ct, x] of [[0, 0], [3, 1], [1, 4], [1, 1], [-2, 0.5]]) {
      const primed = boostLightSeconds(ct, x, b)
      approximately(intervalLightSecondsSquared(ct, x), intervalLightSecondsSquared(primed.ct, primed.x), 1e-10)
      const back = boostLightSeconds(primed.ct, primed.x, -b)
      approximately(back.ct, ct)
      approximately(back.x, x)
    }
  }
})

test('causal regions include the coincident case', () => {
  assert.equal(causalRegion(0, 0), 'Coincident events')
  assert.equal(causalRegion(3, 1), 'Causal future (timelike)')
  assert.equal(causalRegion(-3, 1), 'Causal past (timelike)')
  assert.equal(causalRegion(3, 3), 'Future light cone')
  assert.equal(causalRegion(-3, 3), 'Past light cone')
  assert.equal(causalRegion(1, 4), 'Elsewhere (spacelike)')
})

test('invalid boost inputs are rejected', () => {
  for (const beta of [-1, 1, NaN, Infinity]) {
    assert.throws(() => boostLightSeconds(0, 0, beta), RangeError)
  }
  assert.throws(() => boostLightSeconds(NaN, 1, 0.4), RangeError)
})
