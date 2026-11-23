"""v1.0: Independently reconstruct flat 4D vacuum from spherical partial waves.

Rayleigh/spherical-Bessel addition identity:
  sinc(k d) = sum_(ell=0)^infty (2ell+1)
              j_ell(k r1) j_ell(k r2) P_ell(cos gamma)
  d^2=r1^2+r2^2-2r1 r2 cos gamma.

Integrate that angular-mode sum against the same positive-frequency
Minkowski spectrum as v0.9 to reconstruct its 4D Wightman correlator.
This is a FLAT space calibration, not an Ellis mode sum or Hadamard proof.

Additional exact variational *trial-family* audit for the noncompact
ultrastatic Ellis spatial operator -Delta_h: radial smooth bumps far
along one asymptotic end have Rayleigh quotient ~const/width^2 -> 0.
Thus the nonnegative operator has no strictly positive spectral gap.
This fact does NOT imply nonexistence of a Hadamard ground state.
"""
from __future__ import annotations
import cmath
import math

from .quantum_reference import minkowski_wightman, minkowski_spectral_quadrature
from .qei_compact import bump_raw
from .relativity import _finite_number
from .wormhole import _throat

PI=math.pi
MAX_ELL=40


def _ell(value:int) -> int:
    if isinstance(value,bool) or not isinstance(value,int) or not 0<=value<=MAX_ELL:
        raise ValueError(f"ell_max must be an integer between 0 and {MAX_ELL}")
    return value


def spherical_bessel_j_all(z:float, ell_max:int) -> list[float]:
    """Stable upward for z well above ell; scaled Miller downward otherwise."""
    z=_finite_number("z",z)
    n=_ell(ell_max)
    if z<0 or z>300:
        raise ValueError("z must be within [0,300]")
    if z==0:
        return [1.0]+[0.0]*n
    if z<1e-4:
        result=[1-z*z/6+z**4/120]
        df=1.0
        power=1.0
        for l in range(1,n+1):
            df*=2*l+1
            power*=z
            result.append(power/df*(1-z*z/(2*(2*l+3))))
        return result
    j0=math.sin(z)/z
    if n==0:
        return [j0]
    j1=math.sin(z)/(z*z)-math.cos(z)/z
    if z>n+4:
        values=[j0,j1]
        for l in range(1,n):
            values.append((2*l+1)/z*values[l]-values[l-1])
        return values

    N=max(n+40,int(z)+40)
    work=[0.0]*(N+2)
    work[N]=1.0
    for l in range(N,0,-1):
        work[l-1]=(2*l+1)*work[l]/z-work[l+1]
        if abs(work[l-1])>1e100:
            for j in range(l-1,N+2):
                work[j]*=1e-100
    scale=(j0/work[0]) if abs(j0)>=abs(j1) else j1/work[1]
    return [scale*work[l] for l in range(n+1)]


def legendre_all(mu:float,ell_max:int) -> list[float]:
    mu=_finite_number("cos_angle",mu)
    n=_ell(ell_max)
    if not -1<=mu<=1:
        raise ValueError("cos_angle must be in [-1,1]")
    values=[1.0]
    if n:
        values.append(mu)
        for l in range(1,n):
            values.append(((2*l+1)*mu*values[l]-l*values[l-1])/(l+1))
    return values


def _radii(radius1_m:float,radius2_m:float,mu:float) -> tuple[float,float,float,float]:
    a=_finite_number("radius1_m",radius1_m)
    b=_finite_number("radius2_m",radius2_m)
    mu=_finite_number("cos_angle",mu)
    if not 0<=a<=2 or not 0<=b<=2 or not -1<=mu<=1:
        raise ValueError("flat reference radii must be in [0,2] m, cos_angle in [-1,1]")
    d=math.sqrt(max(0,a*a+b*b-2*a*b*mu))
    return a,b,mu,d


def angular_kernel(k:float,radius1_m:float,radius2_m:float,mu:float,ell_max:int) -> float:
    k=_finite_number("k_inverse_m",k)
    n=_ell(ell_max)
    a,b,mu,_=_radii(radius1_m,radius2_m,mu)
    if not 0<=k<=300:
        raise ValueError("k must lie in [0,300] m^-1")
    jl=spherical_bessel_j_all(k*a,n)
    jr=spherical_bessel_j_all(k*b,n)
    p=legendre_all(mu,n)
    return sum((2*l+1)*jl[l]*jr[l]*p[l] for l in range(n+1))


def flat_spherical_wightman(
    radius1_m:float,radius2_m:float,cos_angle:float,
    delta_ct_m:float,epsilon_m:float,ell_max:int=24,
    k_cutoff_per_m:float=80.0,steps:int=1024,
) -> dict:
    """Spherical partial-wave k-integral with quantified numerical differences."""
    ell=_ell(ell_max)
    a,b,mu,d=_radii(radius1_m,radius2_m,cos_angle)
    dt=_finite_number("delta_ct_m",delta_ct_m)
    eps=_finite_number("epsilon_m",epsilon_m)
    K=_finite_number("k_cutoff_per_m",k_cutoff_per_m)
    if abs(dt)>2 or not .2<=eps<=1.2 or not 20<=K<=100:
        raise ValueError("time in [-2,2] m; epsilon [.2,1.2] m; K [20,100] m^-1")
    if isinstance(steps,bool) or not isinstance(steps,int) or not 256<=steps<=8192 or steps%2:
        raise ValueError("steps must be even in [256,8192]")
    h=K/steps
    accum=0j
    for i in range(steps+1):
        k=i*h
        sph=angular_kernel(k,a,b,mu,ell)
        w=1 if i in (0,steps) else (4 if i%2 else 2)
        accum+=w*k*math.exp(-eps*k)*cmath.exp(-1j*k*dt)*sph
    result=accum*h/(3*4*PI*PI)
    exact=minkowski_wightman(dt,d,eps)
    direct=minkowski_spectral_quadrature(dt,d,eps,K,steps)
    direct_complex=complex(direct["spectral_real_inverse_m2"],direct["spectral_imag_inverse_m2"])
    return {
        "background":"3+1D Minkowski free real massless scalar, spherical mode calibration",
        "radius1_m":a,"radius2_m":b,"cos_angle":mu,"separation_m":d,
        "delta_ct_m":dt,"epsilon_m":eps,"ell_max":ell,
        "frequency_cutoff_inverse_m":K,"simpson_steps":steps,
        "spherical_real_inverse_m2":result.real,
        "spherical_imag_inverse_m2":result.imag,
        "direct_spectral_real_inverse_m2":direct_complex.real,
        "direct_spectral_imag_inverse_m2":direct_complex.imag,
        "analytic_real_inverse_m2":exact.real,
        "analytic_imag_inverse_m2":exact.imag,
        "partial_wave_vs_direct_absolute_inverse_m2":abs(result-direct_complex),
        "partial_wave_vs_analytic_absolute_inverse_m2":abs(result-exact),
        "direct_spectral_vs_analytic_absolute_inverse_m2":abs(direct_complex-exact),
        "frequency_tail_absolute_upper_bound_inverse_m2":direct["rigorous_cutoff_tail_upper_bound_inverse_m2"],
        "angular_truncation_error_rigorously_bounded":False,
        "complete_ellis_mode_basis_constructed":False,
        "ellis_wightman_constructed":False,
        "ellis_hadamard_property_verified":False,
        "curved_4d_qei_evaluated":False,
        "semiclassical_backreaction_solved":False,
    }


def _bump_derivative(u:float) -> float:
    b,_=bump_raw(u)
    if abs(u)>=1:
        return 0.
    return -2*u*b/(1-u*u)**2


def ellis_ir_rayleigh(throat_m:float,width_m:float,center_widths:float=12,steps:int=2048) -> dict:
    """Rayleigh test for -Delta on a complete two-ended Ellis spatial slice.

    Trial ψ(l)=b((l-center)/width), constant in angles, center=12 widths
    from the throat; actual volume element R(l)^2 dl dOmega.
    Quotient ∫R²|ψ'|²dl / ∫R²|ψ|²dl in m^-2. Supports lie on one end.
    """
    r0=_throat(throat_m)
    W=_finite_number("width_m",width_m)
    c=_finite_number("center_widths",center_widths)
    if not .1<=W<=1e9 or not 4<=c<=30:
        raise ValueError("width_m in [0.1,1e9], center_widths in [4,30]")
    if isinstance(steps,bool) or not isinstance(steps,int) or steps<256 or steps>8192 or steps%2:
        raise ValueError("steps must be even in [256,8192]")
    h=2/steps
    numerator=0.
    denominator=0.
    for j in range(1,steps):
        u=-1+j*h
        l=W*(c+u)
        volume_factor=l*l+r0*r0
        bp=_bump_derivative(u)
        b,_=bump_raw(u)
        w=4 if j%2 else 2
        numerator+=w*volume_factor*bp*bp
        denominator+=w*volume_factor*b*b
    quotient=(numerator/denominator)/(W*W)
    return {
        "metric":"spatial h=dl²+(l²+r0²)dOmega² on the complete Ellis slice",
        "operator":"nonnegative massless spatial scalar Laplacian -Delta_h",
        "throat_m":r0,"packet_width_m":W,
        "center_distance_m":c*W,"left_support_m":(c-1)*W,
        "right_support_m":(c+1)*W,
        "rayleigh_quotient_inverse_m2":quotient,
        "dimensionless_width_scaled_quotient":quotient*W*W,
        "grad_energy_quadratic_form_nonnegative":True,
        "variational_sequence_approaches_zero":True,
        "positive_uniform_spectral_gap":False,
        "normalizable_zero_eigenmode_proven":False,
        "hadamard_state_nonexistence_inferred":False,
        "ellis_quantum_state_constructed":False,
        "ellis_stress_renormalized":False,
        "curved_qei_evaluated":False,
    }
