import math
import unittest

from phichronos.relativity import (
    C, EARTH_MASS_KG, EARTH_RADIUS_M,
    lorentz_factor, proper_time_years, kinetic_energy_joules,
    schwarzschild_clock_rate, altitude_time_gain_ns_per_day,
)


class RelativityTests(unittest.TestCase):
    def test_stationary_gamma(self):
        self.assertEqual(lorentz_factor(0), 1)

    def test_beta_half(self):
        self.assertAlmostEqual(lorentz_factor(0.5), 1.1547005383792515, places=12)

    def test_beta_099(self):
        self.assertAlmostEqual(lorentz_factor(0.99), 7.08881205008335, places=10)

    def test_proper_time(self):
        self.assertAlmostEqual(proper_time_years(7.08881205008335, 0.99), 1, places=10)

    def test_reject_unphysical_speeds(self):
        for beta in [-0.1, 1, 1.1, float("nan"), float("inf")]:
            with self.subTest(beta=beta), self.assertRaises(ValueError):
                lorentz_factor(beta)

    def test_kinetic_energy_rest_and_moving(self):
        self.assertEqual(kinetic_energy_joules(100, 0), 0)
        self.assertAlmostEqual(kinetic_energy_joules(2, 0.6), 0.5 * C * C, places=1)

    def test_negative_mass_and_years(self):
        with self.assertRaises(ValueError):
            kinetic_energy_joules(-1, 0.2)
        with self.assertRaises(ValueError):
            proper_time_years(-1, 0.2)

    def test_gravity_earth_surface(self):
        r = schwarzschild_clock_rate(EARTH_RADIUS_M, EARTH_MASS_KG)
        self.assertTrue(0.999999998 < r < 1)

    def test_gravity_schwarzschild_boundary(self):
        with self.assertRaises(ValueError):
            schwarzschild_clock_rate(1, 1e40)

    def test_altitude_reference(self):
        self.assertAlmostEqual(altitude_time_gain_ns_per_day(1), 0.009429, delta=0.00002)
        self.assertEqual(altitude_time_gain_ns_per_day(0), 0)

    def test_altitude_domain(self):
        with self.assertRaises(ValueError):
            altitude_time_gain_ns_per_day(20000)


if __name__ == "__main__":
    unittest.main()
