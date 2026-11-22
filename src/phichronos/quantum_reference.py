"""v0.9: verified flat 4D Wightman reference and *partial* Ellis mode normalization.

All Wightman quantities use NATURAL UNITS (hbar=c=1), with x0=c*t and
lengths in metres, so W has units m^-2 for the field convention here.

Free massless real scalar positive-frequency 4D Minkowski vacuum:

  W_eps(dct,r) = 1/[4 pi² (r²-(dct-i eps)²)].
                = [1/(4 pi²)] integral_0^inf dk
                    k e^(-eps k) exp(-ik dct) sinc(k r)

with eps>0 in METRES, and sinc(z)=sin(z)/z. No negative-frequency
piece is added. This is a regulated positive-frequency reference, NOT
a renormalized stress tensor.

The s-wave *classical* Ellis scattering state uses unit-amplitude
incoming waves in dimensionless x=l/r0, kappa=omega*r0/c. The formal
KG continuum mode factor for delta(kappa-kappa') is N=1/sqrt(4*pi*kappa)
multiplying Y_00 u_kappa(x)/R(l), with R=sqrt(l²+r0²),
when both scattering channels and continuum completeness hold.
Only the s-wave asymptotic channel relations are numerically checked.
This does NOT construct the curved-spacetime two-point function or
establish its Hadamard property.
"""
from __future__ import annotations
import cmath
import math

from .relativity import C, _finite_number
from .scalar_modes import _propagate, s_wave_scattering
from .wormhole import _throat

FOUR_PI_SQUARED = 4*math.pi**2


def _flat_inputs(ct_m:float, separation_m:float, epsilon_m:float) -> tuple[float,float,float]:
    ct=_finite_number("delta_ct_m",ct_m)
    r=_finite_number("separation_m",separation_m)
    eps=_finite_number("epsilon_m",epsilon_m)
    if abs(ct)>4 or r<0 or r>4 or eps<0.05 or eps>2:
        raise ValueError("|delta_ct|<=4m, 0<=r<=4m, 0.05<=epsilon<=2m required")
    return ct,r,eps


def minkowski_wightman(ct_m:float, separation_m:float, epsilon_m:float) -> complex:
    """Exact epsilon-regularized Minkowski Wightman function in m^-2."""
    ct,r,eps=_flat_inputs(ct_m,separation_m,epsilon_m)
    return 1/(FOUR_PI_SQUARED*(r*r+(eps+1j*ct)**2))


def minkowski_spectral_quadrature(
    ct_m:float, separation_m:float, epsilon_m:float,
    k_cutoff_per_m:float=96, steps:int=4096,
) -> dict:
    """Independent *truncated* positive-frequency k integral via Simpson.

    A rigorous, deliberately conservative absolute cutoff-tail bound
    uses |sinc|<=1 and integral_K^infinity k exp(-eps*k) dk.
    """
    ct,r,eps=_flat_inputs(ct_m,separation_m,epsilon_m)
    kmax=_finite_number("k_cutoff_per_m",k_cutoff_per_m)
    if not 20<=kmax<=300:
        raise ValueError("k cutoff must lie in [20,300] m^-1")
    if isinstance(steps,bool) or not isinstance(steps,int) or steps<512 or steps>16384 or steps%2:
        raise ValueError("steps must be even in [512,16384]")
    h=kmax/steps
    acc=0j
    for j in range(steps+1):
        k=j*h
        z=k*r
        sinc=1-z*z/6+z**4/120 if abs(z)<1e-4 else math.sin(z)/z
        integrand=k*math.exp(-eps*k)*sinc*cmath.exp(-1j*k*ct)
        wt=1 if j in (0,steps) else (4 if j%2 else 2)
        acc+=wt*integrand
    numeric=acc*h/(3*FOUR_PI_SQUARED)
    analytic=minkowski_wightman(ct,r,eps)
    cutoff_tail=math.exp(-eps*kmax)*(kmax/eps+1/eps**2)/FOUR_PI_SQUARED
    return {
        "dimension":4,
        "background":"3+1D Minkowski free real massless scalar vacuum",
        "natural_units":"hbar=c=1; Wightman m^-2; delta_ct=c delta_t in meters",
        "delta_ct_m":ct,"separation_m":r,"epsilon_m":eps,
        "k_cutoff_inverse_m":kmax,"simpson_subintervals":steps,
        "analytic_real_inverse_m2":analytic.real,
        "analytic_imag_inverse_m2":analytic.imag,
        "spectral_real_inverse_m2":numeric.real,
        "spectral_imag_inverse_m2":numeric.imag,
        "absolute_numeric_discrepancy_inverse_m2":abs(numeric-analytic),
        "rigorous_cutoff_tail_upper_bound_inverse_m2":cutoff_tail,
        "frequency_support":"positive k only; exp(-epsilon k) regulator",
        "distributional_epsilon_to_zero_limit_not_taken":True,
        "ellis_curved_hadamard_state_constructed":False,
        "curved_stress_tensor_renormalized":False,
        "curved_4d_qei_evaluated":False,
    }


def ellis_s_wave_channel(throat_m:float,kappa:float,extent:float=32,steps:int=4096) -> dict:
    """Asymptotic scattering amplitudes, flux and FORMAL KG factor.

    Boundary conventions: incoming from left exp(i*k*(x+L)), reflected
    r exp(-i*k*(x+L)); transmitted t exp(i*k*(x-L)) at right x=+L.
    Standard real transfer matrix [[A,B],[C,D]], with det≈1.
    """
    r0=_throat(throat_m)
    k=_finite_number("kappa",kappa)
    a,c,b,d=_propagate(k,extent,steps,lambda x:1/(1+x*x)**2)
    den=c-k*k*b-1j*k*(a+d)
    if abs(den)<1e-14:
        raise ValueError("degenerate wave matching")
    reflection=-(c+k*k*b+1j*k*(d-a))/den
    transmission=-2j*k/den
    T=abs(transmission)**2
    R=abs(reflection)**2
    mode_factor=1/math.sqrt(4*math.pi*k)
    return {
        "geometry":"ultrastatic 3+1D Ellis/Morris-Thorne",
        "mode":"massless minimally coupled scalar, ell=0; two asymptotic channels",
        "throat_m":r0,"kappa":k,"angular_frequency_rad_s":k*C/r0,
        "reflection_real":reflection.real,"reflection_imag":reflection.imag,
        "transmission_real":transmission.real,"transmission_imag":transmission.imag,
        "reflection_power":R,"transmission_power":T,
        "unitarity_error":abs(R+T-1),
        "parity_symmetric_transfer_error":abs(a-d),
        "symmetry_channel_orthogonality_error":abs(2*(reflection.conjugate()*transmission).real),
        "transfer_determinant_error":abs(a*d-b*c-1),
        "delta_kappa_formal_kg_factor":mode_factor,
        "formal_norm_2k_2pi_N_squared":2*k*2*math.pi*mode_factor**2,
        "formal_mode":"N Y_00(angles) u_kappa(l/r0) / sqrt(l²+r0²) * exp(-i*kappa*ct/r0)",
        "continuum_mode_completeness_verified":False,
        "all_angular_modes_included":False,
        "wormhole_wightman_constructed":False,
        "hadamard_property_verified":False,
        "renormalized_stress_tensor_computed":False,
        "curved_4d_qei_evaluated":False,
        "backreaction_solved":False,
    }


def free_channel_validation(kappa:float,extent:float=16,steps:int=4096) -> dict:
    """Independent empty-potential plane-wave check for the phase convention."""
    k=_finite_number("kappa",kappa)
    a,c,b,d=_propagate(k,extent,steps,lambda _:0.0)
    den=c-k*k*b-1j*k*(a+d)
    t=-2j*k/den
    refl=-(c+k*k*b+1j*k*(d-a))/den
    expected=cmath.exp(2j*k*extent)
    return {"transmission_phase_error":abs(t-expected),
            "reflection_abs":abs(refl),
            "unitarity_error":abs(abs(t)**2+abs(refl)**2-1)}
