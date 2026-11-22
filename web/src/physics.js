/** Flat 1+1D Minkowski model. Coordinate x is in light-seconds, ct in light-seconds.
 * beta is velocity v/c, positive when S' moves right relative to S.
 * No claim about curved spacetime or closed timelike curves. */
export function boostLightSeconds(ct, x, beta) {
  if (![ct, x, beta].every(Number.isFinite) || Math.abs(beta) >= 1) {
    throw new RangeError('ct, x must be finite and |beta| < 1')
  }
  const gamma = 1 / Math.sqrt((1 - beta) * (1 + beta))
  return {ct: gamma * (ct - beta * x), x: gamma * (x - beta * ct), gamma}
}

export function intervalLightSecondsSquared(ct, x) {
  if (![ct, x].every(Number.isFinite)) throw new RangeError('coordinates must be finite')
  return (ct - x) * (ct + x)
}

export function causalRegion(ct, x) {
  if (![ct, x].every(Number.isFinite)) throw new RangeError('coordinates must be finite')
  if (ct === 0 && x === 0) return 'Coincident events'
  const scale = Math.max(Math.abs(ct), Math.abs(x), 1)
  const gap = (Math.abs(ct) - Math.abs(x)) / scale
  if (Math.abs(gap) <= 1e-12) return ct > 0 ? 'Future light cone' : 'Past light cone'
  if (gap < 0) return 'Elsewhere (spacelike)'
  return ct > 0 ? 'Causal future (timelike)' : 'Causal past (timelike)'
}
