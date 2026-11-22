/** Fixed static Morris–Thorne geometry with Phi=0, b(r)=r0²/r.
 * A postulated metric, not an observed traversable wormhole.
 * Components in SI J/m³ or Pa in a local orthonormal frame.
 * Signature (-,+,+,+), throat radius r0>0, r/r0>=1.
 */
const C=299792458
const G=6.67430e-11
export const MORRIS_SCALE = C**4/(8*Math.PI*G)
export function wormholeAt(throatMeters, ratio=1){
  if (![throatMeters,ratio].every(Number.isFinite) || throatMeters<1e-3 || throatMeters>1e9 || ratio<1 || ratio>1000) {
    throw new RangeError('throat in [0.001,1e9] m, r/r0 in [1,1000]')
  }
  const r=throatMeters*ratio
  const b=throatMeters**2/r
  const bp=-(throatMeters/r)**2
  const epsilon=MORRIS_SCALE * bp/(r*r)
  const radial=-MORRIS_SCALE * b/(r**3)
  const tangential=MORRIS_SCALE * (b-r*bp)/(2*r**3)
  return {
    r, b, bp, lapseSquared:1,
    gRadialInverse:1-b/r,
    energyDensity:epsilon, radialPressure:radial, tangentialPressure:tangential,
    radialNEC:epsilon+radial, tangentialNEC:epsilon+tangential,
    ricciScalar:-2*throatMeters*throatMeters/r**4
  }
}
export function arealRadius(throatMeters,lMeters){
  if (!Number.isFinite(throatMeters)||!Number.isFinite(lMeters)||throatMeters<1e-3||throatMeters>1e9||Math.abs(lMeters)>1000*throatMeters){
    throw new RangeError('invalid throat or proper radial position')
  }
  return Math.hypot(throatMeters,lMeters)
}
