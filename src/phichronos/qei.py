"""4D flat-space Ford–Roman and Fewster–Eveson scalar-field QEIs.

Assumptions: free real massless minimally coupled scalar, Minkowski background,
inertial observer, vacuum-normal-ordered energy density, Lorentzian sampler
tau/[pi*(t*t+tau*tau)]. No curved-space theorem is claimed.
"""
from __future__ import annotations
import math
from .relativity import C, _finite_number
from .wormhole import evaluate_wormhole

H = 6.62607015e-34  # SI exact Planck constant in J s
HBAR = H/(2*math.pi)
FR_COEFF = 3/(32*math.pi**2)
FE_COEFF = 27/(2048*math.pi**2)
MIN_TAU = 1e-24
MAX_TAU = 1e-3
DOMAIN = "4D Minkowski; free real massless minimally coupled scalar; inertial observer; Lorentzian time sampler"


def validate_tau(value: float, name: str = "tau_seconds") -> float:
    x = _finite_number(name, value)
    if not MIN_TAU <= x <= MAX_TAU:
        raise ValueError(f"{name} must be between {MIN_TAU} and {MAX_TAU} s")
    return x


def sampler(t_seconds: float, tau_seconds: float) -> float:
    t = _finite_number("t_seconds", t_seconds)
    tau = validate_tau(tau_seconds)
    return tau/(math.pi*(t*t+tau*tau))


def flat_qei_bounds(tau_seconds: float) -> dict:
    tau = validate_tau(tau_seconds)
    scale = HBAR/(C**3*tau**4)
    return {
        "domain": DOMAIN, "tau_seconds": tau,
        "ford_roman_lower_j_m3": -FR_COEFF*scale,
        "fewster_eveson_lower_j_m3": -FE_COEFF*scale,
        "fe_to_fr_ratio": FE_COEFF/FR_COEFF,
        "quantum_state_constructed": False,
    }


def sampled_toy_pulse(amplitude_j_m3: float, pulse_width_seconds: float, tau_seconds: float) -> dict:
    """Only a CLASSICAL trial function, not a quantum state.

    rho(t)=-A/(1+(t/T)^2), integral g_tau*rho = -A*T/(T+tau).
    QEI rejection is conditional on the selected flat free-field assumptions.
    Passing one lower bound never proves the existence of a quantum state.
    """
    a = _finite_number("amplitude_j_m3", amplitude_j_m3)
    if a < 0:
        raise ValueError("amplitude must be nonnegative")
    width = validate_tau(pulse_width_seconds, "pulse_width_seconds")
    tau = validate_tau(tau_seconds)
    avg = -a*width/(width+tau)
    result = flat_qei_bounds(tau)
    ratio = abs(avg/result["fewster_eveson_lower_j_m3"])
    status = ("excluded_for_this_flat_field" if ratio > 1+1e-12
              else "not_excluded_by_one_bound" if ratio < 1-1e-12
              else "roundoff_boundary")
    return {**result, "trial_not_a_constructed_state": True,
            "pulse_width_seconds":width, "amplitude_j_m3":a,
            "sampled_toy_j_m3":avg, "bound_fraction":ratio, "status":status}


def pulse_quadrature_ratio(width_seconds: float, tau_seconds: float, steps: int = 2048) -> float:
    """Independent Simpson quadrature using t=tau*tan(theta).

    The normalized Lorentzian weight becomes dtheta/pi on [-pi/2,pi/2].
    """
    width=validate_tau(width_seconds, "width_seconds")
    tau=validate_tau(tau_seconds)
    if isinstance(steps,bool) or not isinstance(steps,int) or steps<32 or steps>16384 or steps%2:
        raise ValueError("steps must be even in [32,16384]")
    h=math.pi/steps
    kappa=tau/width
    def term(k: int) -> float:
        if k==0 or k==steps:
            return 0.0
        z=kappa*math.tan(-math.pi/2+k*h)
        return 1/(1+z*z)
    s=term(0)+term(steps)
    for k in range(1,steps):
        s+=(4 if k%2 else 2)*term(k)
    return (h/(3*math.pi))*s


def wormhole_domain_audit(throat_m: float, ratio: float, tau_seconds: float) -> dict:
    """Return no compliance verdict: flat QEI is unproven on this curved metric."""
    tau=validate_tau(tau_seconds)
    w=evaluate_wormhole(throat_m,ratio)
    length=1/math.sqrt(abs(w["ricci_scalar_inverse_m2"]))
    return {
        "background":"curved Morris–Thorne static metric",
        "ricci_length_m":length,
        "sampling_length_m":C*tau,
        "sampling_to_ricci_length":C*tau/length,
        "classical_local_energy_density_j_m3":w["energy_density_j_m3"],
        "flat_qei_transfer_established":False,
        "qei_compliance":None,
        "semiclassical_backreaction_evaluated":False,
        "finding":"NO TRANSFER: flat-space inequality not rigorously applied to curved throat",
        "limitations":"Infinite-tail Lorentzian, unspecified field state and renormalization, unresolved curvature corrections and backreaction",
    }
