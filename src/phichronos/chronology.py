"""Educational cyclic quotients of flat 1+1-dimensional Minkowski spacetime.

The quotient *assumes* an equivalence (ct,x) ~ (ct+n Δct,x+n Δx).
It does NOT construct a physical metric from matter or show that such an
identification can form in the real Universe. Units are light-seconds:
the numerical ct coordinate equals elapsed time in SI seconds.
"""
from __future__ import annotations

import math
from .relativity import _finite_number


def quotient_analysis(delta_ct_ls: float, delta_x_ls: float) -> dict:
    """Classify the causal character of the compactification generator.

    Timelike -> a timelike straight generator becomes a CTC in the quotient.
    Null -> a closed null generator; no *timelike* generator.
    Spacelike -> a closed spacelike generator; no causal loop caused by this
      pure spacelike translation in the resulting Minkowski cylinder.

    The comparison tolerance is for floating-point classification only.
    """
    dt = _finite_number("delta_ct_ls", delta_ct_ls)
    dx = _finite_number("delta_x_ls", delta_x_ls)
    if dt == 0 and dx == 0:
        raise ValueError("identification generator cannot be (0, 0)")
    norm = (dt - dx) * (dt + dx)
    if not math.isfinite(norm):
        raise ValueError("generator interval overflowed")
    scale = max(abs(dt), abs(dx))
    difference = (abs(dt) - abs(dx)) / scale
    if abs(difference) <= 1e-12:
        kind = "null"
    elif difference > 0:
        kind = "timelike"
    else:
        kind = "spacelike"
    return {
        "model": "assumed flat Minkowski translation quotient, not a physical time machine",
        "generator": {"delta_ct_light_seconds": dt, "delta_x_light_seconds": dx},
        "norm_light_seconds_squared": norm,
        "generator_type": kind,
        "closed_timelike_generator": kind == "timelike",
        "closed_null_generator": kind == "null",
        "proper_time_per_winding_seconds": math.sqrt(max(0.0, norm)) if kind == "timelike" else None,
        "experimentally_demonstrated": False,
    }


def winding_history(delta_ct_ls: float, delta_x_ls: float, turns: int = 3) -> list[dict]:
    """List equivalently identified events in a covering space for n=1..turns.

    A turn is not an actual journey through time. Integer bounds keep the
    interactive output compact and the calculation stable.
    """
    analysis = quotient_analysis(delta_ct_ls, delta_x_ls)
    if isinstance(turns, bool) or not isinstance(turns, int) or not 1 <= turns <= 20:
        raise ValueError("turns must be an integer between 1 and 20")
    t, x = delta_ct_ls, delta_x_ls
    result = []
    for n in range(1, turns + 1):
        result.append({
            "turn": n,
            "covering_endpoint": {"ct_light_seconds": n * t, "x_light_seconds": n * x},
            "quotient_equivalent_to_origin": True,
            "timelike_proper_time_seconds": n * analysis["proper_time_per_winding_seconds"]
                if analysis["proper_time_per_winding_seconds"] is not None else None,
        })
    return result
