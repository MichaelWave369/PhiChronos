"""Minkowski positive-frequency reference and Ellis asymptotic KG mode checks."""
import math
import unittest

from phichronos.quantum_reference import (
    minkowski_wightman,minkowski_spectral_quadrature,
    ellis_s_wave_channel,free_channel_validation,
)
from phichronos.scalar_modes import s_wave_scattering


class MinkowskiReferenceTests(unittest.TestCase):
    def test_equal_time_rational_function(self):
        for r,eps in ((0,.3),(.6,.35),(2,.6)):
            expected=1/(4*math.pi**2*(r*r+eps*eps))
            got=minkowski_wightman(0,r,eps)
            self.assertAlmostEqual(got.real,expected,places=13)
            self.assertEqual(got.imag,0)

    def test_spectral_quad_vs_analytic_independent(self):
        for ct,r,eps in ((0,0,.4),(.35,0,.35),(0,1,.3),(.3,.7,.5),(-.2,1.2,.4)):
            with self.subTest(ct=ct,r=r,eps=eps):
                z=minkowski_spectral_quadrature(ct,r,eps,k_cutoff_per_m=100,steps=4096)
                self.assertLess(z["absolute_numeric_discrepancy_inverse_m2"],2e-7)
                self.assertLess(z["rigorous_cutoff_tail_upper_bound_inverse_m2"],1e-6)
                self.assertEqual(z["frequency_support"],"positive k only; exp(-epsilon k) regulator")

    def test_regulator_short_distance(self):
        a=minkowski_wightman(0,0,.5).real
        b=minkowski_wightman(0,0,.25).real
        self.assertAlmostEqual(b/a,4)
        self.assertGreater(a,0)

    def test_hermiticity_for_time_reversal(self):
        for ct,r in ((.3,.4),(-1,1.5),(2,0),(.5,2)):
            self.assertAlmostEqual(abs(minkowski_wightman(ct,r,.5)-
                                       minkowski_wightman(-ct,r,.5).conjugate()),0,places=13)

    def test_positive_type_kernel(self):
        events=[(0,0),(.6,.4),(1.1,-.5)]
        coeff=[1+0j,-.3+.7j,.5-.2j]
        total=0j
        for i,(ti,xi) in enumerate(events):
            for j,(tj,xj) in enumerate(events):
                z=minkowski_wightman(ti-tj,abs(xi-xj),.3)
                total+=coeff[i].conjugate()*coeff[j]*z
        self.assertAlmostEqual(total.imag,0,places=12)
        self.assertGreater(total.real,0)

    def test_domain_and_guard(self):
        for eps in (0,-.2,float("nan"),10):
            with self.assertRaises(ValueError):minkowski_wightman(0,.5,eps)
        with self.assertRaises(ValueError):minkowski_wightman(5,.5,.5)
        with self.assertRaises(ValueError):minkowski_wightman(0,-1,.5)
        for steps in (5,511,513,True):
            with self.assertRaises(ValueError):
                minkowski_spectral_quadrature(.2,.4,.5,steps=steps)


class EllisScatteringChannelTests(unittest.TestCase):
    def test_complex_amplitudes_reproduce_existing_solver(self):
        for k in (.03,.1,.5,1,2):
            mode=ellis_s_wave_channel(1,k,extent=32,steps=4096)
            power=s_wave_scattering(1,k,extent=32,steps=4096)
            self.assertAlmostEqual(mode["reflection_power"],power["reflection"],places=9)
            self.assertAlmostEqual(mode["transmission_power"],power["transmission"],places=9)
            self.assertLess(mode["unitarity_error"],3e-6)
            self.assertLess(mode["transfer_determinant_error"],3e-6)
            self.assertLess(mode["symmetry_channel_orthogonality_error"],3e-6)
            self.assertLess(mode["parity_symmetric_transfer_error"],3e-5)

    def test_free_scattering_has_right_phase(self):
        for k in (.1,.5,1.5):
            d=free_channel_validation(k,extent=14,steps=4096)
            self.assertLess(d["transmission_phase_error"],4e-5)
            self.assertLess(d["reflection_abs"],1e-7)
            self.assertLess(d["unitarity_error"],3e-6)

    def test_formal_continuum_delta_kappa_normalization(self):
        for k in (.03,.1,.5,2):
            m=ellis_s_wave_channel(1,k,extent=24,steps=3072)
            self.assertAlmostEqual(m["formal_norm_2k_2pi_N_squared"],1,places=13)
            self.assertFalse(m["continuum_mode_completeness_verified"])
            self.assertFalse(m["wormhole_wightman_constructed"])
            self.assertFalse(m["hadamard_property_verified"])
            self.assertFalse(m["renormalized_stress_tensor_computed"])
            self.assertFalse(m["backreaction_solved"])

    def test_geometry_rescaling(self):
        a=ellis_s_wave_channel(1,.5,24,3072)
        b=ellis_s_wave_channel(10,.5,24,3072)
        self.assertAlmostEqual(a["transmission_real"],b["transmission_real"],places=12)
        self.assertAlmostEqual(a["reflection_imag"],b["reflection_imag"],places=12)
        self.assertAlmostEqual(a["angular_frequency_rad_s"]/b["angular_frequency_rad_s"],10)

    def test_angular_and_hadamard_gate(self):
        x=ellis_s_wave_channel(1,.5,24,3072)
        self.assertEqual(x["mode"].split(";")[0],"massless minimally coupled scalar, ell=0")
        self.assertFalse(x["all_angular_modes_included"])
        self.assertFalse(x["curved_4d_qei_evaluated"])

    def test_reference_provenance(self):
        import json
        from pathlib import Path
        p=Path(__file__).resolve().parents[1]/"research"/"quantum-reference-4d.json"
        d=json.loads(p.read_text())
        self.assertIn("s00023-008-0361-0",d["sources"]["curved_absolute_qei"])
        self.assertFalse(d["ellis_hadamard_state_constructed"])
        self.assertIn("r²-",d["minkowski_expression"])

if __name__=="__main__":
    unittest.main()
