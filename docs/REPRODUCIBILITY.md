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

### Chronology quotient / postselection tests (v0.3)
- The identification (ct,x)~(ct+n Δct,x+n Δx) is imposed, not produced by local GR dynamics. Timelike identification produces a CTC in the quotient *by definition*. This is not empirical support for backward time travel.
- The quotient coordinates ct and x are measured in light-seconds. For a timelike generator, sqrt((Δct)²-(Δx)²) is proper time per turn in seconds. Null and spacelike generators do not define timelike proper time per turn.
- The Bell CNOT toy is an ordinary postselected quantum circuit model with effective Kraus operator |0><0| and success probability equal to input P(0). The result is conditional on successful postselection; zero-success events have no conditional output. Expected accepted/discarded counts are not physical measurements.
- The constraint matrix under research/ctc-constraints.json carries references, explicit physical obstacles, and statuses. Its integrity is checked by Python unit tests.

### Wormhole metric benchmark (v0.4)
- Selected explicit static metric: Phi=0, b(r)=r0²/r, r>=r0, two asymptotic ends. Coordinate r is degenerate at the throat, while l∈R with r(l)=sqrt(l²+r0²) is regular.
- Classical Einstein equations are evaluated in an orthonormal frame; stress components in J/m³ / Pa. A negative radial NEC is model-required classical stress, NOT proof that any quantum field can support it.
- Independent shape-coordinate and proper-radial calculations, finite-difference shape derivative, and stress conservation are checked numerically.
- No general QEI or backreaction bound has been computed; model is not empirically verified.

### v0.5 free scalar-field QEI
- Published 3/(32pi²) and 27/(2048pi²) bounds for a Lorentzian-sampled free massless 4D Minkowski scalar field; FE/FR ratio 9/64.
- Independent analytic and Simpson-integrated toy pulse sampling with clear non-physical-profile flag.
- Curved wormhole comparison is prohibited by a domain gate until quantum field states, curved theorem and backreaction are modeled.
