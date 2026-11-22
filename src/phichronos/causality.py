"""Elementary Minkowski interval tests, not a CTC detector."""
from __future__ import annotations
import math
from .relativity import C, _finite_number


def classify_interval(dt_seconds: float, dx_meters: float) -> str:
    """Classify a pair of events in flat 1+1D spacetime.

    Returns timelike, lightlike or spacelike. Coordinates are displacements
    in ONE inertial frame. A lightlike tolerance of 1e-12 is numerical only.
    """
    dt = _finite_number("dt_seconds", dt_seconds)
    dx = _finite_number("dx_meters", dx_meters)
    ct = abs(C * dt)
    distance = abs(dx)
    scale = max(ct, distance, 1.0)
    relative_gap = (ct - distance) / scale
    if abs(relative_gap) <= 1e-12:
        return "lightlike"
    return "timelike" if relative_gap > 0 else "spacelike"


def proper_time_seconds(dt_seconds: float, dx_meters: float) -> float:
    """Proper time for a straight timelike inertial separation only.

    Null separation has zero proper time. Spacelike separation has no real
    proper time for a massive inertial clock joining the two events.
    """
    dt = _finite_number("dt_seconds", dt_seconds)
    dx = _finite_number("dx_meters", dx_meters)
    cls = classify_interval(dt, dx)
    if cls == "spacelike":
        raise ValueError("spacelike events have no connecting inertial proper time")
    if cls == "lightlike":
        return 0.0
    return math.sqrt(max(0.0, (abs(dt) - abs(dx) / C) * (abs(dt) + abs(dx) / C)))
