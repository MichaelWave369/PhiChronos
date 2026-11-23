"""Independent spherical angular sum, Wightman and infrared gap checks."""
import math
import json
from pathlib import Path
import unittest
from phichronos.spherical_reference import (
    spherical_bessel_j_all,legendre_all,angular_kernel,
    flat_spherical_wightman,ellis_ir_rayleigh
)


class SphericalFlatBenchmarkTests(unittest.TestCase):
    def test_low_orders_known_elementary_bessel(self):
        for z in (.001,.2,1,5,15,25):
            j=spherical_bessel_j_all(z,10)
            self.assertAlmostEqual(j[0],math.sin(z)/z,places=12)
            self.assertAlmostEqual(j[1],math.sin(z)/z**2-math.cos(z)/z,places=11)
            for l in range(1,9):
                self.assertAlmostEqual(j[l+1]-(2*l+1)/z*j[l]+j[l-1],0,delta=1e-10)
        self.assertEqual(spherical_bessel_j_all(0,10),[1]+[0]*10)

    def test_legendre_orthogonality_anchor(self):
        p=legendre_all(.4,4)
        self.assertAlmostEqual(p[0],1)
        self.assertAlmostEqual(p[1],.4)
        self.assertAlmostEqual(p[2],(3*.4**2-1)/2)

    def test_spherical_addition_theorem_against_sinc(self):
        a,b,mu=.7,.9,.4
        d=math.sqrt(a*a+b*b-2*a*b*mu)
        for k in (.01,.1,1,5,15,30):
            expected=math.sin(k*d)/(k*d)
            got=angular_kernel(k,a,b,mu,40)
            self.assertAlmostEqual(got,expected,delta=2e-10)
        self.assertEqual(angular_kernel(0,a,b,mu,32),1)

    def test_coincident_spherical_completeness_sum(self):
        for z in (.1,1,5,15):
            j=spherical_bessel_j_all(z,40)
            self.assertAlmostEqual(sum((2*l+1)*t*t for l,t in enumerate(j)),1,delta=2e-11)

    def test_spatial_origin_only_s_wave(self):
        for k in (.5,5,25):
            j0=math.sin(k*.6)/(k*.6)
            self.assertAlmostEqual(angular_kernel(k,0,.6,-.4,24),j0,delta=1e-10)

    def test_spherical_wightman_reconstructs_flat_4d(self):
        examples=[(.7,.9,.4,.3,.5),(.5,.8,-.3,0,.6),(.4,.6,.8,-.3,.4)]
        for a,b,mu,ct,eps in examples:
            with self.subTest(a=a,b=b,mu=mu):
                v=flat_spherical_wightman(a,b,mu,ct,eps,24,80,1024)
                self.assertLess(v["partial_wave_vs_analytic_absolute_inverse_m2"],1e-6)
                self.assertLess(v["partial_wave_vs_direct_absolute_inverse_m2"],1e-6)
                self.assertLess(v["direct_spectral_vs_analytic_absolute_inverse_m2"],1e-6)
                self.assertFalse(v["ellis_hadamard_property_verified"])

    def test_angular_cutoff_convergence(self):
        kwargs=dict(radius1_m=.7,radius2_m=.9,cos_angle=.4,delta_ct_m=.3,epsilon_m=.5,
                    k_cutoff_per_m=80,steps=512)
        low=flat_spherical_wightman(ell_max=4,**kwargs)
        mid=flat_spherical_wightman(ell_max=10,**kwargs)
        high=flat_spherical_wightman(ell_max=24,**kwargs)
        self.assertGreater(low["partial_wave_vs_analytic_absolute_inverse_m2"],
                           mid["partial_wave_vs_analytic_absolute_inverse_m2"])
        self.assertGreater(mid["partial_wave_vs_analytic_absolute_inverse_m2"],
                           high["partial_wave_vs_analytic_absolute_inverse_m2"])

    def test_input_domain_checks(self):
        with self.assertRaises(ValueError):spherical_bessel_j_all(-1,2)
        with self.assertRaises(ValueError):spherical_bessel_j_all(1,True)
        with self.assertRaises(ValueError):legendre_all(2,4)
        with self.assertRaises(ValueError):angular_kernel(-1,1,1,0,10)
        with self.assertRaises(ValueError):flat_spherical_wightman(3,1,0,0,.5)
        with self.assertRaises(ValueError):flat_spherical_wightman(1,1,0,0,.5,41)


class InfraredVariationalTests(unittest.TestCase):
    def test_nonnegative_and_tending_zero(self):
        values=[ellis_ir_rayleigh(1,w) for w in (1,2,4,8,16,32,64)]
        self.assertEqual([v["rayleigh_quotient_inverse_m2"] for v in values],
                         sorted([v["rayleigh_quotient_inverse_m2"] for v in values],reverse=True))
        self.assertLess(values[-1]["rayleigh_quotient_inverse_m2"],
                        values[0]["rayleigh_quotient_inverse_m2"]/1000)
        for v in values:
            self.assertTrue(v["grad_energy_quadratic_form_nonnegative"])
            self.assertFalse(v["positive_uniform_spectral_gap"])
            self.assertFalse(v["hadamard_state_nonexistence_inferred"])
            self.assertFalse(v["ellis_quantum_state_constructed"])

    def test_no_uniform_positive_lower_spectral_gap(self):
        vals=[ellis_ir_rayleigh(.1,w)["dimensionless_width_scaled_quotient"]
              for w in (1,10,100,1000)]
        self.assertLess(max(vals)-min(vals),1e-5)
        self.assertAlmostEqual(vals[-1],3.08496509,delta=1e-5)
        a=ellis_ir_rayleigh(1,10)
        b=ellis_ir_rayleigh(1,20)
        self.assertAlmostEqual(a["rayleigh_quotient_inverse_m2"]/
                               b["rayleigh_quotient_inverse_m2"],4,delta=.001)

    def test_ir_domain_guards(self):
        for w in (-1,0,1e10,float("inf")):
            with self.assertRaises(ValueError):ellis_ir_rayleigh(1,w)
        with self.assertRaises(ValueError):ellis_ir_rayleigh(1,10,center_widths=2)

    def test_research_manifest(self):
        record=json.loads((Path(__file__).resolve().parents[1]/"research"/"spherical-qft-calibration.json").read_text())
        self.assertFalse(record["ellis_hadamard_state_proven"])
        self.assertIn("DLMF",record["sources"]["bessel_reference"])


if __name__=="__main__":
    unittest.main()
