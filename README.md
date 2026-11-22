# Φ PhiChronos

**An open, reproducible computational laboratory for time, relativity, and causality.**

> **Research question:** Is time travel primarily an engineering challenge, a physics challenge, or fundamentally forbidden for some directions in time?

PhiChronos separates **measured effects**, **validated mathematical models**, and **unverified hypotheses**. The project does **not** claim that backward time travel is possible, or that simulating a closed timelike curve physically sends information to the past.

## What's working in v0.8

- **Relativity engine (Python stdlib):** Lorentz factor, elapsed proper time, relativistic kinetic energy, stationary Schwarzschild clock comparison, and local weak-field altitude comparison.
- **Causality tools:** classify timelike, lightlike, and spacelike separations in flat 1+1-dimensional spacetime.
- **Lorentz boost engine:** forward and inverse coordinate transforms, signed Minkowski intervals, causal regions, and tests of interval invariance.
- **Interactive Minkowski explorer:** two frames, light cones, tilted axes, presets, and transformed coordinates with live observer-velocity controls.
- **Chronology protection lab:** explicit flat-spacetime quotient/identification toy for timelike, null and spacelike generators; does not represent an engineered CTC.
- **Postselected Bell CNOT toy:** exact outcome probability, expected accepted/discarded shots, and explicit handling of zero-probability postselection.
- **Morris–Thorne wormhole constraints v0.4:** independent classical Einstein-tensor cross-checks for Phi=0, b(r)=r0²/r; radial NEC and local SI stress estimates; explicit QEI caveats.
- **Field-specific QEI v0.5:** Ford–Roman and Fewster–Eveson flat scalar bounds, analytic and numerical Lorentzian averaging, and a categorical audit refusing unjustified transfer to the curved wormhole.
- **Finite-support QEI v0.6:** a genuine C-infinity bump sampler on [-tau,tau], Eq. 5.5 from Fewster–Eveson, independent quadrature, quantum-state caveats and orthonormal wormhole curvature invariants.
- **Actual curved QEI v0.7:** Reproduces Flanagan's 2002 (corrected v4 2020) two-dimensional curved-spacetime inequality with a geodesic observer, exact curvature term, independent sampling quadrature, and strong dimensional guard: J/m ≠ 4D J/m³.
- **Four-dimensional scalar-wave modes v0.8:** derive the massless minimally coupled Klein–Gordon radial potential on the fixed Ellis throat; numerical s-wave two-ended scattering, analytic low-k paper cross-check, independent square-barrier calibration and flux conservation. **Not** a QEI or stability proof.
- **Cited CTC constraint matrix:** Gödel, Kerr, Tipler, wormholes, Hawking chronology protection, and Minkowski quotient, with limitations and evidence status.
- **Unit tests and GitHub Actions CI** for boundaries and reference values.
- **React research dashboard** with live forward-time-travel and altitude clock simulations; source links and epistemic status labels.
- **Evidence ledger + staged research program** to separate demonstrations, theoretical models, and speculation.

## Start with reproducible physics

Run Python tests with no third-party runtime dependencies:

    PYTHONPATH=src python -m unittest discover -s tests -v

Try the CLI:

    PYTHONPATH=src python -m phichronos.cli velocity --beta 0.99 --earth-years 7.08881205 --mass-kg 1000
    PYTHONPATH=src python -m phichronos.cli altitude --meters 1
    PYTHONPATH=src python -m phichronos.cli interval --dt-seconds 1 --distance-meters 1000
    PYTHONPATH=src python -m phichronos.cli boost --beta 0.6 --time-seconds 5 --x-meters 899377374
    PYTHONPATH=src python -m phichronos.cli quotient --delta-ct 5 --delta-x 3 --turns 3
    PYTHONPATH=src python -m phichronos.cli postselect --prob-zero 0.5 --shots 1000
    PYTHONPATH=src python -m phichronos.cli wormhole --throat-m 1 --ratio 1
    PYTHONPATH=src python -m phichronos.cli qei --tau-s 1e-15
    PYTHONPATH=src python -m phichronos.cli qei-audit --tau-s 1e-15 --throat-m 1
    PYTHONPATH=src python -m phichronos.cli qei-compact --tau-s 1e-15
    PYTHONPATH=src python -m phichronos.cli curvature-audit --tau-s 1e-15 --throat-m 1
    PYTHONPATH=src python -m phichronos.cli qei-curved2d --alpha 0.5 --length-m 1000000 --tau-s 0.01
    PYTHONPATH=src python -m phichronos.cli scalar-wave --throat-m 1 --kappa 0.5

For the browser dashboard:

    cd web
    npm install
    npm run dev
    npm run test

Live site: https://michaelwave369.github.io/PhiChronos/

## Ground rules

1. A successful numerical test verifies *implementation of the assumptions*, not the physical possibility of a time machine.
2. Special-relativistic forward time dilation and gravitational time dilation have experimental support.
3. Closed timelike curves arise in particular theoretical spacetime solutions; they have **not** been experimentally observed.
4. Postselected CTC quantum circuit experiments emulate a mathematical model, **not physical travel into the past**.
5. All claims must have a source, uncertainty/assumptions, reproducibility instructions, and a proposed falsification route.

Read [Four-dimensional scalar-wave modes](docs/SCALAR_MODES_4D.md), [Actual 1+1D curved QEI benchmark](docs/QEI_CURVED_2D.md), [Finite-support QEI and curvature diagnostics](docs/FINITE_SUPPORT_QEI.md), [Field-specific QEI model](docs/QEI_MODEL.md), [Wormhole model and constraints](docs/WORMHOLE_MODEL.md), [Chronology model](docs/CHRONOLOGY_MODEL.md), [Lorentz model methodology](docs/LORENTZ_MODEL.md), [Research Roadmap](docs/RESEARCH_ROADMAP.md), [Reproducibility](docs/REPRODUCIBILITY.md), and [Safety and Scope](docs/SAFETY_AND_SCOPE.md).

## Sources to begin

- [Transmission of low-energy scalar waves through a traversable wormhole (2020)](https://doi.org/10.1140/epjc/s10052-020-08668-3)
- [Scalar waves in a wormhole geometry (1994)](https://doi.org/10.1103/PhysRevD.49.853)
- Fewster and Smith, [Absolute quantum energy inequalities in curved spacetime (2008)](https://arxiv.org/abs/gr-qc/0702056)

- Flanagan, [Curved 2D quantum inequality (2002)](https://doi.org/10.1103/PhysRevD.66.104007), corrected [arXiv v4](https://arxiv.org/pdf/gr-qc/0208066), [2020 erratum](https://doi.org/10.1103/PhysRevD.102.129901)
- Fewster, [Extension to all globally hyperbolic 2D spacetimes (2004)](https://doi.org/10.1103/PhysRevD.70.127501)

- Fewster and Eveson, [Finite-duration smooth sampling, Eq. 5.5 (1998)](https://arxiv.org/pdf/gr-qc/9805024)
- Fewster and Smith, [Absolute quantum energy inequalities in curved spacetime (2008)](https://arxiv.org/abs/gr-qc/0702056)

- Fewster and Eveson, [Stronger Lorentzian sampled energy bound (1998)](https://doi.org/10.1103/PhysRevD.58.084010)

- Morris & Thorne, [Wormholes in spacetime and their use for interstellar travel (1988)](https://doi.org/10.1119/1.15620)
- Ford & Roman, [Quantum field theory constrains traversable wormhole geometries (1996)](https://doi.org/10.1103/PhysRevD.53.5496)

- Hawking, [Chronology protection conjecture (1992)](https://doi.org/10.1103/PhysRevD.46.603)
- Morris, Thorne and Yurtsever, [Wormholes, time machines and the weak energy condition (1988)](https://doi.org/10.1103/PhysRevLett.61.1446)
- Kontou, [Wormhole restrictions from quantum energy inequalities (2024)](https://doi.org/10.3390/universe10070291)
- Lloyd et al., [P-CTC postselection circuit (2011)](https://doi.org/10.1103/PhysRevLett.106.040403)
- [Constraint matrix](research/ctc-constraints.json)

- OpenStax, [The Lorentz Transformation](https://openstax.org/books/university-physics-volume-3/pages/5-5-the-lorentz-transformation)

- NIST, [Putting Einstein to the Test](https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test)
- NIST, [Relativity and Optical Clocks (2010)](https://www.nist.gov/publications/relativity-and-optical-clocks)
- Luminet, [Closed Timelike Curves, Singularities and Causality: A Survey (2021)](https://doi.org/10.3390/universe7010012)
- Huang et al., [Experimental simulation of postselected closed timelike curves (2026)](https://doi.org/10.1103/tm83-sxpm)
- [Retrocausal Capacity of a Quantum Channel (2026)](https://doi.org/10.1103/znyd-npk5)

## Contribution direction

Contributions are welcome for reproducible calculations, data provenance, independent verification, causal-structure analysis, and careful hypothesis testing. **Do not present simulation outputs as experimental evidence of backward time travel.** MIT licensed, part of the PHI369 Labs open research ecosystem.
