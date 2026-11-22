"""Reproducible terminal entry points for model calculations."""
from __future__ import annotations
import argparse
import json
from .relativity import (
    lorentz_factor, proper_time_years, kinetic_energy_joules,
    altitude_time_gain_ns_per_day,
)
from .causality import classify_interval, proper_time_seconds
from .boost import lorentz_boost, minkowski_interval_m2, causal_region
from .chronology import quotient_analysis, winding_history
from .postselection import postselected_cnot
from .wormhole import evaluate_wormhole
from .qei import flat_qei_bounds, sampled_toy_pulse, wormhole_domain_audit
from .qei_compact import compact_flat_qei, compact_plateau_trial
from .curvature import curvature_audit
from .qei_curved2d import curved_2d_bound, curved_2d_trial
from .scalar_modes import s_wave_scattering
from .quantum_reference import minkowski_spectral_quadrature, ellis_s_wave_channel


def main() -> None:
    parser = argparse.ArgumentParser(prog="phichronos", description="PhiChronos model lab")
    sub = parser.add_subparsers(dest="model", required=True)
    v = sub.add_parser("velocity", help="special relativistic constant-speed scenario")
    v.add_argument("--beta", type=float, required=True)
    v.add_argument("--earth-years", type=float, required=True)
    v.add_argument("--mass-kg", type=float, default=1000)
    a = sub.add_parser("altitude", help="near-Earth weak-field clock gain")
    a.add_argument("--meters", type=float, required=True)
    i = sub.add_parser("interval", help="flat spacetime event separation")
    i.add_argument("--dt-seconds", type=float, required=True)
    i.add_argument("--distance-meters", type=float, required=True)
    b = sub.add_parser("boost", help="Lorentz boost of 1+1D flat-spacetime event")
    b.add_argument("--beta", type=float, required=True)
    b.add_argument("--time-seconds", type=float, required=True)
    b.add_argument("--x-meters", type=float, required=True)
    q = sub.add_parser("quotient", help="mathematically imposed Minkowski cylinder, NOT a physical time machine")
    q.add_argument("--delta-ct", type=float, required=True, help="time shift in light-seconds (numerically seconds)")
    q.add_argument("--delta-x", type=float, required=True, help="spatial shift in light-seconds")
    q.add_argument("--turns", type=int, default=3)
    p = sub.add_parser("postselect", help="Bell-pair CNOT postselection toy, NOT real backward travel")
    p.add_argument("--prob-zero", type=float, required=True)
    p.add_argument("--shots", type=int, default=1000)
    w = sub.add_parser("wormhole", help="static Morris–Thorne classical stress model, NOT an engineering method")
    w.add_argument("--throat-m", type=float, required=True)
    w.add_argument("--ratio", type=float, default=1.0, help="areal radius divided by throat radius")
    qe = sub.add_parser("qei", help="4D flat free scalar Lorentzian sampled lower bounds")
    qe.add_argument("--tau-s", type=float, required=True)
    qe.add_argument("--pulse-amplitude-j-m3", type=float, default=None)
    qe.add_argument("--pulse-width-s", type=float, default=1e-15)
    audit = sub.add_parser("qei-audit", help="flat theorem does not automatically transfer to wormhole")
    audit.add_argument("--tau-s", type=float, required=True)
    audit.add_argument("--throat-m", type=float, required=True)
    audit.add_argument("--ratio", type=float, default=1)
    comp = sub.add_parser("qei-compact", help="finite-support Minkowski free-scalar QEI; not a wormhole theorem")
    comp.add_argument("--tau-s", type=float, required=True)
    comp.add_argument("--plateau-amplitude-j-m3", type=float, default=None)
    curv = sub.add_parser("curvature-audit", help="orthonormal curvature invariants; no QEI compliance verdict")
    curv.add_argument("--throat-m", type=float, required=True)
    curv.add_argument("--ratio", type=float, default=1.0)
    curv.add_argument("--tau-s", type=float, required=True)
    two = sub.add_parser("qei-curved2d", help="Flanagan theorem: real curved 1+1D spacetime, not a 4D wormhole bound")
    two.add_argument("--alpha",type=float,required=True)
    two.add_argument("--length-m",type=float,required=True)
    two.add_argument("--tau-s",type=float,required=True)
    two.add_argument("--plateau-amplitude-j-per-m",type=float,default=None)
    sw = sub.add_parser("scalar-wave",help="curved 4D fixed Ellis metric, massless test-scalar s-wave scattering; NOT a QEI")
    sw.add_argument("--throat-m",type=float,required=True)
    sw.add_argument("--kappa",type=float,required=True,help="dimensionless frequency omega*r0/c")
    sw.add_argument("--extent",type=float,default=32,help="numerical half-domain in throat units")
    sw.add_argument("--steps",type=int,default=4096)
    wm=sub.add_parser("wightman-flat4d",help="analytic vs positive-frequency spectral Minkowski vacuum, NOT Ellis state")
    wm.add_argument("--delta-ct-m",type=float,default=0.3)
    wm.add_argument("--separation-m",type=float,default=0.7)
    wm.add_argument("--epsilon-m",type=float,default=0.5)
    wm.add_argument("--k-cutoff-per-m",type=float,default=96)
    wm.add_argument("--steps",type=int,default=4096)
    qm=sub.add_parser("ellis-mode",help="4D curved s-wave complex scattering channel, NOT a Hadamard state")
    qm.add_argument("--throat-m",type=float,required=True)
    qm.add_argument("--kappa",type=float,required=True)
    qm.add_argument("--extent",type=float,default=32)
    qm.add_argument("--steps",type=int,default=4096)
    args = parser.parse_args()

    try:
        if args.model == "velocity":
            result = {
                "model": "idealized special relativity; not propulsion feasibility",
                "lorentz_factor": lorentz_factor(args.beta),
                "earth_years": args.earth_years,
                "traveler_years": proper_time_years(args.earth_years, args.beta),
                "kinetic_energy_joules": kinetic_energy_joules(args.mass_kg, args.beta),
            }
        elif args.model == "altitude":
            result = {
                "model": "fixed-g weak field approximation, no orbital motion",
                "height_m": args.meters,
                "clock_gain_ns_per_day": altitude_time_gain_ns_per_day(args.meters),
            }
        elif args.model == "quotient":
            result = quotient_analysis(args.delta_ct, args.delta_x)
            result["winding_history"] = winding_history(args.delta_ct, args.delta_x, args.turns)
        elif args.model == "qei":
            result = flat_qei_bounds(args.tau_s) if args.pulse_amplitude_j_m3 is None else sampled_toy_pulse(
                args.pulse_amplitude_j_m3, args.pulse_width_s, args.tau_s)
        elif args.model == "wightman-flat4d":
            result=minkowski_spectral_quadrature(args.delta_ct_m,args.separation_m,
                         args.epsilon_m,args.k_cutoff_per_m,args.steps)
        elif args.model == "ellis-mode":
            result=ellis_s_wave_channel(args.throat_m,args.kappa,args.extent,args.steps)
        elif args.model == "scalar-wave":
            result = s_wave_scattering(args.throat_m,args.kappa,args.extent,args.steps)
        elif args.model == "qei-curved2d":
            result = (curved_2d_bound(args.alpha,args.length_m,args.tau_s)
                      if args.plateau_amplitude_j_per_m is None
                      else curved_2d_trial(args.alpha,args.length_m,args.tau_s,args.plateau_amplitude_j_per_m))
        elif args.model == "qei-compact":
            result = (compact_flat_qei(args.tau_s) if args.plateau_amplitude_j_m3 is None
                      else compact_plateau_trial(args.plateau_amplitude_j_m3,args.tau_s))
        elif args.model == "curvature-audit":
            result = curvature_audit(args.throat_m,args.ratio,args.tau_s)
        elif args.model == "qei-audit":
            result = wormhole_domain_audit(args.throat_m, args.ratio, args.tau_s)
        elif args.model == "wormhole":
            result = evaluate_wormhole(args.throat_m, args.ratio)
        elif args.model == "postselect":
            result = postselected_cnot(args.prob_zero, args.shots)
        elif args.model == "boost":
            tp, xp = lorentz_boost(args.time_seconds, args.x_meters, args.beta)
            result = {
                "model": "Lorentz boost between inertial frames in flat 1+1D spacetime",
                "beta": args.beta,
                "unprimed": {"t_seconds": args.time_seconds, "x_meters": args.x_meters},
                "primed": {"t_seconds": tp, "x_meters": xp},
                "signed_interval_m2": minkowski_interval_m2(args.time_seconds, args.x_meters),
                "primed_signed_interval_m2": minkowski_interval_m2(tp, xp),
                "causal_region": causal_region(args.time_seconds, args.x_meters),
            }
        else:
            kind = classify_interval(args.dt_seconds, args.distance_meters)
            result = {
                "model": "Minkowski flat spacetime, not a CTC test",
                "classification": kind,
                "proper_time_seconds": None if kind == "spacelike" else
                    proper_time_seconds(args.dt_seconds, args.distance_meters),
            }
    except ValueError as exc:
        parser.error(str(exc))
    print(json.dumps(result, indent=2, allow_nan=False))


if __name__ == "__main__":
    main()
