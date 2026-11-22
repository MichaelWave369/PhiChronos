"""Lorentz boosts and causal separation in 1+1-dimensional flat spacetime.

Coordinates: t in SI seconds, x in SI meters. Positive beta denotes a
primed inertial frame moving in the +x direction relative to the unprimed
frame. This is a coordinate transformation, not a time machine or CTC test.
"""
from __future__ import annotations

import math

from .relativity import C, _finite_number, lorentz_factor
from .causality import classify_interval


def lorentz_boost(t_seconds: float, x_meters: float, beta: float) -> tuple[float, float]:
    """Transform an event S -> S' using t'=γ(t−βx/c), x'=γ(x−βct).

    beta = v/c; require -1 < beta < 1. To invert, call with -beta.
    The two reference origins coincide at t=t'=0.
    """
    t = _finite_number("t_seconds", t_seconds)
    x = _finite_number("x_meters", x_meters)
    beta = _finite_number("beta", beta)
    if not -1.0 < beta < 1.0:
        raise ValueError("beta must satisfy -1 < beta < 1")
    gamma = lorentz_factor(abs(beta))
    tp = gamma * (t - beta * x / C)
    xp = gamma * (x - beta * C * t)
    if not (math.isfinite(tp) and math.isfinite(xp)):
        raise ValueError("transformed coordinates overflowed floating-point range")
    return tp, xp


def minkowski_interval_m2(dt_seconds: float, dx_meters: float) -> float:
    """Return signed interval s²=(cΔt)²−(Δx)² in m², signature (+,−).

    Near null separation, floating-point cancellation limits relative accuracy.
    Use classify_interval() for a tolerance-aware classification.
    """
    dt = _finite_number("dt_seconds", dt_seconds)
    dx = _finite_number("dx_meters", dx_meters)
    ct = C * dt
    result = (ct - dx) * (ct + dx)
    if not math.isfinite(result):
        raise ValueError("interval overflowed floating-point range")
    return result


def event_separation(event_a: tuple[float, float], event_b: tuple[float, float]) -> tuple[float, float]:
    """Return Δt and Δx between (t,x) events, in seconds and meters."""
    try:
        ta, xa = event_a
        tb, xb = event_b
    except (TypeError, ValueError) as exc:
        raise ValueError("events must each contain exactly (time_seconds, x_meters)") from exc
    return (_finite_number("tb", tb) - _finite_number("ta", ta),
            _finite_number("xb", xb) - _finite_number("xa", xa))


def causal_region(dt_seconds: float, dx_meters: float) -> str:
    """Locate B relative to A's causal cone, including the coincident event."""
    dt = _finite_number("dt_seconds", dt_seconds)
    dx = _finite_number("dx_meters", dx_meters)
    if dt == 0 and dx == 0:
        return "coincident"
    kind = classify_interval(dt, dx)
    if kind == "spacelike":
        return "elsewhere (spacelike)"
    direction = "future" if dt > 0 else "past"
    return f"{direction} light cone" if kind == "lightlike" else f"{direction} timelike"
