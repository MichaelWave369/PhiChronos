# PhiChronos v0.8 | Massless scalar propagation in a curved 4D wormhole background

## Why this is a necessary, but insufficient, research milestone

Fewster–Smith (2008) proves an absolute QEI for a minimally coupled
Klein–Gordon field on four-dimensional globally hyperbolic spacetimes.
Its explicit evaluation requires the relevant local Hadamard expansion,
stress renormalization, state class and sampling terms. It would be
incorrect to equate a classical Einstein tensor to a quantum state
or declare that the earlier two-dimensional Flanagan formula applies here.

We instead implement the **actual four-dimensional fixed-background
scalar wave operator** and derive its radial scattering spectrum.
It constrains wave propagation and supplies a field-mode starting point
for future state construction, not a quantum energy inequality.

### Metric and separation

Our fixed, postulated Ellis/Morris–Thorne metric uses the regular proper
radial distance l in the full real line:

    ds²=-c²dt²+dl²+R(l)²[dθ²+sin²θ dφ²]
    R(l)=sqrt(l²+r0²), r0>0, signature (-,+,+,+)

With a *free classical minimally coupled massless test field* □φ=0, set

    φ=e^(-iωt) Y_(ell,m)(θ,φ) u_ell(l)/R(l).

The wave equation separates exactly:

    -d²u_ell/dl² + V_ell(l)u_ell=(ω²/c²)u_ell
    V_ell(l)=ell(ell+1)/R(l)² + R''(l)/R(l)
            =ell(ell+1)/(l²+r0²) + r0²/(l²+r0²)²

V has units m^-2. In x=l/r0 and kappa=ω r0/c:

    -u_xx + [ell(ell+1)/(1+x²)+1/(1+x²)²]u=kappa² u.

This potential is smooth, reflection-symmetric, and **nonnegative**
for nonnegative integer ell. The radial quadratic form
∫(|u'|²+V|u|²)dl is nonnegative for smooth compactly supported test modes.
That statement does NOT prove the coupled exotic-matter/gravity metric
is stable under arbitrary perturbations.

### Two-ended s-wave scattering (ell=0)

The scalar field encounters a short-range barrier
V_0=r0²/(l²+r0²)². Approximate the two asymptotic plane-wave bases
at +/- L r0 by cutting the numerical interval at x=+/-L.

Evolve two fundamental solutions from x=-L using fourth-order
Runge–Kutta; their 2x2 transfer matrix M has entries

    M = [[A, B], [C, D]], det(M)=AD-BC=1.

For a real potential and equal asymptotic wavenumber kappa:

    denominator = (C-kappa² B)² + kappa²(A+D)²
    T_power = 4 kappa² / denominator
    R_power = [(C+kappa² B)²+kappa²(D-A)²]/denominator.

The Wronskian determinant and flux T_power+R_power both approach one
when the integration is converged. Numerical errors are retained in
the output, not hidden or arbitrarily clamped.

**Important:** Higher ell require different asymptotic matching due
to the centrifugal 1/x² tail. The software displays higher-ell
potential profiles but implements transmission only for ell=0.

### Nontrivial independent published asymptotic

The paper *Transmission of low-energy scalar waves through a
traversable wormhole*, EPJC **80** (2020), DOI
https://doi.org/10.1140/epjc/s10052-020-08668-3 gives for the Ellis
wormhole in its ultrastatic class:

    s = ∫ dl / R(l)² = π/r0
    T_amplitude = -2i*k/s + O(k²),  k=ω/c
    |T|² / (k*r0)² -> 4/π² as k*r0 -> 0.

The numerical solver independently reproduces this low-k behavior.
The leading term is valid only for k*r0 << 1. It is not a universal
formula at high frequency.

### Independent verification

- Direct symbolic reduction from □φ=0 yields the radial potential.
- Test the barrier height and positive definiteness for ell=0..8.
- Compare numerical transmission against the **exact square-barrier**
  analytic formula for k² greater and less than the barrier height.
- Test Wronskian det(M)≈1 and T+R≈1, with numerical error retained.
- Compare finite coordinate cutoffs and verify rescaling r0 changes
  physical frequency but leaves dimensionless T unchanged.
- Compare the published Ellis low-k coefficient 4/π².

Example from numerical integration at dimensionless kappa=0.5:

    T ≈ 0.1858,  R ≈ 0.8142

These are classical wave powers of a hypothetical geometry, **not**
signals experimentally observed traveling through a wormhole.

### Reproduce

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli scalar-wave --throat-m 1 --kappa 0.5
    PYTHONPATH=src python -m phichronos.cli scalar-wave --throat-m 10 --kappa 0.03 --extent 36 --steps 5000
    cd web && npm install && npm run test && npm run build

### Research gate

Fewster–Smith, *Absolute quantum energy inequalities in curved
spacetime* (2008): https://arxiv.org/abs/gr-qc/0702056

The Klein–Gordon mode equation alone does NOT provide a unique
Hadamard vacuum, Wightman two-point function, locally renormalized
<T_ab> or a quantum inequality. We have **not** shown the required
exotic quantum matter exists, or that a wormhole survives semiclassical
backreaction. Keep QEI-007 open.
