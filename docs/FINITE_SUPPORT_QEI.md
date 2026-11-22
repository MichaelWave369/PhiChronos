# PhiChronos v0.6 | Finite-support quantum inequality and curvature diagnostics

## Published result

Fewster and Eveson, Physical Review D **58**, 084010 (1998), Eq. (5.5):
https://arxiv.org/pdf/gr-qc/9805024

The **flat-space** bound for a free real massless minimally coupled scalar field in four-dimensional Minkowski spacetime along an inertial worldline, vacuum-normal-ordered relative to the Minkowski vacuum, is:

    integral dt g(t)^2 < :T_00(t): > >=
        -hbar/(16*pi^2*c^3) * integral dt |g''(t)|^2

For a real, smooth, compactly supported test function g, normalized with integral g^2 dt = 1. The inequality is a lower bound; its coefficient is not asserted to be optimal. The original 1998 paper discusses formal aspects; later rigorous curved-space results exist, including Fewster and Smith 2008, but are not numerically evaluated here.

## Our C-infinity compact sampler

We choose a genuinely smooth test function with a finite support, rather than abruptly clipping a Lorentzian or using a finite-differentiability polynomial.

    b(u) = exp(-1/(1-u^2))  for -1<u<1, and zero otherwise
    I0 = integral_-1^1 b(u)^2 du
    g_tau(t) = b(t/tau)/sqrt(tau*I0)

Then the support in physical time is [-tau,tau] and g_tau has the required unit L2 norm. The analytic second derivative is

    b''(u) = b(u) * (6*u^4 - 2) / (1-u^2)^4

and

    I2 = integral_-1^1 |b''(u)|^2 du
    integral dt |g_tau''(t)|^2 = (I2/I0)/tau^4.

Numerically:
- I0 = 0.1330861208449943
- I2 = 10.83426781139888
- I2/I0 = 81.40794654325808

We cross-check composite Simpson quadrature with an independently implemented midpoint quadrature. Both Python and JavaScript calculate these integrals, not just look up a magic coefficient.

Restoring SI units:

    bound(tau) = -hbar/(16*pi^2*c^3*tau^4) * (I2/I0)

For tau=1e-15 s, bound = approximately -2.01772104785 J/m^3. This differs from the *Lorentzian* bound in v0.5 because we deliberately selected another sampling window with different derivatives and support. It is **not** a wormhole-specific number or negative energy that we can source.

## Reproducible toy exclusion

A hypothetical negative constant value -A *within the finite support* would have sampled average -A due to unit normalization. If A exceeds the magnitude of this flat-space bound, that local trial segment is inconsistent with the selected flat quantum field assumptions.

Neither a passing trial nor a failing one builds a quantum state. No quantum operator, state, or experimental apparatus is constructed. The stress outside the support does not contribute to this single test.

## Independent wormhole curvature audit

For the ultrastatic v0.4 Morris–Thorne geometry, set R(l)=sqrt(l^2+r0^2). The only independent **spatial** orthonormal sectional curvatures are

    R_ltheta_ltheta = R_lphi_lphi = -r0^2/R^4
    R_thetaphi_thetaphi = +r0^2/R^4.

Timelike components vanish in the ultrastatic product. Hence for this chosen Riemann convention:

    Ricci scalar = -2*r0^2/R^4   [1/m^2]
    Kretschmann = 12*r0^4/R^8  [1/m^4]

The max orthonormal component magnitude is k=r0^2/R^4. Define a **diagnostic** curvature length L_comp = k^(-1/2) = R^2/r0. At the throat L_comp=r0. Another diagnostic is |Ricci|^(-1/2)=R^2/(sqrt(2)*r0).

The finite-window scale ratio c*tau/L_comp is displayed. It is NOT an error bound or proof of a local-flat-space approximation.

## The curved-spacetime gap is still OPEN

The wormhole needs a specific field, a renormalized Hadamard quantum state, and the correct curved-spacetime sampled-energy bound. The 2008 Fewster–Smith curved-space theorem is a *research reference*, NOT a computed result in v0.6.

Finite support removes the Lorentzian's infinite temporal tails but **does not transfer** the Minkowski theorem to a generic curved geometry. No self-consistent semiclassical Einstein solution or backreaction test is performed.

Every curvature audit outputs qei_compliance=null and backreaction_evaluated=false; numerical inputs cannot override those fields. Negative classical throat stress is not a constructed quantum state.

## Numerical validation

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli qei-compact --tau-s 1e-15
    PYTHONPATH=src python -m phichronos.cli qei-compact --tau-s 1e-15 --plateau-amplitude-j-m3 3
    PYTHONPATH=src python -m phichronos.cli curvature-audit --throat-m 1 --ratio 1 --tau-s 1e-15

    cd web
    npm install
    npm run test
    npm run build

## Primary sources
- Fewster & Eveson 1998, Eq. 5.5: https://arxiv.org/pdf/gr-qc/9805024
- Fewster & Smith 2008, curved-space absolute QEI: https://arxiv.org/abs/gr-qc/0702056
- Morris & Thorne 1988 metric: https://doi.org/10.1119/1.15620
