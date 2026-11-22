# Research roadmap | version 0.6

## The guiding question

Which time effects have been measured, which are extrapolations within accepted physical theories, and which require unknown physical resources or even a new theory?

## Phase 0 — Scientific hygiene (initialized)

- Source every substantive claim; distinguish peer review from news summaries.
- Define a model's coordinate systems, units, physical assumptions and parameter domain.
- Record a falsifiable prediction and a failure condition before running a simulation.
- Put reproducible code and automated checks alongside every result.

## Phase 1 — Verified time dilation (v0.1 working baseline)

- Implement special-relativistic constant-velocity clock comparison.
- Implement Schwarzschild stationary clock factors and local near-surface altitude approximation.
- Cross-check with measured clock experiments and known theoretical limits.
- Estimate energy costs with explicit exclusions (no vehicle design; no claim of feasibility).

**Exit criteria:** tests pass, result units are documented, and independent references support values.

## Phase 2 — Causality and geometry (v0.2 Minkowski explorer live)

**Completed:** 1+1D Lorentz boosts, interval invariance tests, causal region classification, interactive light cones and primed-frame coordinates. **Still open:** accelerating worldlines, curved metrics, chronology constraints and independent physics review.

- Build interactive 1+1D Minkowski diagrams and distinguish invariant intervals.
- Model light cones, future/past domains, simultaneity and accelerating observers.
- Explore published example metrics with symbolic checks; investigate if curves close in spacetime.
- Evaluate global assumptions, stability, horizon structure and geodesic completeness.

**Exit criteria:** every result states the metric and demonstrates equations, not just a plotted trajectory.

## Phase 3 — Candidate CTC models (v0.4 quantitative stress benchmark)

**v0.4 addition:** Implemented the Phi=0, b(r)=r0²/r static Morris–Thorne throat and a classical Einstein-equation stress/NEC calculation in SI, using independent shape-coordinate and proper-radial derivations. This is not a quantum viability demonstration. A local stress profile alone does not prove stability or constructibility.

**Implemented:** A sourced constraint ledger of six approaches/obstructions; a testable flat 1+1D cyclic quotient that illustrates a CTC only if timelike identification is imposed. **Not done:** deriving a dynamically formed physical time machine, energy-inequality solutions, global stability proofs.

- Literature-map Gödel, Kerr-related geometries, rotating cylinder proposals and traversable wormholes.
- Inventory energy conditions, exotic stress-energy requirements and chronology protection.
- Flag impossible boundary conditions rather than hiding them.
- Separate 'exists in a mathematical metric' from 'could be created in our universe.'

**Exit criteria:** a constraint matrix with arguments both for and against physical realizability.

## v0.6 - Finite-duration quantum sampling and curvature diagnostics

Implemented a C-infinity compactly supported 4D Minkowski sampler with finite time support, numerical reproduction of Fewster–Eveson Eq. 5.5, and independent quadrature and derivative checks. In the v0.4 ultrastatic wormhole, added orthonormal sectional curvatures, Ricci scalar, Kretschmann scalar and a bounded curvature-length diagnostic. **Not** a curved-spacetime QEI derivation, quantum state source, or backreaction solution. The original issue CTC-005 remains open for those research problems.

## v0.5 - Quantum energy inequality domain baseline

Implemented the Ford–Roman 1996 and Fewster–Eveson 1998 Lorentzian QEI lower bounds for a free 4D Minkowski scalar field, with unit tests, independent Simpson sampling checks and an explicit gate that refuses any unsupported wormhole QEI/backreaction verdict. The field-theory model and wormhole stress-tensor source remain distinct. Curved-spacetime theorems, quantum state sourcing and self-consistent semiclassical backreaction remain open.

## Phase 4 — Quantum-information model lab (v0.3 P-CTC circuit toy)

**Implemented:** Bell-state postselection of a CNOT on a three-qubit toy system, success probability accounting, zero-success boundary tests, independent amplitude contraction test. **Not done:** full circuit hardware reproduction, statistical sampling, general noisy quantum channels.

- Reproduce postselected CTC toy calculations, with postselection success probabilities and no-signaling caveats.
- Study how a model treats consistency and paradoxes.
- Track differences between P-CTC, Deutsch CTC and laboratory protocols.
- Never call postselection 'an actual message to yesterday.'

**Exit criteria:** independent numerical validation + explicit empirical status.

## Phase 5 — Decide the engineering question

- Define what observable effect would count as real backward information transfer.
- Design pre-registered protocols, baseline controls and a hostile independent review.
- Assess whether any candidate mechanism is compatible with field theory, energy limits and known measurements.

**Exit criteria:** either a realistic experimental prediction or a transparent negative/no-go result.

## Research issues to open

1. Validate weak-field height model against a NIST publication and uncertainty budget.
2. Add 1+1D Lorentz boost transformations and invariant tests. **Implemented in v0.2**.
3. Create evidence-record JSON schema and CI provenance validation.
4. Summarize chronology protection and quantum energy inequalities. **Initial sourced ledger in v0.3; deeper derivations open.**
5. Implement a *labeled simulation* of a postselected CTC protocol, including success rates. **One ideal Bell CNOT model in v0.3; hardware replication open.**

**An inconclusive or impossible result counts as progress if it rules out a bad assumption.**
