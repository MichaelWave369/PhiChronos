"""Four-dimensional massless probe-scalar mode equation on a fixed Ellis wormhole.

Metric: ds² = -c²dt² + dl² + R(l)² dΩ²; R²=l²+r0².
For a *free minimally coupled test scalar*, □φ=0, separate
φ=e^(-iωt) Y_Lm(angles) u_L(l)/R(l).
Then -u''+[L(L+1)/R² + R''/R]u=(ω²/c²)u,
where R''/R = r0²/R⁴.  This is NOT a quantized state or QEI.

Dimensionless x=l/r0 and k=ω*r0/c:
    -u_xx + [L(L+1)/(1+x²)+1/(1+x²)²]u=k² u.

Only the L=0 **s-wave** is used for the scattering solver, since
higher angular waves require centrifugal asymptotic matching instead
of simple free plane-wave conditions.  Reflection/transmission are
defined for incoming s-waves on one asymptotic end of this fixed metric.

Published low-k analytic cross-check for Ellis throat (2020):
    T_amp = -2i*k/pi + O(k²); |T|²/k² -> 4/pi².
References: https://doi.org/10.1140/epjc/s10052-020-08668-3
             https://doi.org/10.1103/PhysRevD.49.853
"""
from __future__ import annotations
import math
from typing import Callable
from .relativity import C, _finite_number
from .wormhole import _throat

LOW_K_COEFFICIENT = 4.0 / math.pi**2
MIN_K,MAX_K = 0.02, 2.5


def dimensionless_potential(x: float, ell: int = 0) -> float:
    x = _finite_number("x",x)
    if isinstance(ell,bool) or not isinstance(ell,int) or not 0 <= ell <= 8:
        raise ValueError("ell must be an integer between 0 and 8")
    if abs(x)>100:
        raise ValueError("|x| must be <= 100")
    radius_squared = 1.0 + x*x
    return ell*(ell+1)/radius_squared + 1.0/(radius_squared**2)


def scalar_mode_potential(throat_m:float,proper_l_m:float,ell:int=0) -> float:
    """Physical effective potential U(l), units inverse square meters."""
    r0 = _throat(throat_m)
    l = _finite_number("proper_l_m",proper_l_m)
    return dimensionless_potential(l/r0,ell)/(r0*r0)


def _propagate(
    kappa:float, extent:float,steps:int,
    potential:Callable[[float],float],
) -> tuple[float,float,float,float]:
    """RK4 transfer fundamental matrix for u''=(V-k²)u from -L to +L.

    Columns solve initial data (u,u')=(1,0) and (0,1).
    Determinant AD-BC should equal 1 for any real finite potential.
    For this s-wave, free plane-wave matching is only approximate at
    finite L because the true Ellis potential has nonzero far tails.
    """
    k = _finite_number("kappa",kappa)
    L = _finite_number("extent",extent)
    if not MIN_K <= k <= MAX_K:
        raise ValueError(f"kappa must be in [{MIN_K},{MAX_K}]")
    if not 4 <= L <= 80:
        raise ValueError("extent must lie in [4,80] throat radii")
    if isinstance(steps,bool) or not isinstance(steps,int) or steps<512 or steps>30000 or steps%2:
        raise ValueError("steps must be even and in [512,30000]")
    h = 2*L/steps
    x=-L
    y=(1.0,0.0,0.0,1.0)  # f1,f1',f2,f2'

    def derivative(pos:float,v:tuple[float,float,float,float]):
        p=potential(pos)-k*k
        return (v[1],p*v[0],v[3],p*v[2])

    for _ in range(steps):
        k1=derivative(x,y)
        y2=tuple(v+h/2*d for v,d in zip(y,k1))
        k2=derivative(x+h/2,y2)
        y3=tuple(v+h/2*d for v,d in zip(y,k2))
        k3=derivative(x+h/2,y3)
        y4=tuple(v+h*d for v,d in zip(y,k3))
        k4=derivative(x+h,y4)
        y=tuple(v+h*(d1+2*d2+2*d3+d4)/6 for v,d1,d2,d3,d4 in zip(y,k1,k2,k3,k4))
        x+=h
    return y


def _probabilities(
    transfer:tuple[float,float,float,float],k:float
) -> dict[str,float]:
    a,c,b,d=transfer # u1,u1',u2,u2'; matrix [[a,b],[c,d]]
    det=a*d-b*c
    den=(c-k*k*b)**2+k*k*(a+d)**2
    transmission=4*k*k/den
    reflection=((c+k*k*b)**2+k*k*(d-a)**2)/den
    if not math.isfinite(den) or den<=0:
        raise ValueError("ill-conditioned scattering calculation")
    return {
        "transmission":transmission,
        "reflection":reflection,
        "probability_sum":transmission+reflection,
        "wronskian_determinant":det,
        "wronskian_residual":abs(det-1),
        "flux_residual":abs(transmission+reflection-1),
    }


def s_wave_scattering(
    throat_m:float,kappa:float,extent:float=32.0,steps:int=4096
) -> dict:
    """Compute finite-domain s-wave scalar scattering (unitless probabilities).

    The result is a classical *probe* field on a prescribed 4D geometry,
    not matter sourcing the metric, quantization, or a wormhole QEI.
    """
    r0=_throat(throat_m)
    k=_finite_number("kappa",kappa)
    transfer=_propagate(k,extent,steps,lambda x:1/(1+x*x)**2)
    power=_probabilities(transfer,k)
    return {
        "geometry":"ultrastatic 3+1D Ellis/Morris-Thorne, Phi=0, b=r0²/r",
        "model":"massless minimally coupled classical test scalar, ell=0",
        "throat_m":r0,"kappa":k,"angular_frequency_rad_s":k*C/r0,
        "frequency_hz":k*C/(2*math.pi*r0),
        "finite_half_extent_in_throat_units":extent,
        "integration_steps":steps,
        "tail_potential_dimensionless":1/(1+extent*extent)**2,
        "low_frequency_transmission_asymptotic":(LOW_K_COEFFICIENT*k*k if k<=0.1 else None),
        "low_frequency_asymptotic_only_k_much_less_than_1":True,
        **power,
        "test_field_not_quantized":True,
        "physical_wormhole_observed":False,
        "curved_4d_qei_evaluated":False,
        "renormalized_hadamard_state_constructed":False,
        "semiclassical_backreaction_solved":False,
    }


def square_barrier_reference(kappa:float,height:float,width:float) -> float:
    """Independent closed-form 1D constant square-barrier transmission."""
    k = _finite_number("kappa",kappa)
    v = _finite_number("height",height)
    w = _finite_number("width",width)
    if k<=0 or v<0 or w<=0:
        raise ValueError("require positive kappa and width, nonnegative barrier")
    e=k*k
    if abs(e-v)<1e-14:
        term=v*v*w*w/(4*e)
    elif e>v:
        p=math.sqrt(e-v)
        term=v*v*math.sin(p*w)**2/(4*e*(e-v))
    else:
        p=math.sqrt(v-e)
        term=v*v*math.sinh(p*w)**2/(4*e*(v-e))
    return 1/(1+term)


def square_barrier_numerical(kappa:float,height:float,width:float,steps:int=4096) -> dict:
    """Test integration against known exact scattering for a constant slab."""
    h=_finite_number("height",height)
    w=_finite_number("width",width)
    if h<0 or not 8<=w<=80:
        raise ValueError("height must be >=0, width in [8,80]")
    transfer=_propagate(kappa,w/2,steps,lambda x:h)
    return _probabilities(transfer,kappa)
