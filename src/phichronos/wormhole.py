"""An explicit Morris–Thorne / Ellis-type static wormhole stress-energy model.

Metric in SI, signature (-,+,+,+):
    ds² = -c² dt² + dr²/(1 - r0²/r²) + r² dΩ²
    r >= r0 > 0, with TWO identical asymptotically flat ends.

The proper radial coordinate l in (-inf, inf) gives r²=l²+r0², removing
the coordinate singularity at the throat. Phi(r)=0, b(r)=r0²/r.

IMPORTANT: This is a *postulated geometry* and its supporting stress-energy
derived from classical Einstein equations, not a source of exotic matter or
an engineering design. Values are local orthonormal-frame energy density
and pressure (J/m³ = Pa), not a total vehicle energy budget.

Reference: Morris & Thorne, Am J Phys 56, 395 (1988), doi:10.1119/1.15620.
"""
from __future__ import annotations
import math

from .relativity import C, G, _finite_number

KAPPA_ENERGY = C**4 / (8.0 * math.pi * G)  # J/m per meter? multiply by curvature m^-2 to obtain J/m³
MIN_THROAT_M = 1e-3
MAX_THROAT_M = 1e9
MAX_RATIO = 1000.0


def _throat(value: float) -> float:
    r0 = _finite_number("throat_m", value)
    if not MIN_THROAT_M <= r0 <= MAX_THROAT_M:
        raise ValueError(f"throat_m must be in [{MIN_THROAT_M}, {MAX_THROAT_M}] meters")
    return r0


def _radius(throat_m: float, radius_m: float) -> tuple[float, float, float]:
    r0 = _throat(throat_m)
    radius = _finite_number("radius_m", radius_m)
    ratio = radius / r0
    if not 1.0 <= ratio <= MAX_RATIO:
        raise ValueError(f"radius_m must satisfy throat_m <= radius_m <= {MAX_RATIO} * throat_m")
    return r0, radius, ratio


def shape_function_m(throat_m: float, radius_m: float) -> float:
    """b(r) = r0²/r, meters."""
    r0, r, _ = _radius(throat_m, radius_m)
    return r0**2 / r


def shape_derivative(throat_m: float, radius_m: float) -> float:
    """b'(r) = -r0²/r², dimensionless."""
    r0, r, _ = _radius(throat_m, radius_m)
    return -(r0/r)**2


def areal_radius_m(throat_m: float, proper_l_m: float) -> float:
    """Areal radius r(l)=sqrt(l²+r0²) on BOTH sides of the throat."""
    r0 = _throat(throat_m)
    l = _finite_number("proper_l_m", proper_l_m)
    if abs(l) > MAX_RATIO * r0:
        raise ValueError("proper_l_m exceeds educational model domain")
    return math.hypot(l, r0)


def proper_radial_m(throat_m: float, radius_m: float, side: int = 1) -> float:
    """Inverse proper coordinate: +/-sqrt(r²-r0²). Choose side +1/-1."""
    r0, r, _ = _radius(throat_m, radius_m)
    if side not in (-1, 1) or isinstance(side, bool):
        raise ValueError("side must be -1 or +1")
    return side * math.sqrt(max(0.0, (r-r0)*(r+r0)))


def stress_from_shape(throat_m: float, radius_m: float) -> dict[str, float]:
    """Einstein-equation components via b(r), b'(r), Phi'=0."""
    r0, r, _ = _radius(throat_m, radius_m)
    b = r0*r0/r
    db = -r0*r0/(r*r)
    density = KAPPA_ENERGY * db / (r*r)
    radial = -KAPPA_ENERGY * b / (r**3)
    tangent = KAPPA_ENERGY * (b-r*db)/(2*r**3)
    return {
        "energy_density_j_m3": density,
        "radial_pressure_pa": radial,
        "tangential_pressure_pa": tangent,
        "radial_nec_j_m3": density + radial,
        "tangential_nec_j_m3": density + tangent,
    }


def stress_from_proper_radial(throat_m: float, proper_l_m: float) -> dict[str, float]:
    """Independent orthonormal Einstein-tensor construction in proper l.

    r(l)=sqrt(l²+r0²). Writing R'=dr/dl, R''=d²r/dl²:
    G_(tt)=(1-R'^2-2 R R'')/R², G_(ll)=(R'^2-1)/R²,
    G_(theta theta)=R''/R. Here G_(tt) corresponds to epsilon,
    not a mixed-index tensor component. This computes the SAME
    physical stress using a different coordinate representation.
    """
    r0 = _throat(throat_m)
    r = areal_radius_m(r0, proper_l_m)
    rp = proper_l_m / r
    rpp = (r0 / r)**2 / r
    density = KAPPA_ENERGY * ((1-rp*rp)-2*r*rpp)/(r*r)
    radial = KAPPA_ENERGY * (rp*rp-1)/(r*r)
    tangent = KAPPA_ENERGY * rpp/r
    return {
        "energy_density_j_m3": density,
        "radial_pressure_pa": radial,
        "tangential_pressure_pa": tangent,
        "radial_nec_j_m3": density + radial,
        "tangential_nec_j_m3": density + tangent,
    }


def evaluate_wormhole(throat_m: float, ratio: float = 1.0) -> dict:
    """Generate a local, dimensionally labeled benchmark at r=ratio*r0."""
    r0 = _throat(throat_m)
    q = _finite_number("ratio", ratio)
    if not 1.0 <= q <= MAX_RATIO:
        raise ValueError(f"ratio must be between 1 and {MAX_RATIO}")
    r = r0*q
    stress = stress_from_shape(r0, r)
    b = shape_function_m(r0, r)
    d_b = shape_derivative(r0, r)
    return {
        "status": "model-derived, not experimentally observed",
        "metric": "Phi=0; b(r)=r0²/r; static spherical two-ended wormhole",
        "signature": "(-,+,+,+)",
        "throat_radius_m": r0,
        "areal_radius_m": r,
        "radius_over_throat": q,
        "shape_m": b,
        "shape_derivative": d_b,
        "flaring_out_at_throat": -1.0 < 1.0,
        "lapse_squared": 1.0,
        "radial_metric_factor_one_minus_b_over_r": 1.0 - b/r,
        "ricci_scalar_inverse_m2": -2.0 * r0*r0 / (r**4),
        **stress,
        "radial_nec_satisfied": stress["radial_nec_j_m3"] >= 0.0,
        "tangential_nec_satisfied": stress["tangential_nec_j_m3"] >= 0.0,
        "quantum_energy_inequality_checked": False,
        "dynamical_stability_checked": False,
        "physical_wormhole_demonstrated": False,
    }
