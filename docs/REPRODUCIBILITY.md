# Reproducibility policy

Python model code needs only Python >=3.10 at runtime. Run tests from the repository root:

    PYTHONPATH=src python -m unittest discover -s tests -v

### Model assumptions
- Velocity examples compare ideal inertial clocks. A real round trip requires acceleration, spacecraft survival and trajectory geometry.
- Relativistic kinetic energy excludes exhaust, inefficiency, radiation shielding and any other spacecraft engineering.
- Schwarzschild stationary clocks require exterior nonrotating spherical geometry, not circular orbiting trajectories.
- Near-Earth altitude clock difference uses delta(rate)/rate ~= g h / c². Valid only to first order over the provided 10 km range, where variation of local g and rotation are neglected.
- Flat 1+1D interval classifications say nothing about curved-spacetime closed timelike curves.

### Validation protocol
A contribution should supply input values, physical units, model domain, code commit SHA, expected numerical output, tolerances, source DOI or URL, and limitations.

For purely theoretical CTC claims, provide the metric, signature, coordinate ranges, identification rules, stress-energy assumptions and an explicit analysis of whether a physically accessible history is known.

### Peer review standard
Independent replication comes before striking headlines. A quantum simulation of a time-loop *model* is not an observation of time-loop spacetime.
