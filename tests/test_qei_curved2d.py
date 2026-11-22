"""Verify the Flanagan 2D curved-spacetime benchmark and dimensional gate."""
import json
import math
from pathlib import Path
import unittest

from phichronos.qei_curved2d import (
    _bump_first_derivative,_integrals,bump_gradient_integrals,
    curvature_at_center,curved_2d_bound,curved_2d_trial,sigma,
)
from phichronos.qei import HBAR
from phichronos.relativity import C


class TwoDimensionalCurveTests(unittest.TestCase):
    def test_coefficients_and_midpoint_independence(self):
        b=bump_gradient_integrals()
        self.assertAlmostEqual(b["I0"],0.1330861208449943,places=13)
        self.assertAlmostEqual(b["I1"],0.40958706075277,places=11)
        self.assertAlmostEqual(b["four_I1_over_I0"],12.310436524927102,places=10)
        self.assertLess(b["relative_quadrature_disagreement"],1e-10)
        self.assertAlmostEqual(_integrals(4096,"simpson")[1],_integrals(16384,"midpoint")[1],delta=1e-10)

    def test_derivative_independent_difference(self):
        a,L=0.5,100000
        for u in (0,0.2,0.4,0.7):
            h=1e-5
            bminus=math.exp(-1/(1-(u-h)**2))
            bplus=math.exp(-1/(1-(u+h)**2))
            self.assertAlmostEqual((bplus-bminus)/(2*h),_bump_first_derivative(u),delta=5e-10)

    def test_smooth_support_and_normalization(self):
        for u in (-10,-1,1,10):
            self.assertEqual(_bump_first_derivative(u),0)
        for u in (0.1,0.7):
            self.assertAlmostEqual(_bump_first_derivative(-u),-_bump_first_derivative(u),places=13)

    def test_exact_curvature_vs_metric_derivative(self):
        for a,L in ((0,1000),(.1,1e5),(.5,1e6),(.9,1e7)):
            h=1e-3*L
            finite_second=(sigma(h,a,L)-2*sigma(0,a,L)+sigma(-h,a,L))/h**2
            estimated=-2*math.exp(-2*a)*finite_second
            truth=curvature_at_center(a,L)
            self.assertAlmostEqual(estimated,truth,delta=max(abs(truth)*3e-7,1e-30))
        self.assertEqual(curvature_at_center(0,1e6),0)

    def test_static_center_geodesic(self):
        # First derivative of static lapse is zero at the center.
        a,L=.6,1e5
        h=1e-4*L
        self.assertAlmostEqual((sigma(h,a,L)-sigma(-h,a,L))/(2*h),0)
        self.assertTrue(curved_2d_bound(a,L,.01)["static_center_geodesic"])

    def test_flat_limit_and_inverse_square_sampling(self):
        r=curved_2d_bound(0,1e6,.01)
        self.assertEqual(r["ricci_scalar_m_minus2"],0)
        self.assertEqual(r["curvature_term_lower_j_per_m"],0)
        expected=-HBAR/(24*math.pi*C)*bump_gradient_integrals()["four_I1_over_I0"]/.01**2
        self.assertAlmostEqual(r["total_lower_j_per_m"]/expected,1)
        slow=curved_2d_bound(0,1e6,.1)
        self.assertAlmostEqual(r["total_lower_j_per_m"]/slow["total_lower_j_per_m"],100)

    def test_published_curved_model_references(self):
        b=curved_2d_bound(.5,1e6,.01)
        self.assertAlmostEqual(b["ricci_scalar_m_minus2"],3.6787944117144233e-13,delta=1e-24)
        self.assertAlmostEqual(b["sampling_term_lower_j_per_m"],-5.743383245349684e-40,delta=1e-50)
        self.assertAlmostEqual(b["curvature_term_lower_j_per_m"],-1.5425571662321298e-40,delta=1e-50)
        self.assertAlmostEqual(b["total_lower_j_per_m"],-7.285940411581813e-40,delta=1e-50)
        self.assertEqual(b["units"],"J/m (1+1D energy per length), NOT J/m³")
        self.assertFalse(b["applies_to_4d_wormhole"])
        self.assertIsNone(b["wormhole_qei_compliance"])

    def test_positive_curvature_makes_more_negative_bound(self):
        for L in (1e4,1e6,1e8):
            f=curved_2d_bound(0,L,.01)
            c=curved_2d_bound(.5,L,.01)
            self.assertLess(c["total_lower_j_per_m"],f["total_lower_j_per_m"])

    def test_toy_trial_not_quantum_state(self):
        model=curved_2d_bound(.5,1e6,.01)
        magnitude=abs(model["total_lower_j_per_m"])
        low=curved_2d_trial(.5,1e6,.01,magnitude*.4)
        high=curved_2d_trial(.5,1e6,.01,magnitude*1.5)
        self.assertEqual(low["trial_status"],"not_excluded_by_one_2d_bound")
        self.assertEqual(high["trial_status"],"excluded_for_selected_2d_field")
        self.assertTrue(low["trial_is_not_a_quantum_state"])
        self.assertIsNone(high["wormhole_qei_compliance"])

    def test_invalid_input_guard(self):
        for x in (-1,1.1,math.nan,math.inf):
            with self.assertRaises(ValueError):
                curved_2d_bound(x,1e6,.01)
        for length in (0,100,1e10,math.inf):
            with self.assertRaises(ValueError):
                curved_2d_bound(.5,length,.01)
        for tau in (0,-1,math.nan,1e-30,101):
            with self.assertRaises(ValueError):
                curved_2d_bound(.5,1e6,tau)
        with self.assertRaises(ValueError):
            curved_2d_trial(.5,1e6,.01,-1)
        with self.assertRaises(ValueError):
            _integrals(4095,"simpson")
        with self.assertRaises(ValueError):
            _integrals(500,"unknown")

    def test_research_evidence(self):
        d=json.loads((Path(__file__).resolve().parents[1]/"research"/"curved-qei-2d.json").read_text())
        self.assertIn("PhysRevD.66.104007",d["references"]["original"])
        self.assertIn("PhysRevD.102.129901",d["references"]["erratum"])
        self.assertFalse(d["applies_to_four_dimensional_wormhole"])


if __name__=="__main__":
    unittest.main()
