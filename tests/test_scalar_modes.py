"""Independent low-k analytic, barrier analytic and Wronskian checks."""
import math
import unittest
from phichronos.scalar_modes import (
    dimensionless_potential,scalar_mode_potential,
    s_wave_scattering,LOW_K_COEFFICIENT,
    square_barrier_reference,square_barrier_numerical,
)


class ScalarModeTests(unittest.TestCase):
    def test_mode_potential_exact_radial_components(self):
        for ell in range(5):
            self.assertEqual(dimensionless_potential(0,ell),ell*(ell+1)+1)
            self.assertEqual(dimensionless_potential(2,ell),ell*(ell+1)/5+1/25)
            self.assertEqual(dimensionless_potential(-2,ell),dimensionless_potential(2,ell))
            self.assertGreater(dimensionless_potential(10,ell),0)

    def test_physical_throat_radius_scaling_and_dimensions(self):
        for ell in (0,1,3):
            a=scalar_mode_potential(1,0,ell)
            b=scalar_mode_potential(10,0,ell)
            self.assertAlmostEqual(a/b,100)
            self.assertAlmostEqual(a,ell*(ell+1)+1)

    def test_positivity_of_fixed_background_radial_operator(self):
        for ell in range(9):
            for x in (0,0.2,1,2,5,10,30,80):
                self.assertGreater(dimensionless_potential(x,ell),0)
        # For smooth, square-integrable radial trial modes,
        # <u,Hu>=int(|u'|² + V|u|²)dl >= 0.
        # This does not prove stability of a *coupled gravitational* wormhole.

    def test_low_k_paper_asymptotic(self):
        self.assertAlmostEqual(LOW_K_COEFFICIENT,4/math.pi**2)
        q=.03
        r=s_wave_scattering(1,q,extent=36,steps=5000)
        self.assertAlmostEqual(r["transmission"]/q**2,4/math.pi**2,delta=0.02)
        self.assertLess(r["transmission"],.001)
        self.assertGreater(r["reflection"],.999)
        self.assertAlmostEqual(r["low_frequency_transmission_asymptotic"],4/math.pi**2*q*q)

    def test_ordered_transmission_and_conservation(self):
        vals=[]
        for k in (.05,.2,.5,1.0,2.0):
            r=s_wave_scattering(2,k,extent=32,steps=4096)
            vals.append(r["transmission"])
            self.assertLess(r["wronskian_residual"],3e-6)
            self.assertLess(r["flux_residual"],3e-6)
            self.assertGreaterEqual(r["reflection"],0)
            self.assertGreaterEqual(r["transmission"],0)
            self.assertLessEqual(r["transmission"],1.00001)
            self.assertFalse(r["curved_4d_qei_evaluated"])
            self.assertFalse(r["semiclassical_backreaction_solved"])
        self.assertEqual(vals,sorted(vals))
        self.assertGreater(vals[-1],.99)

    def test_geometry_scaling(self):
        a=s_wave_scattering(1,.5,extent=24,steps=3500)
        b=s_wave_scattering(10,.5,extent=24,steps=3500)
        self.assertAlmostEqual(a["transmission"],b["transmission"],places=10)
        self.assertAlmostEqual(a["frequency_hz"]/b["frequency_hz"],10)

    def test_finite_window_convergence(self):
        a=s_wave_scattering(1,.5,extent=24,steps=3500)
        b=s_wave_scattering(1,.5,extent=36,steps=5000)
        self.assertAlmostEqual(a["transmission"],b["transmission"],delta=6e-4)
        self.assertLess(b["tail_potential_dimensionless"],a["tail_potential_dimensionless"])

    def test_independent_square_barrier_analytic(self):
        for k,height in ((.5,.8),(1.1,.8),(2,.8),(1.2,0)):
            exact=square_barrier_reference(k,height,8)
            numeric=square_barrier_numerical(k,height,8,steps=5000)
            self.assertAlmostEqual(numeric["transmission"],exact,delta=2e-6)
            self.assertLess(numeric["flux_residual"],1e-6)
            self.assertLess(numeric["wronskian_residual"],1e-6)

    def test_input_guards(self):
        with self.assertRaises(ValueError):dimensionless_potential(0,True)
        with self.assertRaises(ValueError):dimensionless_potential(0,9)
        with self.assertRaises(ValueError):dimensionless_potential(float("nan"),0)
        with self.assertRaises(ValueError):scalar_mode_potential(-1,0,0)
        with self.assertRaises(ValueError):s_wave_scattering(1,0)
        with self.assertRaises(ValueError):s_wave_scattering(1,9)
        with self.assertRaises(ValueError):s_wave_scattering(1,.5,steps=33)
        with self.assertRaises(ValueError):square_barrier_reference(1,-1,8)

    def test_provenance(self):
        import json
        from pathlib import Path
        f=Path(__file__).resolve().parents[1]/"research"/"scalar-scattering-4d.json"
        d=json.loads(f.read_text(encoding="utf-8"))
        self.assertIn("08668-3",d["sources"]["s_wave_transmission"])
        self.assertFalse(d["quantum_energy_inequality_evaluated"])
        self.assertIn("4/pi",d["analytic_low_frequency_power_coefficient"])

if __name__=="__main__":
    unittest.main()
