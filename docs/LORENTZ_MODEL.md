# Lorentz model | CAUSAL-002

## Scientific target
Demonstrate how two inertial reference frames in flat 1+1D Minkowski spacetime assign different event coordinates yet agree on causal class and the invariant interval. No closed timelike curves are modeled.

## Conventions
- Signature (+,−).
- Coordinates in the Python engine: t in SI seconds; x in meters.
- Coordinates in browser: ct and x in light-seconds, with 1 light-second = c × 1 SI second of distance.
- Positive beta = v/c corresponds to S′ moving in +x relative to S. Require -1 < beta < 1.
- Shared origins: t = t′ = 0, x = x′ = 0.

The boost equations are:

    gamma = 1/sqrt(1-beta²)
    t′ = gamma*(t - beta*x/c)
    x′ = gamma*(x - beta*c*t)

In the browser's units:

    ct′ = gamma*(ct - beta*x)
    x′  = gamma*(x  - beta*ct)

The invariance assertion for two events A and B is

    (c*(tB-tA))² - (xB-xA)² =
    (c*(tB′-tA′))² - (xB′-xA′)²

The light-cone lines are x = ±ct. The S′ temporal axis (x′=0) is x=beta*ct; the S′ spatial axis (ct′=0) is ct=beta*x.

## Tests and limits
- Python suite checks inverse boosts, moving origin, simultaneous slice, domain guards, invariant separations, and causal regions.
- JS suite independently checks the same invariants and reversibility using browser units.
- The experimental inputs are bounded to avoid extreme gamma and drawing overflow.
- Timelike future and past remain invariant for orthochronous boosts. The coordinate ordering of spacelike events may change with frame.
- Null events lie on the cone; event A=B is explicitly the coincident case.
- At near-null separations, finite precision may produce small numerical differences; do not interpret them as physical non-invariance.

## Primary educational reference
OpenStax, University Physics Volume 3, The Lorentz Transformation:
https://openstax.org/books/university-physics-volume-3/pages/5-5-the-lorentz-transformation

## Non-goals
This is not a gravity solver, a closed timelike curve detector, evidence for past-directed information transfer, or a simulation of backward time travel.
