"""Relativistic clock models with explicit domains and assumptions.

Velocity models assume inertial motion at a constant speed relative to Earth;
they ignore finite acceleration, return trajectories, gravity and propulsion.
Schwarzschild clocks are *stationary* outside a nonrotating spherical mass.
The altitude approximation applies only near Earth's surface.
"""
from __future__ import annotations

import math

C = 299_792_458.0  # m/s, exact SI definition
G = 6.67430e-11  # m^3 kg^-1 s^-2, CODATA 2018 recommended
EARTH_MASS_KG = 5.9722e24
EARTH_RADIUS_M = 6_371_000.0
G0_M_PER_S2 = 9.80665
SECONDS_PER_DAY = 86_400.0


def _finite_number(name: str, value: float) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
        raise ValueError(f"{name} must be a finite number")
    return float(value)


def lorentz_factor(beta: float) -> float:
    """Return gamma for beta = speed/c, with 0 <= beta < 1."""
    beta = _finite_number("beta", beta)
    if not 0 <= beta < 1:
        raise ValueError("beta must satisfy 0 <= beta < 1")
    return 1.0 / math.sqrt((1.0 - beta) * (1.0 + beta))


def proper_time_years(earth_years: float, beta: float) -> float:
    """Elapsed years on an inertial moving clock for Earth-frame years."""
    years = _finite_number("earth_years", earth_years)
    if years < 0:
        raise ValueError("earth_years must be nonnegative")
    return years / lorentz_factor(beta)


def kinetic_energy_joules(mass_kg: float, beta: float) -> float:
    """Ideal minimum translational kinetic energy, ignoring propulsion losses."""
    mass = _finite_number("mass_kg", mass_kg)
    if mass < 0:
        raise ValueError("mass_kg must be nonnegative")
    gamma = lorentz_factor(beta)
    return (gamma - 1.0) * mass * C ** 2


def schwarzschild_clock_rate(radius_m: float, mass_kg: float) -> float:
    """Stationary clock rate d(tau)/dt relative to asymptotic Schwarzschild time.

    Only defined outside the Schwarzschild radius; not valid for a rotating
    body or an orbiting clock. A real Earth clock requires additional effects.
    """
    radius = _finite_number("radius_m", radius_m)
    mass = _finite_number("mass_kg", mass_kg)
    if mass < 0 or radius <= 0:
        raise ValueError("mass_kg must be >= 0 and radius_m must be > 0")
    rs = 2.0 * G * mass / C ** 2
    if radius <= rs:
        raise ValueError("stationary clock is not defined at/below Schwarzschild radius")
    return math.sqrt(1.0 - rs / radius)


def altitude_time_gain_ns_per_day(height_m: float) -> float:
    """Approximate clock gain at height h relative to local surface clock.

    Uses the leading-order weak-field expression delta_t/t ≈ g*h/c^2;
    assumes uniform near-surface gravity and ignores Earth rotation and motion.
    Negative h produces a slower clock. Height is not an orbital altitude model.
    """
    h = _finite_number("height_m", height_m)
    if abs(h) > 10_000:
        raise ValueError("weak-field fixed-g approximation restricted to |height| <= 10 km")
    return G0_M_PER_S2 * h / C ** 2 * SECONDS_PER_DAY * 1e9
