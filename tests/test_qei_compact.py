"""Published compact-support QEI plus independent curvature and quadrature checks."""
import json
import math
from pathlib import Path
import unittest
from phichronos.qei_compact import (
    bump_raw,simpson_bump_integrals,midpoint_bump_integrals,compact_integrals,
    compact_sampler_density,compact_flat_qei,compact_plateau_trial,
)
from phichronos.curvature import curvature_audit
from phichronos.relativity import C


class FiniteSamplingTests(unittest.TestCase):
    def test_smooth_bump_endpoints_and_evenness(self):
        for u in (-4,-1,1,9):
            self.assertEqual(bump_raw(u),(0.0,0.0))
        for u in (0,0.2,0.5,0.9,0.995):
            for a,b in zip(bump_raw(-u),bump_raw(u)):
                self.assertAlmostEqual(a,b,delta=1e-13)

    def test_second_derivative_independent_difference(self):
        for u in (0,0.2,0.5):
            h=1e-4
            center=bump_raw(u)[0]
            fd=(bump_raw(u+h)[0]-2*center+bump_raw(u-h)[0])/(h*h)
            self.assertAlmostEqual(fd,bump_raw(u)[1],delta=1e-6)

    def test_integrals_and_independent_midpoint(self):
        s0,s2=simpson_bump_integrals(4096)
        m0,m2=midpoint_bump_integrals(16384)
        self.assertAlmostEqual(s0,m0,delta=1e-12)
        self.assertAlmostEqual(s2,m2,delta=1e-8)
        self.assertAlmostEqual(s2/s0,81.407946543258,delta=1e-7)
        self.assertLess(compact_integrals()["relative_quadrature_difference"],1e-9)

    def test_normalization_support_and_scaling(self):
        for tau in (1e-18,1e-15,1e-12):
            self.assertEqual(compact_sampler_density(tau,tau),0)
            self.assertEqual(compact_sampler_density(-tau,tau),0)
            self.assertEqual(compact_sampler_density(2*tau,tau),0)
            self.assertAlmostEqual(compact_sampler_density(0,tau)*tau,
                math.exp(-2)/compact_integrals()["normalization_i0"],places=10)

    def test_integrated_probability_weight_unity(self):
        n=4096
        h=2/n
        tau=1e-15
        total=0.0
        for i in range(1,n):
            t=tau*(-1+i*h)
            total+=(4 if i%2 else 2)*compact_sampler_density(t,tau)
        self.assertAlmostEqual(total*tau*h/3,1.0,places=10)

    def test_expected_bound_and_fourth_power(self):
        x=compact_flat_qei(1e-15)
        self.assertAlmostEqual(x["dimensionless_coefficient"],81.407946543258,delta=1e-7)
        self.assertAlmostEqual(x["lower_energy_density_j_m3"],-2.017721047850942,delta=1e-9)
        self.assertAlmostEqual(x["total_support_seconds"],2e-15)
        y=compact_flat_qei(1e-14)
        self.assertAlmostEqual(x["lower_energy_density_j_m3"]/y["lower_energy_density_j_m3"],1e4)

    def test_one_inequality_does_not_construct_state(self):
        bound=abs(compact_flat_qei(1e-15)["lower_energy_density_j_m3"])
        mild=compact_plateau_trial(bound*0.3,1e-15)
        strong=compact_plateau_trial(bound*1.5,1e-15)
        self.assertEqual(mild["status"],"not_excluded_by_one_bound")
        self.assertEqual(strong["status"],"excluded_for_this_flat_field")
        self.assertTrue(mild["toy_is_not_physical_state"])
        self.assertIsNone(strong["wormhole_compliance"])

    def test_reject_bad_domain(self):
        for tau in (0,-1,1,1e-30,float("nan"),float("inf")):
            with self.assertRaises(ValueError):
                compact_flat_qei(tau)
        with self.assertRaises(ValueError):
            compact_plateau_trial(-1,1e-15)
        with self.assertRaises(ValueError):
            bump_raw(float("nan"))
        for n in (127,129,16385,False):
            with self.assertRaises(ValueError):
                simpson_bump_integrals(n)


class CurvatureDiagnosticsTests(unittest.TestCase):
    def test_throat_curvature_components_and_invariants(self):
        for r0 in (0.1,1,100,10000):
            x=curvature_audit(r0,1,1e-15)
            self.assertAlmostEqual(x["radial_angular_section_inverse_m2"]*r0*r0,-1)
            self.assertAlmostEqual(x["angular_section_inverse_m2"]*r0*r0,1)
            self.assertAlmostEqual(x["ricci_scalar_inverse_m2"]*r0*r0,-2)
            self.assertAlmostEqual(x["kretschmann_inverse_m4"]*r0**4,12)
            self.assertAlmostEqual(x["component_curvature_length_m"],r0)
            self.assertAlmostEqual(x["ricci_length_m"],r0/math.sqrt(2))
            self.assertAlmostEqual(x["kretschmann_length_m"],r0/(12**0.25))

    def test_curvature_scaling_and_independent_checks(self):
        for ratio in (1,1.1,2,5,50,100):
            r0=2
            x=curvature_audit(r0,ratio,1e-15)
            k=r0*r0/(r0*ratio)**4
            self.assertAlmostEqual(x["ricci_scalar_inverse_m2"]/k,-2)
            self.assertAlmostEqual(x["kretschmann_inverse_m4"]/(k*k),12)
            self.assertAlmostEqual(x["max_orthonormal_component_inverse_m2"],k)
            self.assertAlmostEqual(x["sampling_length_m"],C*1e-15)

    def test_flat_to_curved_gate_always_closed(self):
        for r0 in (0.1,1,1000):
            for tau in (1e-21,1e-15):
                x=curvature_audit(r0,1,tau)
                self.assertFalse(x["flat_qei_transfer_proven"])
                self.assertFalse(x["backreaction_evaluated"])
                self.assertFalse(x["semiclassical_state_constructed"])
                self.assertIsNone(x["qei_compliance"])
                self.assertGreater(x["compact_sample_to_component_scale_ratio"],0)

    def test_metadata(self):
        path=Path(__file__).resolve().parents[1]/"research"/"compact-qei-benchmark.json"
        record=json.loads(path.read_text(encoding="utf-8"))
        self.assertIn("5.5",record["primary_formula"])
        self.assertFalse(record["curved_metric_qei_claimed"])
        self.assertIn("Fewster",record["references"]["original_paper"])
        self.assertLess(abs(record["dimensionless_coefficient"]-compact_integrals()["dimensionless_coefficient"]),1e-7)


if __name__ == "__main__":
    unittest.main()
