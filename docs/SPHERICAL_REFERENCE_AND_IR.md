# PhiChronos v1.0 | Flat spherical mode calibration and Ellis massless IR audit

## Why this is the correct next checkpoint

v0.9 reproduced the familiar 4D Minkowski vacuum Wightman function by direct
plane-wave spectral integration, and checked complex *classical* ell=0 scattering
channels on the fixed Ellis geometry. In v1.0 we calibrate spherical mode
decomposition against that SAME analytic Minkowski vacuum, then establish a
reproducible low-frequency operator fact about the complete Ellis spatial slice.
**Neither calculation is a curved Ellis Hadamard state or a renormalized stress.**

## 1. Independent spherical partial-wave reference in 3+1D flat space

Let two spatial vectors have lengths a,b and angle gamma; their Euclidean
separation is d=sqrt(a²+b²-2ab cos gamma). The spherical Bessel/Legendre
addition theorem gives:

    sinc(k d) = sum_(ell=0)^infty (2ell+1)
                 j_ell(k a) j_ell(k b) P_ell(cos gamma)

with sinc(z)=sin(z)/z. This follows from the Rayleigh plane-wave expansion
and the addition theorem for spherical harmonics.

Source: NIST DLMF spherical Bessel addition theorems (section 10.60),
https://dlmf.nist.gov/10.60 ; also
https://academic.oup.com/mnras/article/476/4/4403/4875946 .

Insert this **angle-resolved** partial-wave sum into the flat *positive
frequency* spectral representation (natural units c=hbar=1):

    W_epsilon = (1/4pi²) integral_0^infinity dk
      k e^(-epsilon k) e^(-ik delta_ct)
      [sum_(ell=0)^infinity (2ell+1) j_ell(k a) j_ell(k b) P_ell(cos gamma)].

It reconstructs the exact **4D Minkowski** vacuum result

    W_epsilon = 1/(4pi² [d²-(delta_ct-i epsilon)²]).

Two independent comparisons are calculated: the v0.9 direct angular-integrated
spectral quadrature and the exact closed form.

The displayed ell_max cutoff (at most 40), finite wave-number cutoff K, and
Simpson discretization have separate limitations. A rigorous frequency-tail
bound applies to the omitted K→infinity contribution by |sum|<=1, but there
is NO rigorous spherical ell truncation bound in the app. Increasing
ell_max and the integration resolution tests convergence, not a proof of
uniform completeness or UV regularity.

A stable spherical Bessel implementation uses upward recurrence for
z>ell_max+4 and scaled Miller downward recurrence elsewhere, with small-z
series to avoid catastrophic cancellation. Tests use analytic j0/j1,
recurrence residuals, the all-angle addition theorem, coincidence sum
sum(2ell+1)j_ell²=1, and 4D Wightman convergence.

## 2. A real low-frequency theorem gate on the Ellis spatial slice

The ultrastatic Ellis spatial metric is

    h=dl²+(l²+r0²)dOmega²,  -infinity<l<infinity.

Its spatial slice is smooth and complete: radial proper distance to either
end is infinite and S² cross-sections are everywhere nonzero. The standard
ultrastatic completeness criterion implies a globally hyperbolic background.
See https://doi.org/10.1007/s00029-023-00860-z .

The positive spatial massless Klein–Gordon operator A=-Delta_h satisfies,
for every real smooth compactly supported trial field psi(l) constant in
angles, the Rayleigh quotient

    Q[psi] = integral dl (l²+r0²)|psi'(l)|²
             / integral dl (l²+r0²)|psi(l)|²    [m^-2].

Choose a smooth, compact bump b(u)=exp(-1/(1-u²)) for |u|<1, zero outside.
Let width W>0 and center at l=12W on ONE asymptotic end:

    psi_W(l)=b((l-12W)/W).

Its support is [11W,13W], so it stays far from the throat, and

    Q[psi_W] = 1/W² *
       {integral_-1^1 [(12W+Wu)²+r0²]|b'(u)|²du}
       /{integral_-1^1 [(12W+Wu)²+r0²]|b(u)|²du}.

The ratio of dimensionless integrals tends to a finite positive constant
(~3.084965...) as W→infinity at fixed throat radius r0. Therefore Q→0
**rigorously for this test family**. Combined with the nonnegative
quadratic form, this shows the spectrum has infimum zero: the massless
spatial operator is NOT bounded below by a strictly positive gap.

This does **not** exhibit a normalizable zero eigenvector, prove an
infrared divergence of all state correlators, or imply absence of
an admissible Hadamard state. Gaplessness and zero-eigenvalue are
different facts; the massless field in 3+1D can have well-defined
noncoincident correlations despite no positive spectral gap.

The UI plots Q for selectable widths, and exposes this caveat.

## 3. Not yet done

- Complete and delta-normalize both Ellis asymptotic scattering channels
  for all angular ell (higher angular modes have centrifugal tails).
- Verify global KG completeness and rigorously control large ell, high
  frequency and k→0 behavior of the full curved quantum mode sum.
- Construct a Hadamard two-point function on Ellis and its parametrix.
- Compute renormalized <T_ab>, an actual curved 4D QEI, and backreaction.

No results in v1.0 assert these milestones have been met.

## 4. Reproduction

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli wightman-spherical --radius1-m 0.7 --radius2-m 0.9 --cos-angle 0.4 --delta-ct-m 0.3 --epsilon-m 0.5 --ell-max 24
    PYTHONPATH=src python -m phichronos.cli ellis-infrared --throat-m 1 --width-m 100
    cd web && npm ci && npm run test && npm run build

The methodology explicitly separates a **verified flat Wightman benchmark**
from a **variational theorem about the curved Ellis spatial operator**.
