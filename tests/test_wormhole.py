"""Checks metric conditions and two independently derived Einstein tensors."""
import json
import math
from pathlib import Path
import unittest

from phichronos.wormhole import (
    KAPPA_ENERGY, areal_radius_m, evaluate_wormhole,
    proper_radial_m, shape_derivative, shape_function_m,
    stress_from_proper_radial, stress_from_shape,
)


class WormholeGeometryTests(unittest.TestCase):
    def test_throat_boundary_and_flare_out(self):
        for r0 in (0.001, 1.0, 100.0, 1e7):
            with self.subTest(r0=r0):
                r = evaluate_wormhole(r0)
                self.assertAlmostEqual(r["shape_m"], r0)
                self.assertEqual(r["shape_derivative"], -1.0)
                self.assertTrue(r["flaring_out_at_throat"])
                self.assertEqual(r["lapse_squared"], 1.0)
                self.assertAlmostEqual(r["radial_metric_factor_one_minus_b_over_r"], 0.0)

    def test_proper_radial_coordinate_is_regular(self):
        self.assertEqual(areal_radius_m(2, 0), 2)
        self.assertAlmostEqual(areal_radius_m(2, 3), math.sqrt(13))
        self.assertAlmostEqual(areal_radius_m(2, -3), math.sqrt(13))
        self.assertAlmostEqual(proper_radial_m(2, math.sqrt(13)), 3)
        self.assertAlmostEqual(proper_radial_m(2, math.sqrt(13), -1), -3)

    def test_model_domain_and_invalid_inputs(self):
        invalid = [(0, 1), (-2, 1), (float("nan"), 1),
                   (1, 0.99), (1, 1001), (1, float("inf"))]
        for args in invalid:
            with self.subTest(args=args), self.assertRaises(ValueError):
                evaluate_wormhole(*args)
        with self.assertRaises(ValueError):
            proper_radial_m(1, 2, side=0)
        with self.assertRaises(ValueError):
            areal_radius_m(1, 1001)

    def test_zero_redshift_and_radial_signature(self):
        for q in (1.0, 1.1, 2.0, 5.0, 20.0):
            r = evaluate_wormhole(2.0, q)
            self.assertEqual(r["signature"], "(-,+,+,+)")
            self.assertEqual(r["lapse_squared"], 1.0)
            self.assertGreaterEqual(r["radial_metric_factor_one_minus_b_over_r"], 0)
            if q > 1:
                self.assertGreater(r["radial_metric_factor_one_minus_b_over_r"], 0)

    def test_shape_derivative_with_numerical_difference(self):
        r0 = 10.0
        for q in (1.05, 1.2, 2.0, 5.0, 10.0):
            r = r0*q
            h = 1e-5*r0
            estimate = (shape_function_m(r0, r+h)-shape_function_m(r0,r-h))/(2*h)
            self.assertAlmostEqual(estimate, shape_derivative(r0,r), delta=2e-9)

    def test_spacetime_throat_is_minimum(self):
        r0 = 3.0
        h = 1e-3
        curvature = (areal_radius_m(r0,h)-2*areal_radius_m(r0,0)+areal_radius_m(r0,-h))/(h*h)
        self.assertAlmostEqual(curvature, 1/r0, delta=1e-7)
        self.assertGreater(curvature, 0)


class WormholeStressTests(unittest.TestCase):
    def test_two_coordinate_derivations_agree(self):
        for r0 in (0.1, 1, 100, 1e6):
            for lscale in (0.0, 0.2, 1.0, 3.0, 10.0):
                l = lscale*r0
                r = areal_radius_m(r0,l)
                from_shape = stress_from_shape(r0,r)
                from_proper = stress_from_proper_radial(r0,l)
                for key in from_shape:
                    with self.subTest(r0=r0,l=l,key=key):
                        scale = max(abs(from_shape["energy_density_j_m3"]), 1e-25)
                        self.assertLessEqual(abs(from_shape[key]-from_proper[key]), scale*2e-13)

    def test_classical_null_energy_violation(self):
        for q in (1.0, 1.5, 2.0, 10.0):
            r = evaluate_wormhole(2, q)
            self.assertLess(r["energy_density_j_m3"], 0)
            self.assertLess(r["radial_pressure_pa"], 0)
            self.assertGreater(r["tangential_pressure_pa"], 0)
            self.assertLess(r["radial_nec_j_m3"], 0)
            self.assertAlmostEqual(r["tangential_nec_j_m3"], 0, delta=abs(r["energy_density_j_m3"])*1e-13)
            self.assertFalse(r["radial_nec_satisfied"])
            self.assertTrue(r["tangential_nec_satisfied"])

    def test_throat_scaling_inverse_square(self):
        a = evaluate_wormhole(1.0)
        b = evaluate_wormhole(10.0)
        self.assertAlmostEqual(a["energy_density_j_m3"]/b["energy_density_j_m3"], 100)
        self.assertAlmostEqual(a["radial_nec_j_m3"]/b["radial_nec_j_m3"], 100)

    def test_radial_profile_inverse_fourth_power(self):
        for ratio in (1.5, 2.0, 4.0):
            root = evaluate_wormhole(5.0)
            outer = evaluate_wormhole(5.0, ratio)
            self.assertAlmostEqual(root["energy_density_j_m3"]/outer["energy_density_j_m3"], ratio**4)

    def test_throat_stress_reference(self):
        w = evaluate_wormhole(1)
        expected = -KAPPA_ENERGY
        self.assertAlmostEqual(w["energy_density_j_m3"]/expected, 1)
        self.assertAlmostEqual(w["radial_pressure_pa"]/expected, 1)
        self.assertAlmostEqual(w["tangential_pressure_pa"]/expected, -1)
        self.assertAlmostEqual(w["radial_nec_j_m3"]/expected, 2)
        self.assertAlmostEqual(w["ricci_scalar_inverse_m2"], -2)

    def test_covariant_conservation_in_proper_coordinate(self):
        # For a static ultrastatic spherical metric with anisotropic stress:
        # dp_r/dl + 2(R'/R)*(p_r-p_t) = 0.
        r0 = 7
        for ls in (0.0, 0.1, 0.9, 2.0, 5.0):
            l = ls*r0
            h = 1e-4*r0
            p_plus = stress_from_proper_radial(r0, l+h)["radial_pressure_pa"]
            p_minus = stress_from_proper_radial(r0, l-h)["radial_pressure_pa"]
            grad = (p_plus-p_minus)/(2*h)
            R = areal_radius_m(r0,l)
            st = stress_from_proper_radial(r0,l)
            balance = grad + 2*l/(R*R)*(st["radial_pressure_pa"]-st["tangential_pressure_pa"])
            scale = abs(st["radial_pressure_pa"])/r0
            self.assertLessEqual(abs(balance),scale*3e-7)

    def test_not_claimed_qei_stability_or_real(self):
        r = evaluate_wormhole(1.0)
        self.assertFalse(r["quantum_energy_inequality_checked"])
        self.assertFalse(r["dynamical_stability_checked"])
        self.assertFalse(r["physical_wormhole_demonstrated"])


class WormholeProvenanceTests(unittest.TestCase):
    def test_metadata_source_and_reproducibility(self):
        path = Path(__file__).resolve().parents[1]/"research"/"wormhole-benchmark.json"
        rec = json.loads(path.read_text(encoding="utf-8"))
        self.assertIn("10.1119/1.15620", rec["primary_source"])
        self.assertIn("curve", rec["limitations"].lower())
        self.assertGreater(len(rec["validation"]), 3)


if __name__ == "__main__":
    unittest.main()
