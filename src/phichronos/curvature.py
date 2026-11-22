"""Orthonormal curvature audit for ultra-static Ellis/Morris–Thorne metric.

Metric: ds²=-c²dt²+dl²+R(l)² dOmega², R²=l²+r0², signature (-,+,+,+).
Nonzero independent orthonormal sectional curvatures (sign convention):
  R_ltheta_ltheta = R_lphi_lphi = -r0²/R⁴
  R_thetaphi_thetaphi = +r0²/R⁴
Timelike curvature components vanish for this ultra-static product.
Ricci scalar = -2*r0²/R⁴; Kretschmann = 12*r0⁴/R⁸.
This is a *geometric diagnostic*, never a curved-spacetime QEI theorem.
"""
from __future__ import annotations
import math
from .relativity import C
from .wormhole import evaluate_wormhole


def curvature_audit(throat_m: float, ratio: float, tau_seconds: float) -> dict:
    from .qei import validate_tau  # avoid import cycle
    tau=validate_tau(tau_seconds)
    w=evaluate_wormhole(throat_m,ratio)
    r=w["areal_radius_m"]
    r0=w["throat_radius_m"]
    k=(r0/r)**2/(r*r)
    scalar=-2*k
    kretsch=12*k*k
    curvature_length=1/math.sqrt(k)
    ricci_length=1/math.sqrt(abs(scalar))
    kretsch_length=kretsch**(-0.25)
    return {
        "metric":"ultra-static Phi=0, b=r0²/r, two-ended Ellis/Morris-Thorne",
        "radius_m":r,"throat_m":r0,"tau_seconds":tau,
        "radial_angular_section_inverse_m2":-k,
        "angular_section_inverse_m2":k,
        "ricci_scalar_inverse_m2":scalar,
        "kretschmann_inverse_m4":kretsch,
        "max_orthonormal_component_inverse_m2":k,
        "component_curvature_length_m":curvature_length,
        "ricci_length_m":ricci_length,
        "kretschmann_length_m":kretsch_length,
        "sampling_length_m":C*tau,
        "compact_sample_to_component_scale_ratio":C*tau/curvature_length,
        "curvature_diagnostic_only":True,
        "flat_qei_transfer_proven":False,
        "qei_compliance":None,
        "semiclassical_state_constructed":False,
        "backreaction_evaluated":False,
        "warning":"Finite support does not prove that the flat 4D QEI applies on a curved throat. No state, renormalization, curved Hadamard bound, or backreaction analysis is supplied.",
    }
