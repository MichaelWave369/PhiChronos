"""C-infinity finite-duration sampler for a field-specific Minkowski QEI.

Fewster–Eveson (1998) Eq. 5.5 for a free massless minimally coupled scalar
in 3+1 flat spacetime along an inertial observer:

  integral dt g(t)^2 < :T00(t): > >= -hbar/(16*pi^2*c^3) * integral dt |g''(t)|^2

g real, smooth and compactly supported with integral g^2 = 1.

Choose b(u) = exp[-1/(1-u^2)] for |u|<1, zero elsewhere, and
g_tau(t) = b(t/tau)/sqrt(tau*I0).
I0 = integral[-1,1] b(u)^2 du,
I2 = integral[-1,1] b''(u)^2 du.
Therefore integral |g_tau''|^2 = (I2/I0) / tau^4.

This is a flat-space FIELD inequality; no state sourcing a wormhole is built.
"""
from __future__ import annotations

from functools import lru_cache
import math

from .qei import HBAR, validate_tau
from .relativity import C, _finite_number


def bump_raw(u: float) -> tuple[float, float]:
    """Dimensionless smooth compact bump b(u), second derivative b''(u)."""
    u = _finite_number("u", u)
    if abs(u) >= 1:
        return (0.0, 0.0)
    z = (1.0-u)*(1.0+u)
    b = math.exp(-1.0/z)
    # Analytically differentiated; avoids numerical second differences.
    bpp = b*(6*u**4-2)/(z**4)
    return b,bpp


def simpson_bump_integrals(n: int = 4096) -> tuple[float, float]:
    if isinstance(n,bool) or not isinstance(n,int) or n<128 or n>16384 or n%2:
        raise ValueError("n must be even in [128,16384]")
    h = 2.0/n
    normal, bending = 0.0, 0.0
    for k in range(1,n):
        u=-1.0+h*k
        b,bpp=bump_raw(u)
        weight=4 if k%2 else 2
        normal+=weight*b*b
        bending+=weight*bpp*bpp
    return normal*h/3, bending*h/3


def midpoint_bump_integrals(n: int = 16384) -> tuple[float, float]:
    """Independent midpoint quadrature for cross-checking Simpson."""
    if isinstance(n,bool) or not isinstance(n,int) or n<128 or n>65536:
        raise ValueError("n must be in [128,65536]")
    h=2.0/n
    normal,bending=0.0,0.0
    for k in range(n):
        u=-1.0+h*(k+0.5)
        b,bpp=bump_raw(u)
        normal+=b*b
        bending+=bpp*bpp
    return normal*h,bending*h


@lru_cache(maxsize=1)
def compact_integrals() -> dict:
    i0,i2=simpson_bump_integrals(4096)
    mid0,mid2=midpoint_bump_integrals(16384)
    coefficient=i2/i0
    delta=abs(coefficient-mid2/mid0)
    return {
        "normalization_i0":i0,
        "second_derivative_i2":i2,
        "dimensionless_coefficient":coefficient,
        "quadrature_difference":delta,
        "relative_quadrature_difference":delta/coefficient,
        "method":"Simpson 4096; independent midpoint 16384",
    }


def compact_sampler_density(time_seconds: float,tau_seconds: float) -> float:
    """g_tau(t)^2, units 1/s. Exactly zero outside (-tau,tau)."""
    t=_finite_number("time_seconds",time_seconds)
    tau=validate_tau(tau_seconds)
    b,_=bump_raw(t/tau)
    return b*b/(tau*compact_integrals()["normalization_i0"])


def compact_flat_qei(tau_seconds: float) -> dict:
    tau=validate_tau(tau_seconds)
    data=compact_integrals()
    lower=-HBAR/(16*math.pi**2*C**3*tau**4)*data["dimensionless_coefficient"]
    return {
        "background":"4D Minkowski; free real massless minimally coupled scalar; inertial worldline",
        "sampling":"C-infinity compact support, g_tau^2, t in [-tau,tau], normalized",
        "tau_seconds":tau,
        "total_support_seconds":2*tau,
        "lower_energy_density_j_m3":lower,
        **data,
        "wormhole_compliance":None,
        "curved_space_transfer_established":False,
        "physical_state_constructed":False,
    }


def compact_plateau_trial(amplitude_j_m3: float,tau_seconds: float) -> dict:
    """Hypothetical negative plateau on support; NOT a QFT state.

    For the constant trial rho(t)=-A on [-tau,tau], normalized average=-A.
    Outside the support the stress profile is unspecified. Passing this one
    lower bound is necessary but not sufficient for a quantum state.
    """
    a=_finite_number("amplitude_j_m3",amplitude_j_m3)
    if a<0:
        raise ValueError("amplitude_j_m3 must be nonnegative")
    result=compact_flat_qei(tau_seconds)
    ratio=a/abs(result["lower_energy_density_j_m3"])
    status=("excluded_for_this_flat_field" if ratio>1+1e-12
            else "not_excluded_by_one_bound" if ratio<1-1e-12
            else "roundoff_boundary")
    return {**result, "toy_average_j_m3":-a, "amplitude_j_m3":a,
            "fraction_of_bound_magnitude":ratio, "status":status,
            "toy_is_not_physical_state":True}
