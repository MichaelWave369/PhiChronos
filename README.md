# Φ PhiChronos

**An open, reproducible computational laboratory for time, relativity, and causality.**

> **Research question:** Is time travel primarily an engineering challenge, a physics challenge, or fundamentally forbidden for some directions in time?

PhiChronos separates **measured effects**, **validated mathematical models**, and **unverified hypotheses**. The project does **not** claim that backward time travel is possible, or that simulating a closed timelike curve physically sends information to the past.

## What's working in v0.1

- **Relativity engine (Python stdlib):** Lorentz factor, elapsed proper time, relativistic kinetic energy, stationary Schwarzschild clock comparison, and local weak-field altitude comparison.
- **Causality tools:** classify timelike, lightlike, and spacelike separations in flat 1+1-dimensional spacetime.
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

For the browser dashboard:

    cd web
    npm install
    npm run dev

Live site (after Pages is enabled): https://michaelwave369.github.io/PhiChronos/

## Ground rules

1. A successful numerical test verifies *implementation of the assumptions*, not the physical possibility of a time machine.
2. Special-relativistic forward time dilation and gravitational time dilation have experimental support.
3. Closed timelike curves arise in particular theoretical spacetime solutions; they have **not** been experimentally observed.
4. Postselected CTC quantum circuit experiments emulate a mathematical model, **not physical travel into the past**.
5. All claims must have a source, uncertainty/assumptions, reproducibility instructions, and a proposed falsification route.

Read [Research Roadmap](docs/RESEARCH_ROADMAP.md), [Reproducibility](docs/REPRODUCIBILITY.md), and [Safety and Scope](docs/SAFETY_AND_SCOPE.md).

## Sources to begin

- NIST, [Putting Einstein to the Test](https://www.nist.gov/atomic-clocks/a-powerful-tool-for-science/putting-einstein-test)
- NIST, [Relativity and Optical Clocks (2010)](https://www.nist.gov/publications/relativity-and-optical-clocks)
- Luminet, [Closed Timelike Curves, Singularities and Causality: A Survey (2021)](https://doi.org/10.3390/universe7010012)
- Huang et al., [Experimental simulation of postselected closed timelike curves (2026)](https://doi.org/10.1103/tm83-sxpm)
- [Retrocausal Capacity of a Quantum Channel (2026)](https://doi.org/10.1103/znyd-npk5)

## Contribution direction

Contributions are welcome for reproducible calculations, data provenance, independent verification, causal-structure analysis, and careful hypothesis testing. **Do not present simulation outputs as experimental evidence of backward time travel.** MIT licensed, part of the PHI369 Labs open research ecosystem.
