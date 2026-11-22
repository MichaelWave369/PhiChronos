# PhiChronos v0.4 | Morris–Thorne stress-energy and wormhole constraints

## What this model actually answers

Given one specific static, spherically symmetric **postulated metric**, what classical stress-energy tensor would be required by Einstein's field equations? Do the pointwise null energy conditions hold? The code computes *geometry and implied classical stress*, not the existence, production, or stabilization of a physical wormhole.

## Explicit model and domain

Signature (-,+,+,+), SI speed of light c and gravitational constant G:

```text
ds² = -c² dt² + dr²/(1-b(r)/r) + r²(dθ²+sin²θ dφ²)
Phi(r) = 0       (unit lapse, zero redshift / no horizon from lapse)
b(r)   = r0²/r   (shape function)
r >= r0 > 0
```

There are *two* asymptotic regions joined at r=r0. The areal-radius coordinate r has a coordinate degeneracy at the throat, not a physical curvature singularity. Introduce proper radial length l in (-∞,∞):

```text
r(l) = sqrt(l² + r0²)
ds² = -c² dt² + dl² + (l²+r0²)dΩ²
```

At the throat b(r0)=r0, and the flare-out criterion is b'(r0)=-1<1. The throat is a strict minimum of areal radius because r'(0)=0 and r''(0)=1/r0>0. Curvature scalar R=-2r0²/r⁴ is finite for r0>0.

## Derived local physical stresses

For a static observer's orthonormal tetrad, with energy density epsilon and physical pressures p_r, p_t (SI J/m³ = Pa):

```text
A = c^4/(8πG)   [J/m]
epsilon = A*b'(r)/r²
p_r     = -A*b(r)/r³
p_t     = A*(b(r)-r*b'(r))/(2r³)
```

Insert b=r0²/r and b'=-r0²/r²:

```text
epsilon = p_r = -A*r0²/r⁴
p_t             = +A*r0²/r⁴
NEC_radial      = epsilon + p_r = -2A*r0²/r⁴ < 0
NEC_tangential  = epsilon + p_t = 0
```

Thus this chosen wormhole violates the **radial null energy condition at every finite r >= r0**. This is a constraint on the *particular metric* and a necessary classical stress assignment; it is not a construction of negative-energy matter. A throat radius of 1 m requires a local energy density of approximately **-4.81545 × 10^42 J/m³** at the throat. This is not a total energy estimate, a practical power demand, or a global conserved mass.

The 1/r0² scaling applies to the throat magnitude when other dimensionless parameters are held fixed. The radial profile at fixed r0 scales as 1/(r/r0)^4.

## Independent differential calculation

As a cross-check in the regular proper-radial coordinate, let R(l)=sqrt(l²+r0²), R'=l/R and R''=r0²/R³. In an orthonormal tetrad for an ultra-static warped product metric:

```text
G_(tt)         = [1-(R')²-2R R'']/R²
G_(ll)         = [(R')²-1]/R²
G_(theta theta)= R''/R
```

Multiply each by A to obtain epsilon, p_r, p_t. Tests compare these to the b(r) calculation at many throat radii and proper radial positions. A separate central finite-difference check validates b'(r), and a finite-difference conservation check uses dp_r/dl + 2(R'/R)(p_r-p_t)=0.

## Quantum energy inequalities: limitation, not an invented universal bound

Real QFT can permit negative energy, but duration, sampling, field content, and curvature matter. Ford and Roman (1996) and Kontou's 2024 review outline meaningful constraints on wormhole geometries. **This release does not compute a QEI bound**, because comparing our pointwise classical stress to a generic, unqualified QEI is not scientifically valid. An actual QEI comparison must specify a quantum field state, observer, trajectory, smearing function, sampling duration, curvature regime, and backreaction treatment.

## Reproducibility

```sh
PYTHONPATH=src python -m unittest discover -s tests -v
PYTHONPATH=src python -m phichronos.cli wormhole --throat-m 1 --ratio 1
PYTHONPATH=src python -m phichronos.cli wormhole --throat-m 100 --ratio 2
cd web && npm install && npm run test && npm run build
```

## Sources

- Morris & Thorne, *Wormholes in spacetime and their use for interstellar travel*, Am. J. Phys. **56**, 395 (1988): https://doi.org/10.1119/1.15620
- Morris, Thorne & Yurtsever, *Wormholes, time machines, and the weak energy condition*, PRL **61**, 1446 (1988): https://doi.org/10.1103/PhysRevLett.61.1446
- Ford & Roman, *Quantum field theory constrains traversable wormhole geometries*, PRD **53**, 5496 (1996): https://doi.org/10.1103/PhysRevD.53.5496
- Kontou, *Wormhole Restrictions from Quantum Energy Inequalities*, Universe **10**, 291 (2024): https://doi.org/10.3390/universe10070291

## Scientific integrity

The numerical engine implements a known theoretical geometry; this is not a previously unknown solution to Einstein's equations. It does **not** solve the quantum stability of wormholes, demonstrate topology change, or establish an engineering route to time travel.
