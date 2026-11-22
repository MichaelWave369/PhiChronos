"""One specific, explicitly conditional P-CTC circuit toy.

The *ordinary* laboratory implementation prepares a Bell pair, applies a
CNOT (chronology-respecting qubit as control; one Bell qubit as target),
and postselects a Bell outcome. The effective Kraus operator on the
chronology-respecting system is K = <Phi+| CNOT |Phi+> = |0><0|.

Probability of the retained Bell outcome for normalized |psi>=a|0>+b|1>
is |a|^2. Discarding all unsuccessful trials does not send any signal
to the actual past. The P-CTC interpretation adds a hypothetical boundary
condition, not a physical time-machine demonstration.
"""
from __future__ import annotations

import math
from .relativity import _finite_number


def postselected_cnot(p_zero: float, shots: int = 1000) -> dict:
    """Exact conditional success probability plus *expected* shot counts."""
    p = _finite_number("p_zero", p_zero)
    if not 0.0 <= p <= 1.0:
        raise ValueError("p_zero must be in [0, 1]")
    if isinstance(shots, bool) or not isinstance(shots, int) or not 1 <= shots <= 1_000_000:
        raise ValueError("shots must be an integer in [1, 1000000]")
    return {
        "model": "postselected Bell-pair CNOT toy; standard postselection, not backward communication",
        "input_probability_zero": p,
        "success_probability": p,
        "expected_accepted_trials": shots * p,
        "expected_discarded_trials": shots * (1 - p),
        "conditional_output_probability_zero": 1.0 if p > 0 else None,
        "undefined_when_success_probability_zero": p == 0,
        "experimentally_demonstrated_backward_time_travel": False,
    }
