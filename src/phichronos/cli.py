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
