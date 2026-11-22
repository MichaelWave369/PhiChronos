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

### Lorentz boost consistency checks (v0.2)
- A positive beta means S′ moves toward +x relative to S. Events are transformed as t′=γ(t−βx/c), x′=γ(x−βct).
- The signed interval uses signature (+,−): s²=(cΔt)²−(Δx)². It is invariant under boosts, including for spacelike intervals.
- The web visual uses light-seconds for x and ct. Multiplying a time coordinate in seconds by c yields meters; one light-second is the distance c travels in one SI second.
- Event B is relative to event A at origin; boosted plotted axes are coordinate axes, not trajectories through a wormhole.
- Near a null interval numerical cancellation can cause rounding; compare with a scale-relative tolerance. Both Python and JS engines have independent tests.
