import json
import math
from pathlib import Path
import unittest
from phichronos.qei import (
    HBAR, FR_COEFF, FE_COEFF, flat_qei_bounds, sampled_toy_pulse,
    pulse_quadrature_ratio, sampler, wormhole_domain_audit,
)
from phichronos.relativity import C

class QuantumInequalityTests(unittest.TestCase):
    def test_coefficients(self):
        self.assertAlmostEqual(FR_COEFF,3/(32*math.pi**2))
        self.assertAlmostEqual(FE_COEFF,27/(2048*math.pi**2))
        self.assertAlmostEqual(FE_COEFF/FR_COEFF,9/64,places=14)
        self.assertAlmostEqual(HBAR,6.62607015e-34/(2*math.pi))

    def test_physical_units_and_order(self):
        tau=1e-15
        d=flat_qei_bounds(tau)
        self.assertAlmostEqual(d["ford_roman_lower_j_m3"]/(HBAR/(C**3*tau**4)),-FR_COEFF)
        self.assertAlmostEqual(d["fewster_eveson_lower_j_m3"]/(HBAR/(C**3*tau**4)),-FE_COEFF)
        self.assertLess(d["ford_roman_lower_j_m3"],d["fewster_eveson_lower_j_m3"])
        self.assertLess(d["fewster_eveson_lower_j_m3"],0)

    def test_inverse_fourth(self):
        for tau in (1e-20,1e-15,1e-10):
            a=flat_qei_bounds(tau)["fewster_eveson_lower_j_m3"]
            b=flat_qei_bounds(tau*10)["fewster_eveson_lower_j_m3"]
            self.assertAlmostEqual(a/b,10000)

    def test_normalized_lorentzian(self):
        t=1e-14
        self.assertAlmostEqual(sampler(0,t),1/(math.pi*t))
        self.assertAlmostEqual(2/math.pi*math.atan(7),0.909665529398267,places=12)

    def test_pulse_integral_vs_independent_quadrature(self):
        for tau_ratio in (0.2,0.5,1,2,5):
            tau=1e-15*tau_ratio
            self.assertAlmostEqual(pulse_quadrature_ratio(1e-15,tau),
                                   1e-15/(1e-15+tau),delta=2e-5)

    def test_pulse_can_be_excluded_not_proved(self):
        tau=1e-15
        strength=abs(flat_qei_bounds(tau)["fewster_eveson_lower_j_m3"])
        mild=sampled_toy_pulse(strength,tau,tau)
        self.assertEqual(mild["status"],"not_excluded_by_one_bound")
        late=sampled_toy_pulse(strength,tau,10*tau)
        self.assertEqual(late["status"],"excluded_for_this_flat_field")
        self.assertTrue(late["trial_not_a_constructed_state"])

    def test_invalid_inputs(self):
        for v in (-1,0,1,1e-30,float("nan"),float("inf")):
            with self.subTest(v=v),self.assertRaises(ValueError):
                flat_qei_bounds(v)
        with self.assertRaises(ValueError):
            sampled_toy_pulse(-1,1e-15,1e-15)
        with self.assertRaises(ValueError):
            pulse_quadrature_ratio(1e-15,1e-15,33)

    def test_curved_gate_never_returns_claim(self):
        for r0 in (0.1,1,1000):
            for tau in (1e-18,1e-14):
                audit=wormhole_domain_audit(r0,1,tau)
                self.assertFalse(audit["flat_qei_transfer_established"])
                self.assertFalse(audit["semiclassical_backreaction_evaluated"])
                self.assertIsNone(audit["qei_compliance"])
                self.assertGreater(audit["ricci_length_m"],0)

    def test_curvature_scale_throat(self):
        audit=wormhole_domain_audit(1,1,1e-15)
        self.assertAlmostEqual(audit["ricci_length_m"],1/math.sqrt(2))
        self.assertAlmostEqual(audit["sampling_to_ricci_length"],C*1e-15*math.sqrt(2))

    def test_source_record(self):
        data=json.loads((Path(__file__).resolve().parents[1]/"research"/"qei-benchmark.json").read_text())
        self.assertIn("PhysRevD.53.5496",data["references"]["ford_roman"])
        self.assertIn("PhysRevD.58.084010",data["references"]["fewster_eveson"])
        self.assertFalse(data["curved_transfer_proven"])

if __name__=="__main__":
    unittest.main()
