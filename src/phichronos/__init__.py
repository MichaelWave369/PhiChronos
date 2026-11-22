"""PhiChronos: tested models, not claims of time-machine feasibility."""
from .relativity import lorentz_factor, proper_time_years, kinetic_energy_joules
from .relativity import schwarzschild_clock_rate, altitude_time_gain_ns_per_day
from .causality import classify_interval, proper_time_seconds
from .boost import lorentz_boost, minkowski_interval_m2, event_separation, causal_region
from .chronology import quotient_analysis, winding_history
from .postselection import postselected_cnot
from .wormhole import evaluate_wormhole, areal_radius_m, stress_from_shape, stress_from_proper_radial
from .qei import flat_qei_bounds, sampled_toy_pulse, wormhole_domain_audit
__all__ = [
    "lorentz_factor", "proper_time_years", "kinetic_energy_joules",
    "schwarzschild_clock_rate", "altitude_time_gain_ns_per_day",
    "classify_interval", "proper_time_seconds",
    "lorentz_boost", "minkowski_interval_m2", "event_separation", "causal_region",
    "quotient_analysis", "winding_history", "postselected_cnot",
    "evaluate_wormhole", "areal_radius_m", "stress_from_shape", "stress_from_proper_radial",
    "flat_qei_bounds", "sampled_toy_pulse", "wormhole_domain_audit",
]
