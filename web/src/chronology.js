/** Explicitly imposed Minkowski identification (ct,x)~(ct+n Δct,x+n Δx).
 * Coordinates are light-seconds. Mathematical topology only; no spacetime
 * construction mechanism or empirical backward communication is implied.
 */
export function quotientAnalysis(deltaCt, deltaX) {
  if (![deltaCt, deltaX].every(Number.isFinite) || (deltaCt === 0 && deltaX === 0)) {
    throw new RangeError('finite nonzero identification vector required')
  }
  const norm = (deltaCt - deltaX) * (deltaCt + deltaX)
  const gap = (Math.abs(deltaCt) - Math.abs(deltaX)) /
    Math.max(Math.abs(deltaCt), Math.abs(deltaX))
  const type = Math.abs(gap) <= 1e-12 ? 'null' : gap > 0 ? 'timelike' : 'spacelike'
  return {
    type,
    norm,
    isClosedTimelikeGenerator: type === 'timelike',
    isClosedNullGenerator: type === 'null',
    properTimeSeconds: type === 'timelike' ? Math.sqrt(Math.max(0, norm)) : null,
  }
}

/** Conditional Bell-pair postselection with CNOT(S -> loop).
 * The effective operator is |0><0|, success chance = P(S=0).
 * The success counts are mathematical expectations, not observed shots.
 */
export function bellCnotPostselection(probZero, shots = 1000) {
  if (!Number.isFinite(probZero) || probZero < 0 || probZero > 1 ||
      !Number.isInteger(shots) || shots < 1 || shots > 1_000_000) {
    throw new RangeError('p in [0,1], integer shots in [1,1000000]')
  }
  return {
    successProbability: probZero,
    expectedAccepted: probZero * shots,
    expectedDiscarded: shots * (1 - probZero),
    conditionalP0: probZero > 0 ? 1 : null,
    outcomeDefined: probZero > 0,
  }
}
