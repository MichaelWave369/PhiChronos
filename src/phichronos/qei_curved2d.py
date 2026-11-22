"""An actual curved-spacetime QEI reference case, restricted to TWO dimensions.

Flanagan (2002, corrected arXiv v4 December 2020) Eq. (1.7), in the paper's
curvature sign convention, for a free real massless scalar field in (1+1)D
spacetime globally conformal to Minkowski:

  ∫ dℓ ρ(ℓ) <T_ab u^a u^b> >= -(1/24π) ∫ dℓ
      [(ρ'(ℓ))²/ρ(ℓ) + ρ(ℓ) a² + ρ(ℓ) R]

where ℓ is geometric proper time c*t (meters) and ℏ=c=1 in the theorem.

Choose ds²=e^(2σ(x))[-c²dt²+dx²], with
  σ(x)=α exp[-x²/(2L²)]  (bounded, globally conformal to Minkowski).
At x=0, σ'=0 so the static worldline is a geodesic (a²=0).
With (-,+) and Flanagan's Ricci convention:
  R(0)= -2 e^(-2α) σ''(0) = 2α e^(-2α)/L² [m^-2].

The normalized, compactly supported sampler ρ(t)=b(t/τ)²/(τ I0) uses
the smooth bump b(u)=exp[-1/(1-u²)] for |u|<1, zero elsewhere.
  ∫ dt (ρ'(t))²/ρ(t) = (4 I1/I0)/τ²
  I1=∫_-1^1 (b'(u))² du, I0=∫_-1^1 b(u)² du.

The resulting bound is in 2D ENERGY PER LENGTH (J/m), NOT 4D J/m³:
  B = -ℏ/(24πc) * (4I1/I0)/τ² - ℏ c/(24π)*R(0).
No quantum state is constructed. It cannot bound the 4D wormhole stress.
"""
from __future__ import annotations
from functools import lru_cache
import math

from .qei import HBAR

def validate_proper_tau(tau_seconds: float) -> float:
    """Distinct 2D sample domain, not the earlier 4D femtosecond UI domain."""
    tau=_finite_number("tau_seconds",tau_seconds)
    if not 1e-9 <= tau <= 100:
        raise ValueError("tau_seconds must be in [1e-9, 100] seconds")
    return tau

from .qei_compact import bump_raw
from .relativity import C, _finite_number

SOURCE = "Flanagan PhysRevD.66.104007 (2002), Eq. 1.7, arXiv:gr-qc/0208066v4; erratum PhysRevD.102.129901"
MIN_LENGTH_M, MAX_LENGTH_M = 1e3, 1e9


def _parameters(alpha:float, length_m:float) -> tuple[float,float]:
    a=_finite_number("alpha",alpha)
    L=_finite_number("length_m",length_m)
    if not 0.0 <= a <= 1.0:
        raise ValueError("alpha must be in [0,1] for this positive-curvature example")
    if not MIN_LENGTH_M <= L <= MAX_LENGTH_M:
        raise ValueError("length_m must be in [1000,1e9] meters")
    return a,L


def sigma(x_m:float, alpha:float, length_m:float) -> float:
    a,L=_parameters(alpha,length_m)
    x=_finite_number("x_m",x_m)
    return a*math.exp(-0.5*(x/L)**2)


def curvature_at_center(alpha:float, length_m:float) -> float:
    a,L=_parameters(alpha,length_m)
    return 2*a*math.exp(-2*a)/(L*L)


def _bump_first_derivative(u:float) -> float:
    b,_ = bump_raw(u)
    if abs(u)>=1.0:
        return 0.0
    z=(1-u)*(1+u)
    return -2*u*b/(z*z)


def _integrals(n:int, rule:str) -> tuple[float,float]:
    if isinstance(n,bool) or not isinstance(n,int) or n<128 or n>65536:
        raise ValueError("quadrature subdivisions out of [128,65536]")
    if rule=="simpson" and n%2:
        raise ValueError("Simpson requires an even number of subdivisions")
    if rule not in ("simpson","midpoint"):
        raise ValueError("unknown quadrature rule")
    h=2.0/n
    i0,i1=0.0,0.0
    for k in range(n+1 if rule=="simpson" else n):
        if rule=="simpson":
            u=-1+k*h
            weight=1 if k in (0,n) else (4 if k%2 else 2)
        else:
            u=-1+(k+0.5)*h
            weight=1
        b,_=bump_raw(u)
        bp=_bump_first_derivative(u)
        i0+=weight*b*b
        i1+=weight*bp*bp
    return i0*h/(3 if rule=="simpson" else 1),i1*h/(3 if rule=="simpson" else 1)


@lru_cache(maxsize=1)
def bump_gradient_integrals() -> dict:
    i0,i1=_integrals(4096,"simpson")
    j0,j1=_integrals(16384,"midpoint")
    gradient_coefficient=4*i1/i0
    return {
        "I0":i0,"I1":i1,
        "four_I1_over_I0":gradient_coefficient,
        "independent_midpoint_coefficient":4*j1/j0,
        "relative_quadrature_disagreement":abs(gradient_coefficient-4*j1/j0)/gradient_coefficient,
    }


def curved_2d_bound(alpha:float,length_m:float,tau_seconds:float) -> dict:
    a,L=_parameters(alpha,length_m)
    tau=validate_proper_tau(tau_seconds)
    values=bump_gradient_integrals()
    ricci=curvature_at_center(a,L)
    sampling=-HBAR/(24*math.pi*C) * values["four_I1_over_I0"]/tau**2
    curvature=-HBAR*C/(24*math.pi)*ricci
    return {
        "model":"g=e^(2sigma(x))(-c²dt²+dx²), sigma=alpha exp(-x²/(2L²))",
        "theorem":"Flanagan 2002 Eq. 1.7; corrected arXiv v4, 2020",
        "dimension":2,
        "units":"J/m (1+1D energy per length), NOT J/m³",
        "alpha":a,"length_m":L,"tau_seconds":tau,
        "ricci_scalar_m_minus2":ricci,
        "static_center_geodesic":True,
        "proper_acceleration_squared_m_minus2":0.0,
        "compact_support_seconds":2*tau,
        "sampling_term_lower_j_per_m":sampling,
        "curvature_term_lower_j_per_m":curvature,
        "total_lower_j_per_m":sampling+curvature,
        "relative_quadrature_disagreement":values["relative_quadrature_disagreement"],
        "four_I1_over_I0":values["four_I1_over_I0"],
        "applies_to_selected_curved_2d_case":True,
        "applies_to_4d_wormhole":False,
        "wormhole_qei_compliance":None,
        "quantum_state_constructed":False,
        "backreaction_solved":False,
    }


def curved_2d_trial(alpha:float,length_m:float,tau_seconds:float,amplitude_j_per_m:float) -> dict:
    """Pure hypothetical plateau on compact support, not an admissible field state."""
    a=_finite_number("amplitude_j_per_m",amplitude_j_per_m)
    if a < 0:
        raise ValueError("amplitude_j_per_m must be nonnegative")
    result=curved_2d_bound(alpha,length_m,tau_seconds)
    avg=-a
    lower=result["total_lower_j_per_m"]
    ratio=a/abs(lower)
    status=("excluded_for_selected_2d_field" if avg < lower*(1+1e-12)
            else "not_excluded_by_one_2d_bound" if avg > lower*(1-1e-12)
            else "roundoff_boundary")
    return {**result,"toy_amplitude_j_per_m":a,"toy_average_j_per_m":avg,
            "fraction_of_bound_magnitude":ratio,"trial_status":status,
            "trial_is_not_a_quantum_state":True}
