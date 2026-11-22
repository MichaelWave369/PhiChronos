# PhiChronos v0.9 | Quantum-field reference and two-ended s-wave phase audit

## Purpose and precise status

This milestone provides a known **four-dimensional Minkowski positive-frequency
vacuum** benchmark plus asymptotically normalized **classical Ellis scalar
scattering channels**. It does **NOT** define a full quantum state on the
curved Ellis geometry, prove a Hadamard short-distance condition, calculate
renormalized stress, or evaluate the absolute 4D Fewster–Smith QEI.

### A genuine 4D flat-space Wightman reference

For a free real massless scalar, in natural units with hbar=c=1:

    W_epsilon(Delta x^0,r)
      = 1/[4 pi² (r²-(Delta x^0-i epsilon)²)],
      Delta x^0=c Delta t, epsilon>0 [metres].

This is the positive-frequency Minkowski vacuum Wightman two-point function,
with an exponential ultraviolet convergence regulator. Values have units
**m^-2 for this field normalization**, not J/m³. The regulator is not a
physical measurement, and epsilon→0 is a DISTRIBUTIONAL limit rather than
naively setting epsilon=0 on the null cone or at coincidence.

Independently reproduce the known expression by angularly integrating the
positive-frequency vacuum mode expansion:

    W_epsilon = (1/(4 pi²)) integral_0^infinity dk
         k exp(-epsilon k) exp(-i k Delta x^0) sinc(k r),

    sinc(z)=sin(z)/z, k in inverse metres, k>=0.

Use finite cutoff K and composite Simpson quadrature to check analytic real
and imaginary parts. A conservative absolute upper bound on the omitted tail is

    |tail| <= exp(-epsilon K) [K/epsilon + 1/epsilon²] / (4 pi²)

because |sinc|<=1; **this bound covers truncation only, not quadrature
discretization error**. Tests include time reversal complex conjugation,
the regulated coincidence scaling W(0,0,epsilon)∝epsilon^-2, positivity
of a finite Wightman Gram matrix and comparison to the independent numeric
spectral integral.

### Real 4D curved Ellis s-wave scattering amplitudes

The background and massless minimally coupled scalar radial equation are
fully derived in [SCALAR_MODES_4D.md](SCALAR_MODES_4D.md).

With dimensionless proper distance x=l/r0 and kappa=omega*r0/c, numerically
integrate the real radial transfer matrix

    [u(+L) ]   [A B] [u(-L) ]
    [u'(+L)] = [C D] [u'(-L)].

Choose local boundary-plane-wave phases:

    x=-L: u=e^{i kappa(x+L)} + r e^{-i kappa(x+L)}
    x=+L: u=t e^{i kappa(x-L)}.

Then define

    q = C - kappa² B - i kappa(A+D)
    r = -[C+kappa² B+i kappa(D-A)]/q
    t = -2 i kappa/q.

This implies, for the real parity-symmetric s-wave barrier, an approximately
unitary two-channel scattering matrix S=[[r,t],[t,r]] at finite cutoff, with

    |r|² + |t|² ≈ 1
    Re(r* conjugate(t)) ≈ 0
    AD-BC ≈ 1.

Check amplitudes against the independently implemented **power-only**
scattering solver and against the empty-potential phase t=e^{2ikappa L}.
Numerical current and Wronskian residuals are reported rather than silently
repaired.

### Formal continuum Klein–Gordon mode factor

For **both** left- and right-incident s-wave scattering channels, normalized
with respect to delta(kappa-kappa') on a complete ultrastatic spatial slice,
the formal mode (using coordinate ct, normalized Y_00, and hbar=c=1) is

    phi_kappa(t,l,Omega) =
      N_kappa e^{-i kappa ct/r0}
      Y_00(Omega) u_kappa(l/r0) / sqrt(l²+r0²),

    N_kappa = 1/sqrt(4 pi kappa).

This factor follows the asymptotic continuum normalization

    2 kappa * (2 pi) * |N_kappa|² = 1.

**Important:** this is an *asymptotic continuum normalization
convention*. Verifying the full global Klein–Gordon delta-orthogonality,
completeness, all ell angular modes, IR and UV behavior, and the Hadamard
property is not done. A computed S matrix cannot be used as a Wightman
function by simply inserting an unverified mode sum.

### Unresolved prerequisite for a 4D curved QEI

Fewster and Smith (2008), *Absolute quantum energy inequalities in curved
spacetime*, Annales Henri Poincare 9, 425–455,
https://doi.org/10.1007/s00023-008-0361-0 and
https://arxiv.org/abs/gr-qc/0702056.

Their local geometric construction uses the curved Hadamard parametrix,
point-split stress operator, renormalization conventions and appropriate
worldline sampling. Our Wightman reference above is **FLAT**, and the Ellis
s-wave is **ONLY ONE ANGULAR CHANNEL** and lacks the UV-complete mode sum.

**A formal field vacuum, a renormalized stress value, a rigorous QEI bound,
and self-consistent semiclassical Einstein backreaction remain UNDETERMINED.**

### Repeat checks

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli wightman-flat4d --delta-ct-m 0.3 --separation-m 0.7 --epsilon-m 0.5
    PYTHONPATH=src python -m phichronos.cli ellis-mode --throat-m 1 --kappa 0.5
    cd web && npm ci && npm run test && npm run build

### Sources

- Massless 4D positive-frequency Hadamard/Wightman formula:
  https://qft.org/curved-spacetime/hadamard-short-distance/
- Fewster–Smith absolute 4D curved QEI:
  https://doi.org/10.1007/s00023-008-0361-0
- Ellis s-wave comparison:
  https://doi.org/10.1140/epjc/s10052-020-08668-3

The numerical comparisons and asymptotic scattering amplitudes are a
scientific prerequisite, not evidence of an observed wormhole.
