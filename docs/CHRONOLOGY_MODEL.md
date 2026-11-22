# PhiChronos 0.3: chronology and topology lab

## Summary

A closed timelike curve (CTC) is a future-directed timelike worldline that closes in spacetime. We **do not simulate a physical mechanism to create such a worldline**. Instead, we impose a mathematical identification on flat 1+1-dimensional Minkowski spacetime and inspect the causal character of its generator.

This illustrative construction answers: *what mathematical conditions make a closed timelike loop exist if events are identified by fiat?* It does **not** answer: *can nature or engineering create this global identification?*

## Explicit geometry

Start with the covering space R^(1,1), coordinates (ct,x), in light-seconds; metric signature (+,−):

    ds² = d(ct)² − dx²

Choose a nonzero constant generator v=(Δct,Δx). Construct the quotient by identifying

    (ct,x) ~ (ct + n*Δct, x + n*Δx), n ∈ Z

The squared norm of the generator:

    ||v||² = (Δct)² − (Δx)²

- **Positive:** the generator is timelike. Its projection is a closed timelike worldline in the quotient (in the appropriate orientation); proper time per turn is sqrt(||v||²) seconds when coordinates are light-seconds.
- **Zero:** the generator is null. Its projection is a closed null curve, **not** a closed timelike generator.
- **Negative:** the generator is spacelike. This quotient is a spatial cylinder, and the identified generator is spacelike. A pure spacelike translation quotient of 1+1D Minkowski is causal and does not introduce CTCs.

The integer multiples of a generator are identified with the origin after taking the quotient, but the plotted endpoints in the **covering space** are distinct coordinate events.

For floating-point inputs within relative distance 1e-12 of the light-cone boundary, the tool labels the result null for numerical stability; this is not a proof about exactly-null mathematical vectors.

## What this does NOT model

- No dynamical topology change, stress-energy calculation, or Einstein equation solution generated from realistic matter.
- No chronology horizon, semiclassical backreaction, quantum gravity, traversable wormhole or actual communication into a real past.
- A timelike identification is explicitly built into the model. Its existence is **not evidence** that any laboratory could generate it.
- No statement about black-hole interiors or the Gödel solution follows from this quotient alone.

## Quantum postselection companion experiment

An independent **circuit toy** models one specific postselected Bell-pair protocol:

1. Prepare a chronology-respecting input |ψ> = α|0> + β|1>.
2. Prepare |Φ+> = (|00>+|11>)/sqrt(2) on two additional qubits.
3. Apply CNOT with the input as control and the first Bell qubit as target.
4. Postselect the Bell pair onto |Φ+>.

The effective Kraus operator is K = <Φ+|U|Φ+> = |0><0|. This gives:

    P(success) = |α|²
    output conditioned on success = |0>  (only if |α|²>0)

When |α|²=0, success is impossible and **no conditional output exists**. The browser slider adjusts |α|²; shot counts are *expectations*, not actual experiments.

This is an ordinary *probabilistic* postselection circuit. The P-CTC interpretation adds an idealized boundary condition where the retained outcome is treated as certain. Treating a filtered subset of trials as a 'time loop' **does not** physically send information backward.

## Independent references

- J.-P. Luminet, “Closed Timelike Curves, Singularities and Causality: A Survey from Gödel to Chronological Protection” (2021): https://doi.org/10.3390/universe7010012
- S. W. Hawking, “Chronology protection conjecture” (1992): https://doi.org/10.1103/PhysRevD.46.603
- Lloyd et al., “Closed timelike curves via postselection: Theory and experimental test of consistency” (2011): https://doi.org/10.1103/PhysRevLett.106.040403
- Huang et al., P-CTC information recovery simulation (2026): https://doi.org/10.1103/tm83-sxpm
- Kontou, “Wormhole Restrictions from Quantum Energy Inequalities” (2024): https://doi.org/10.3390/universe10070291

## Reproduce

From repository root:

    PYTHONPATH=src python -m unittest discover -s tests -v
    PYTHONPATH=src python -m phichronos.cli quotient --delta-ct 5 --delta-x 3 --turns 3
    PYTHONPATH=src python -m phichronos.cli postselect --prob-zero 0.5 --shots 1000

From web:

    npm run test

All model classifications have explicit limitations and do not establish the possibility of constructing a time machine.
