# PhiChronos v0.7: genuine curved-spacetime QEI in a 1+1D reference geometry

## Why 2D?

Our v0.4 wormhole is a **3+1D** classical spacetime. The v0.5–0.6 QEI calculations are only valid in **flat 3+1D spacetime**. A fully quantitative curved 3+1D wormhole QEI requires a specified field, Hadamard state, renormalization, curved Hadamard parametrix and backreaction.

Instead of silently borrowing a flat bound, we reproduce a proven, mathematically simpler **curved 1+1D** reference inequality. The dimensions are different: result in **J/m**, never J/m³. We do not claim it bounds the 4D wormhole.

## Published theorem, assumptions and corrected provenance

Flanagan, *Quantum inequalities in two dimensional curved spacetimes*, Phys. Rev. D 66, 104007 (2002), Eq. 1.7, DOI: https://doi.org/10.1103/PhysRevD.66.104007. ArXiv corrected **v4 (December 3, 2020)**: https://arxiv.org/pdf/gr-qc/0208066.

A **2020 erratum** to Sec. II exists: https://doi.org/10.1103/PhysRevD.102.129901. We reference the corrected v4 and implement only the main timelike bound Eq. 1.7.

For a real free massless scalar quantum field on a globally conformal 2D Minkowski spacetime, an arbitrary timelike worldline gamma, and a smooth nonnegative sampling function rho along proper length ell, in the curvature convention of the paper and geometric units:

    ∫ dℓ rho(ℓ) <T_ab u^a u^b> >=
       -1/(24π) ∫ dℓ [(rho'(ℓ))²/rho(ℓ) + rho(ℓ) a² + rho(ℓ) R].

Here u is unit tangent, a is proper acceleration (geometric units), R is Ricci scalar. For a normalized sampler ∫rho dℓ=1, this is a lower bound on sampled energy density. The theorem is stronger than a trial calculation but is **not** a constructed quantum state.

Fewster (2004) extends two-dimensional results to globally hyperbolic backgrounds: https://doi.org/10.1103/PhysRevD.70.127501. This package uses only the original globally conformal hypotheses.

## Curved reference metric and observer

In (-,+) signature:

    ds² = exp[2sigma(x)] (-c² dt² + dx²)
    sigma(x) = alpha * exp[-x²/(2L²)], alpha ∈ [0,1], L>0.

The conformal factor is smooth, bounded and strictly positive on all of R^(1+1); spacetime is globally conformal to Minkowski. At x=0:

    sigma'(0)=0; observer at x=0 is static and geodesic, a²=0.
    sigma''(0)= -alpha/L².
    R(0) = -2 exp[-2alpha] sigma''(0)
         = 2alpha exp[-2alpha]/L²   [m^-2].

No field equation constrains sigma here: the metric is a *chosen* curved background on which we may apply the 2D quantum inequality. The observer's proper time is d tau_proper = exp(alpha) dt coordinate, while our user-facing sampling tau is a **proper-time** half-width (not coordinate time).

## Normalized compact sampler

Use the same C-infinity bump as v0.6:

    b(u)=exp[-1/(1-u²)] for |u|<1, zero outside.
    g_tau(t)=b(t/tau)/sqrt(tau*I0), rho_tau=g_tau².
    I0=∫_-1^1 b²du = 0.1330861208449943
    b'(u)= -2u b(u)/(1-u²)².
    I1=∫_-1^1 b'(u)²du = 0.40958706075277
    D = 4I1/I0 = 12.310436524927102.

Integrating rho'(t)²/rho(t) gives D/tau²; ∫rho=1, so for the static geodesic observer the acceleration term vanishes.

## Restore physical SI dimensions carefully

The theorem uses geometric proper length ell=c*t with ℏ=c=1. **Energy per length in 1+1D** must be reported in J/m:

    bound_2D = -(ℏ / 24πc) * D/tau_seconds²
               -(ℏ c / 24π) * R(0)       [J/m].

The first term scales as 1/tau²; the curvature term does not depend on tau for our static center observer. At alpha=0, R=0 and the formula reproduces the 2D flat Minkowski limit. Units differ from 4D QEI by TWO dimensions and cannot be compared.

For alpha=0.5, L=1e6 m, tau=0.01 s (proper time), the separate contributions are approximately:

    sampling contribution = -5.743383245349684e-40 J/m
    curvature contribution = -1.5425571662321298e-40 J/m
    combined lower bound = -7.285940411581813e-40 J/m.

These are exact-model results within numerical quadrature tolerance, not measured energy or a produced field state.

## Verification and limitations

- Simpson and midpoint independently calculate I0 and I1, verifying the coefficient.
- Compare analytic b' with finite differences of b, and analytic R with a finite-difference second derivative of sigma.
- Check alpha=0 flat limit, inverse-square proper-time scaling, curvature correction, dimension labels and input domain.
- The known 2020 erratum is linked and corrected v4 used. No claim that the original paper was free from errors.
- No admissible quantum state has been explicitly constructed; a negative plateau that passes the bound is not shown realizable.
- No 4D curved-QEI formula, no renormalized stress tensor solving a 4D wormhole metric, and no backreaction stability proof.

## Reproduce

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli qei-curved2d --alpha 0.5 --length-m 1000000 --tau-s 0.01
    PYTHONPATH=src python -m phichronos.cli qei-curved2d --alpha 0 --length-m 1000000 --tau-s 0.01
    cd web && npm install && npm run test && npm run build

This is a test of a real theorem in a *different* physical dimension. Transfer to the 4D wormhole is categorically prohibited.
