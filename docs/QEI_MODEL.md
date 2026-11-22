# v0.5: Field-specific quantum energy inequality research

This project reproduces TWO published lower bounds for vacuum-normal-ordered
renormalized energy density of a free real, massless, minimally coupled scalar
field in four-dimensional Minkowski spacetime, along an inertial observer, with
a normalized Lorentzian sampler.

Sampler: g_tau(t)=tau/[pi*(t^2+tau^2)], integrating to 1 over all real time.

For SI joules per cubic meter, with hbar=h/(2*pi), h=6.62607015e-34 J s
and c=299792458 m/s:

    Ford–Roman:      averaged_density >= -3*hbar/(32*pi^2*c^3*tau^4)
    Fewster–Eveson:  averaged_density >= -27*hbar/(2048*pi^2*c^3*tau^4)
    coefficient ratio FE/FR = 9/64.

The Fewster–Eveson lower bound is stronger for the selected field and
Lorentzian sampler. These coefficients are published non-optimality-agnostic
bounds; we do NOT claim their universal optimality.

## Test function (not a quantum state)

A purely illustrative classical pulse with only negative values:

    rho_trial(t) = -A/(1+(t/T)^2)
    integral g_tau(t)*rho_trial(t) dt = -A*T/(T+tau).

An independent Simpson quadrature via t=tau*tan(theta), theta from -pi/2
to pi/2 verifies the analytic convolution. A profile that violates a QEI
is excluded as the renormalized energy expectation of THIS field under
THESE assumptions. Passing one QEI is not sufficient to construct a state.
A negative-only profile over all time typically fails the inequality when
averaged over sufficiently long intervals; a physical state needs additional
structure that the toy does not model.

## Curved wormhole transfer is not proved

The wormhole model from v0.4 is a curved Morris–Thorne solution that
postulates a classical stress tensor, not an explicit quantum state.
Our gate reports a Ricci-derived curvature length
L_R=|R|^-1/2 = r^2/(sqrt(2)*r0) and sampling length c*tau,
but ALWAYS withholds any QEI compliance or backreaction verdict.

The Ricci length is only one curvature diagnostic, not a bound on all
curvature components. The Lorentzian sampler has infinite temporal tails:
c*tau << L_R does NOT by itself prove that this flat-space inequality is
valid on the wormhole. No curved-state Hadamard construction, renormalized
stress-energy calculation, or self-consistent semiclassical Einstein
equation has been performed. No verified no-go theorem for this specific
wormhole follows solely from these calculations.

Numerical domains tau,T in [1e-24,1e-3] seconds are code limits, not a
physical assertion of viability at all those scales. Model values have
floating-point uncertainties and idealized-theory uncertainties; they are
not measured laboratory uncertainties.

## Reproduce

Run PYTHONPATH=src python -m unittest discover -s tests -v.
Then use the CLI:

    PYTHONPATH=src python -m phichronos.cli qei --tau-s 1e-15
    PYTHONPATH=src python -m phichronos.cli qei --tau-s 1e-15 --pulse-amplitude-j-m3 0.01 --pulse-width-s 1e-15
    PYTHONPATH=src python -m phichronos.cli qei-audit --tau-s 1e-15 --throat-m 1 --ratio 1

## Primary sources

Ford and Roman (1996), Phys Rev D 53, 5496:
https://doi.org/10.1103/PhysRevD.53.5496

Fewster and Eveson (1998), Phys Rev D 58, 084010 (Eq 5.6):
https://doi.org/10.1103/PhysRevD.58.084010

Kontou review (2024), Universe 10, 291:
https://doi.org/10.3390/universe10070291

NIST 2022 CODATA reduced Planck constant:
https://physics.nist.gov/cgi-bin/cuu/Value?hbar
